import { createGzip } from "zlib";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Backup } from "../models/backup.model.js";
import { Volume } from "../models/volume.model.js";
import { Instance } from "../models/instance.model.js";
import { s3 } from "../configs/S3/index.js";
import { docker } from "../configs/docker/index.js";

const BUCKET = process.env.AWS_S3_BUCKET;
const HELPER_IMAGE = "alpine:3.19";

const toggleLock = async (id, state) => {
  const [updated] = await Instance.update(
    { is_locked: state, locked_at: state ? new Date() : null },
    { where: { id, is_locked: !state } }
  );
  if (state && !updated) throw new Error("Instance is locked.");
};

async function ensureImage(imageName) {
  try {
    const image = docker.getImage(imageName);
    await image.inspect();
  } catch (error) {
    return new Promise((resolve, reject) => {
      docker.pull(imageName, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (onFinishedErr, output) => {
          if (onFinishedErr) return reject(onFinishedErr);
          resolve(output);
        });
      });
    });
  }
}

async function runContainer(cmd, mounts, wait = false) {
  await ensureImage(HELPER_IMAGE);
  const container = await docker.createContainer({
    Image: HELPER_IMAGE,
    Cmd: cmd,
    HostConfig: { Binds: mounts },
  });
  
  await container.start();
  
  if (wait) {
    await container.wait();
  }
  
  return container;
}

async function createBackup({ username, instanceId }) {
  await toggleLock(instanceId, true);
  let helperContainer = null;
  
  try {
    const vol = await Volume.findOne({ where: { instance_id: instanceId } });
    const instance = await Instance.findByPk(instanceId);
    
    const targetContainer = docker.getContainer(instance.name);
    
    const containerInfo = await targetContainer.inspect().catch(() => null);
    const wasRunning = containerInfo?.State?.Running === true;

    await targetContainer.stop().catch(() => { });

    const key = `workspace-backups/${username}/${Date.now()}.tar.gz`;

    helperContainer = await runContainer(["sleep", "300"], [`${vol.volume_name}:/workspace:ro`]);

    const archiveStream = await helperContainer.getArchive({ path: "/workspace" });
    
    await new Upload({
      client: s3, 
      params: { Bucket: BUCKET, Key: key, Body: archiveStream.pipe(createGzip()) }
    }).done();

    await Backup.create({ instance_id: instanceId, volume_id: vol.id, object_path: key, size_mb: 0 });
    await instance.update({ last_backup_at: new Date() });
    await enforceBackupLimit(instanceId);
    
    if (wasRunning) {
      await targetContainer.start().catch(() => { });
    }
  } finally {
    if (helperContainer) await helperContainer.remove({ force: true }).catch(() => { });
    await toggleLock(instanceId, false);
  }
}

async function restoreBackup({ backupId, instanceId }) {
  await toggleLock(instanceId, true);
  let helperContainer = null;
  
  try {
    const backup = await Backup.findByPk(backupId);
    const vol = await Volume.findOne({ where: { instance_id: instanceId } });
    const instance = await Instance.findByPk(instanceId);
    
    const targetContainer = docker.getContainer(instance.name);

    const containerInfo = await targetContainer.inspect().catch(() => null);
    const wasRunning = containerInfo?.State?.Running === true;

    await targetContainer.stop().catch(() => { });

    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: backup.object_path }), { expiresIn: 300 });

    const cmd = `find /workspace -mindepth 1 -delete && wget -qO- "${url}" | tar xz -C /workspace --strip-components=1`;

    helperContainer = await runContainer(["sh", "-c", cmd], [`${vol.volume_name}:/workspace:rw`], true);
    
    if (wasRunning) {
      await targetContainer.start().catch(() => { });
    }
  } finally {
    if (helperContainer) await helperContainer.remove({ force: true }).catch(() => { });
    await toggleLock(instanceId, false);
  }
}

async function enforceBackupLimit(instanceId) {
  const backups = await Backup.findAll({ where: { instance_id: instanceId }, order: [["created_at", "DESC"]] });
  if (backups.length > 7) {
    for (const b of backups.slice(7)) await deleteBackup({ backupId: b.id });
  }
}

async function listBackups({ instanceId }) {
  return Backup.findAll({ where: { instance_id: instanceId }, order: [["created_at", "DESC"]] });
}

async function deleteBackup({ backupId }) {
  const b = await Backup.findByPk(backupId);
  if (b) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: b.object_path })).catch(() => { });
    await b.destroy();
  }
}

export { createBackup, restoreBackup, enforceBackupLimit, listBackups, deleteBackup };
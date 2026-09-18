import { docker } from "../configs/docker/index.js";
import { Plan } from "../models/plan.model.js";
import { Instance } from "../models/instance.model.js";
import { Volume } from "../models/volume.model.js";

function buildInstancePayload({
  instanceName,
  volumeName,
  subdomain,
  password,
  cpu,
  memory,
  pidsLimit = 256,
  network,
  image,
}) {
  const memoryBytes = Math.floor(memory * 1024 * 1024);
  return {
    Image: image,
    Env: [
      "PUID=1000",
      "PGID=1000",
      `PASSWORD=${password}`,
      `SUDO_PASSWORD=${password}`,
      "DEFAULT_WORKSPACE=/workspace",
    ],
    HostConfig: {
      NetworkMode: network,
      Binds: [`${volumeName}:/workspace`],
      RestartPolicy: { Name: "unless-stopped" },
      NanoCpus: Math.floor(cpu * 1_000_000_000), 
      Memory: memoryBytes,
      MemorySwap: memoryBytes, 
      PidsLimit: pidsLimit,
    },
    Labels: {
      "traefik.enable": "true",
      [`traefik.http.routers.${instanceName}.rule`]: `Host(\`${subdomain}\`)`,
      [`traefik.http.routers.${instanceName}.entrypoints`]: "web",
      [`traefik.http.services.${instanceName}.loadbalancer.server.port`]: "8443",
      app: "kodebox",
    },
  };
}

async function createVolume(name) {
  return docker.createVolume({ Name: name });
}

async function removeVolume(name) {
  const volume = docker.getVolume(name);
  return volume.remove();
}

async function createInstance(cfg) {
  const container = await docker.createContainer({
    name: cfg.instanceName,
    ...buildInstancePayload(cfg)
  });
  return container.id;
}

async function startInstance(containerIdentifier) {
  const container = docker.getContainer(containerIdentifier);
  return container.start();
}

async function stopInstance(containerIdentifier) {
  const container = docker.getContainer(containerIdentifier);
  return container.stop();
}

async function removeInstance(containerIdentifier) {
  const container = docker.getContainer(containerIdentifier);
  return container.remove({ force: true });
}

async function execInContainer(containerIdentifier, cmd) {
  const container = docker.getContainer(containerIdentifier);
  
  const exec = await container.exec({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: cmd,
    Tty: false,
  });

  return new Promise((resolve, reject) => {
    exec.start({ Detach: false, Tty: false }, (err, stream) => {
      if (err) return reject(err);
      stream.on("end", resolve);
      stream.on("error", reject);
      stream.resume(); 
    });
  });
}

async function createAndRunInstance(cfg) {
  const id = await createInstance(cfg);
  await startInstance(id);

  await execInContainer(id, [
    "sh",
    "-c",
    `
    if [ -d "/workspace" ]; then
      chown -R 1000:1000 /workspace || true
    fi
    `
  ]).catch((err) => {
    console.error("Workspace chown failed:", err);
  });

  return id;
}

/**
 * Dynamically updates an existing container's resources.
 */
async function updateInstanceResources(containerIdentifier, cpu, memory) {
  const container = docker.getContainer(containerIdentifier);
  const memoryBytes = Math.floor(memory * 1024 * 1024);
  
  return container.update({
    NanoCpus: Math.floor(cpu * 1_000_000_000),
    Memory: memoryBytes,
    MemorySwap: memoryBytes
  });
}

/**
 * Synchronizes a user's database plan with their actual Docker container.
 */
async function syncInstanceResourcesWithPlan(userId, planId) {
  try {
    const plan = await Plan.findByPk(planId);
    if (!plan) return;

    const instance = await Instance.findOne({ where: { user_id: userId } });
    if (!instance) return;

    if (instance.status !== "deleted") {
      try {
        await updateInstanceResources(instance.name, plan.cpu_limit, plan.memory_limit_mb);
        
      } catch (err) {
        console.error(`[SYNC ERROR] Failed to update Docker resources for ${instance.name}:`, err.message);
      }
    }

    const volume = await Volume.findOne({ where: { instance_id: instance.id } });
    if (volume) {
      volume.size_limit_mb = plan.disk_limit_mb;
      await volume.save();
    }

    if (!plan.is_backup_allowed && instance.backup_frequency !== "manual") {
      instance.backup_frequency = "manual";
      await instance.save();
    }
  } catch (error) {
    console.error("[SYNC FATAL ERROR] Container sync failed:", error);
  }
}

export {
  buildInstancePayload,
  createVolume,
  removeVolume,
  createInstance,
  startInstance,
  stopInstance,
  removeInstance,
  createAndRunInstance,
  execInContainer,
  updateInstanceResources,
  syncInstanceResourcesWithPlan
};
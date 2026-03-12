// controllers/instance.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";
import { Plan } from "../models/plan.model.js";
import { Instance } from "../models/instance.model.js";

import { Volume } from "../models/volume.model.js";

import {
  createAndRunInstance,
  startInstance,
  stopInstance,
  removeInstance,
  execInContainer
} from "../utils/instance.util.js";



const IMAGE_NAME =
  process.env.INSTANCE_IMAGE || "lscr.io/linuxserver/code-server:latest";
const NETWORK_NAME = process.env.DOCKER_NETWORK || "kodebox-net";

function buildInstanceName(username) {
  return `${username}-kodebox`;
}

function buildSubdomain(username) {
  return `${username}-kodebox.prathamesh.site`;
}

function buildPassword(username, userId) {
  return `${username}@${userId}`;
}


const LOCK_STALE_MS = Number(process.env.INSTANCE_LOCK_TTL_MS || 15 * 60 * 1000);

async function ensureNotLocked(instance) {

  if (!instance) return;


  if (!instance.is_locked) return;


  const lockedAt = instance.locked_at ? new Date(instance.locked_at) : null;
  const now = Date.now();


  if (!lockedAt || now - lockedAt.getTime() > LOCK_STALE_MS) {
    try {

      await Instance.update(
        { is_locked: false, locked_at: null },
        { where: { id: instance.id, is_locked: true } }
      );
      return;
    } catch (err) {

      throw new ApiError(423, "Instance is currently locked. Try again later.");
    }
  }


  throw new ApiError(423, "Instance is currently locked. Try again later.");
}



const createInstance = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const user = await User.findByPk(authUser.id);
  if (!user) throw new ApiError(404, "User not found");

  const plan = await Plan.findByPk(user.plan_id);
  if (!plan) throw new ApiError(400, "Invalid plan");

  const instanceName = buildInstanceName(user.username);
  const subdomain = buildSubdomain(user.username);
  const password = buildPassword(user.username, user.id);


  let instance = await Instance.findOne({
    where: { user_id: user.id }
  });


  if (instance) await ensureNotLocked(instance);

  if (instance && instance.status !== "deleted") {
    throw new ApiError(409, "Instance already exists for this user");
  }

  try {
    await createAndRunInstance({
      instanceName,
      volumeName: `${user.username}-workspace`,
      subdomain,
      password,
      cpu: plan.cpu_limit,
      memory: plan.memory_limit_mb,
      network: NETWORK_NAME,
      image: IMAGE_NAME
    });
  } catch (err) {
    await removeInstance(instanceName).catch(() => { });
    throw new ApiError(500, "Failed to create instance");
  }


  if (instance) {
    instance.name = instanceName;
    instance.image_name = IMAGE_NAME;
    instance.instance_password = password;
    instance.network_name = NETWORK_NAME;
    instance.status = "running";
    await instance.save();
  } else {

    instance = await Instance.create({
      user_id: user.id,
      name: instanceName,
      image_name: IMAGE_NAME,
      instance_password: password,
      status: "running",
      network_name: NETWORK_NAME
    });
  }




  const volumeName = `${user.username}-workspace`;

  const existingVolume = await Volume.findOne({
    where: { instance_id: instance.id }
  });

  if (!existingVolume) {
    await Volume.create({
      volume_name: volumeName,
      instance_id: instance.id,
      mount_path: "/workspace",
      size_limit_mb: plan.disk_limit_mb
    });
  }




  return res.status(201).json(
    new ApiResponse({
      message: "Instance created",
      data: {
        hasInstance: true,
        url: `https://${subdomain}`,
        username: user.username,
        password,
        status: instance.status
      }
    })
  );
});



const deleteInstance = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const instance = await Instance.findOne({
    where: { user_id: authUser.id, status: ["running", "stopped"] }
  });

  if (!instance || instance.status === "deleted") {


    return res.json(new ApiResponse({ message: "No instance to delete", data: { hasInstance: false } }));
  }


  await ensureNotLocked(instance);

  await stopInstance(instance.name).catch(() => { });
  await removeInstance(instance.name).catch(() => { });

  instance.status = "deleted";
  await instance.save();

  return res.json(new ApiResponse({ message: "Instance deleted", data: { hasInstance: false } }));
});



const startInstanceController = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const instance = await Instance.findOne({
    where: { user_id: authUser.id }
  });

  if (!instance || instance.status === "deleted") {
    throw new ApiError(404, "No instance found to start");
  }


  if (instance.status === "running") {
    return res.json(
      new ApiResponse({
        message: "Instance already running",
        data: {
          hasInstance: true,
          url: `https://${buildSubdomain(req.user.username)}`,
          status: instance.status
        }
      })
    );
  }


  await ensureNotLocked(instance);


  try {
    await startInstance(instance.name);
    instance.status = "running";
    await instance.save();
  } catch (err) {

    await removeInstance(instance.name).catch(() => { });

    instance.status = "deleted";
    await instance.save().catch(() => { });
    throw new ApiError(500, "Failed to start instance");
  }

  return res.json(
    new ApiResponse({
      message: "Instance started",
      data: {
        hasInstance: true,
        url: `https://${buildSubdomain(req.user.username)}`,
        status: instance.status
      }
    })
  );
});


const stopInstanceController = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const instance = await Instance.findOne({
    where: { user_id: authUser.id }
  });

  if (!instance || instance.status === "deleted") {

    return res.json(new ApiResponse({ message: "No running instance", data: { hasInstance: false } }));
  }


  if (instance.status !== "running") {
    return res.json(new ApiResponse({
      message: "Instance is not running",
      data: { hasInstance: true, status: instance.status }
    }));
  }


  await ensureNotLocked(instance);


  try {
    await stopInstance(instance.name);
    instance.status = "stopped";
    await instance.save();
  } catch (err) {

    throw new ApiError(500, "Failed to stop instance");
  }

  return res.json(new ApiResponse({ message: "Instance stopped", data: { hasInstance: true, status: instance.status } }));
});


const resetWorkspace = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const instance = await Instance.findOne({
    where: { user_id: req.user.id, status: "running" }
  });

  if (!instance) throw new ApiError(404, "Instance not running");


  await ensureNotLocked(instance);

  await execInContainer(instance.name, [
    "sh",
    "-lc",
    "rm -rf /workspace/* && sync"
  ]);

  return res.json(new ApiResponse({ message: "Workspace reset", data: { hasInstance: true, status: instance.status } }));
});



const getInstanceLink = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const instance = await Instance.findOne({
    where: { user_id: req.user.id }
  });

  if (!instance || instance.status === "deleted") {

    return res.json(
      new ApiResponse({
        data: {
          hasInstance: false
        }
      })
    );
  }


  const isRunning = instance.status === "running";
  return res.json(
    new ApiResponse({
      hasInstance: true,
      status: instance.status,
      url: isRunning ? `https://${buildSubdomain(req.user.username)}` : null,
      workspace_password: instance.instance_password
    })
  );
});



const updateBackupSettings = asyncHandler(async (req, res) => {
  const authUser = req.user;
  if (!authUser?.id) throw new ApiError(401, "Unauthorized");

  const { frequency } = req.body;

  if (!["manual", "monthly"].includes(frequency)) {
    throw new ApiError(400, "Invalid backup frequency. Choose 'manual' or 'monthly'.");
  }

  const user = await User.findByPk(authUser.id);
  const plan = await Plan.findByPk(user.plan_id);

  //Prevent free tier from enabling monthly auto-backups
  if (frequency === "monthly" && !plan.is_backup_allowed) {
    throw new ApiError(403, "Your current plan does not allow automated backups.");
  }

  const instance = await Instance.findOne({
    where: { user_id: authUser.id }
  });

  if (!instance || instance.status === "deleted") {
    throw new ApiError(404, "No active instance found.");
  }

  instance.backup_frequency = frequency;
  await instance.save();

  return res.json(
    new ApiResponse(200, { backup_frequency: instance.backup_frequency }, "Backup settings updated successfully")
  );
});


export {
  createInstance,
  deleteInstance,
  startInstanceController,
  stopInstanceController,
  resetWorkspace,
  getInstanceLink,
  updateBackupSettings
};




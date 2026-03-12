import { config } from "dotenv";
config();

import validator from "validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Instance } from "../models/instance.model.js";
import { Backup } from "../models/backup.model.js";

import {
  createBackup as createBackupUtil,
  restoreBackup as restoreBackupUtil,
  listBackups as listBackupsUtil,
  deleteBackup as deleteBackupUtil,
} from "../utils/backup.util.js";



const getUserInstance = async (userId) => {
  const instance = await Instance.findOne({
    where: { user_id: userId },
  });

  if (!instance) {
    throw new ApiError(404, "Instance not found");
  }

  return instance;
};


const createBackup = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const instance = await getUserInstance(userId);

  const backup = await createBackupUtil({
    username: req.user.username,
    instanceId: instance.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, backup, "Backup created successfully"));
});


const listBackups = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const instance = await getUserInstance(userId);

  const backups = await listBackupsUtil({
    instanceId: instance.id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, backups, "Backups fetched successfully"));
});


const getBackup = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const backupId = req.params.backupId;

  if (!backupId || !validator.isInt(String(backupId), { min: 1 })) {
    throw new ApiError(400, "Invalid backupId");
  }

  const instance = await getUserInstance(userId);

  const backup = await Backup.findByPk(backupId);
  if (!backup) throw new ApiError(404, "Backup not found");

  if (backup.instance_id !== instance.id) {
    throw new ApiError(403, "Forbidden");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, backup, "Backup fetched successfully"));
});


const restoreBackup = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const backupId = req.params.backupId;

  if (!backupId || !validator.isInt(String(backupId), { min: 1 })) {
    throw new ApiError(400, "Invalid backupId");
  }

  const instance = await getUserInstance(userId);

  const backup = await Backup.findByPk(backupId);
  if (!backup) throw new ApiError(404, "Backup not found");

  if (backup.instance_id !== instance.id) {
    throw new ApiError(403, "Forbidden");
  }

  await restoreBackupUtil({
    backupId: Number(backupId),
    instanceId: instance.id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Restore started successfully"));
});


const deleteBackup = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const backupId = req.params.backupId;

  if (!backupId || !validator.isInt(String(backupId), { min: 1 })) {
    throw new ApiError(400, "Invalid backupId");
  }

  const instance = await getUserInstance(userId);

  const backup = await Backup.findByPk(backupId);
  if (!backup) throw new ApiError(404, "Backup not found");

  if (backup.instance_id !== instance.id) {
    throw new ApiError(403, "Forbidden");
  }

  await deleteBackupUtil({ backupId: Number(backupId) });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Backup deleted successfully"));
});

export {
  createBackup,
  listBackups,
  getBackup,
  restoreBackup,
  deleteBackup,
};

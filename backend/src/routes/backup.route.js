import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

import {
  createBackup,
  listBackups,
  getBackup,
  restoreBackup,
  deleteBackup,
} from "../controllers/backup.controller.js";

const backupRouter = Router();

backupRouter.use(isAuthenticated);

backupRouter.post("/instance/backups", createBackup);

backupRouter.get("/instance/backups", listBackups);

backupRouter.post("/instance/backups/:backupId/restore", restoreBackup);

backupRouter.get("/backups/:backupId", getBackup);

backupRouter.delete("/backups/:backupId", deleteBackup);

export { backupRouter };
import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

import {
  createInstance,
  deleteInstance,
  startInstanceController,
  stopInstanceController,
  resetWorkspace,
  getInstanceLink,
  updateBackupSettings
} from "../controllers/instance.controller.js";

const instanceRouter = Router();

instanceRouter.use(isAuthenticated);


instanceRouter.post("/", createInstance);

instanceRouter.delete("/", deleteInstance);

instanceRouter.post("/start", startInstanceController);

instanceRouter.post("/stop", stopInstanceController);

instanceRouter.post("/reset-workspace", resetWorkspace);

instanceRouter.get("/link", getInstanceLink);

instanceRouter.patch("/backup-settings", updateBackupSettings);

export { instanceRouter };
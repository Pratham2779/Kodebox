import { Router } from "express";
import {
    createSubscription,
    verifySubscription,
    getMySubscription
} from "../controllers/subscription.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.use(isAuthenticated);

subscriptionRouter.post("/create", createSubscription);

subscriptionRouter.post("/verify", verifySubscription);

subscriptionRouter.get("/current", getMySubscription);

export { subscriptionRouter };
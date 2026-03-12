import { Router } from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller.js";

const razorpayWebhookRouter = Router();

// Note: No auth middleware here. Razorpay calls this server-to-server.
// Validation is done via the Signature in the controller.
razorpayWebhookRouter.post("/razorpay", handleRazorpayWebhook);

export { razorpayWebhookRouter };
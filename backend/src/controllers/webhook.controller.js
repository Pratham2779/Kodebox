import crypto from "crypto";
import { Subscription } from "../models/subscription.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { Plan } from "../models/plan.model.js";
import { syncInstanceResourcesWithPlan } from "../utils/instance.util.js";

const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    console.error("[WEBHOOK ERROR] Missing x-razorpay-signature header");
    return res.status(400).json({ status: "failed", message: "No signature" });
  }

  try {
    const bodyString = req.body.toString('utf8');

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(bodyString);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("[WEBHOOK ERROR] Signature mismatch! Check your RAZORPAY_WEBHOOK_SECRET in .env");
      return res.status(400).json({ status: "failed", message: "Invalid signature" });
    }

    const parsedBody = JSON.parse(bodyString);
    const event = parsedBody.event;
    const payload = parsedBody.payload;

    console.log(`[WEBHOOK] Received verified event: ${event}`);

    if (event === "subscription.charged") {
      const subEntity = payload.subscription.entity;
      const paymentEntity = payload.payment.entity;

      const userId = subEntity.notes?.user_id;
      const planId = subEntity.notes?.internal_plan_id;

      if (!userId || !planId) {
        console.warn("[WEBHOOK WARNING] Missing user_id or plan_id in notes. Ignoring.");
        return res.status(200).json({ status: "ignored" });
      }

      const currentStart = new Date(subEntity.current_start * 1000);
      const currentEnd = new Date(subEntity.current_end * 1000);

      let subscription = await Subscription.findOne({
        where: { razorpay_subscription_id: subEntity.id },
      });

      if (!subscription) {
        subscription = await Subscription.create({
          user_id: userId,
          plan_id: planId,
          status: "active",
          razorpay_subscription_id: subEntity.id,
          start_at: currentStart,
          end_at: currentEnd,
        });
      } else {
        subscription.end_at = currentEnd;
        subscription.status = "active";
        subscription.plan_id = planId;
        await subscription.save();
      }

      const existingPayment = await Payment.findOne({
        where: { razorpay_payment_id: paymentEntity.id }
      });

      if (!existingPayment) {
        await Payment.create({
          subscription_id: subscription.id,
          razorpay_payment_id: paymentEntity.id,
          amount: paymentEntity.amount / 100,
          status: "success",
          paid_at: new Date(),
        });
      }

      await User.update({ plan_id: planId }, { where: { id: userId } });
      await syncInstanceResourcesWithPlan(userId, planId);
      
      console.log(`[WEBHOOK SUCCESS] Upgraded User ${userId} to Plan ${planId}`);

    } 
    else if (event === "subscription.halted" || event === "subscription.cancelled") {
      const subEntity = payload.subscription.entity;

      const subscription = await Subscription.findOne({
        where: { razorpay_subscription_id: subEntity.id },
      });

      if (subscription) {
        subscription.status = "expired";
        await subscription.save();

        const freePlan = await Plan.findOne({ where: { name: "Free" } });
        const freePlanId = freePlan ? freePlan.id : 1;

        await User.update({ plan_id: freePlanId }, { where: { id: subscription.user_id } });
        await syncInstanceResourcesWithPlan(subscription.user_id, freePlanId);
        
        console.log(`[WEBHOOK DOWNGRADE] Downgraded User ${subscription.user_id} to Free Plan`);
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[WEBHOOK FATAL ERROR]:", error);
    res.status(200).json({ status: "error_logged" }); 
  }
};

export { handleRazorpayWebhook };
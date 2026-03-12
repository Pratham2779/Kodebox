import { razorpay } from "../configs/razorpay/index.js";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Plan } from "../models/plan.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Payment } from "../models/payment.model.js";
import { sequelize } from "../configs/db/index.js";
import { Op } from "sequelize";
import { syncInstanceResourcesWithPlan } from "../utils/instance.util.js";

const getRazorpayCustomerId = async (user) => {
  if (user.razorpay_customer_id) return user.razorpay_customer_id;
  try {
    const existingCustomers = await razorpay.customers.all({ email: user.email, count: 1 });
    let customerId;
    if (existingCustomers.items && existingCustomers.items.length > 0) {
      customerId = existingCustomers.items[0].id;
    } else {
      const newCustomer = await razorpay.customers.create({
        name: user.full_name,
        contact: String(user.phone_number),
        email: user.email,
        notes: { user_id: String(user.id) },
      });
      customerId = newCustomer.id;
    }
    user.razorpay_customer_id = customerId;
    await user.save();
    return customerId;
  } catch (error) {
    throw new ApiError(500, `Payment Setup Failed: ${error.message}`);
  }
};

const createSubscription = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  if (!planId) throw new ApiError(400, "Plan ID is required");

  const targetPlan = await Plan.findByPk(planId);
  if (!targetPlan || targetPlan.price === 0) throw new ApiError(400, "Invalid plan selection.");

  const activeSub = await Subscription.findOne({
    where: { user_id: userId, status: "active", end_at: { [Op.gt]: new Date() } },
    include: [{ model: Plan, as: 'Plan', attributes: ['name'] }]
  });

  if (activeSub) {
    throw new ApiError(400, `You already have an active ${activeSub.Plan.name} plan.`);
  }

  const user = await User.findByPk(userId);
  const customerId = await getRazorpayCustomerId(user);

  try {
    const subscriptionOptions = {
      plan_id: targetPlan.razorpay_plan_id,
      customer_id: customerId,
      total_count: 6,
      quantity: 1,
      addons: [],
      notes: {
        user_id: String(userId),
        internal_plan_id: String(planId),
      },
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);

    return res.status(200).json(new ApiResponse(200, {
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      plan_name: targetPlan.name,
      amount: targetPlan.price,
    }, "Subscription initiated"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to initiate subscription");
  }
});

const verifySubscription = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification details");
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature. Trust denied.");
  }

  const transaction = await sequelize.transaction();

  try {
    let subDetails;
    try {
      subDetails = await razorpay.subscriptions.fetch(razorpay_subscription_id);
    } catch (e) {
      throw new ApiError(500, "Unable to verify subscription status");
    }

    const planId = subDetails.notes.internal_plan_id;
    const startDate = new Date(subDetails.current_start * 1000);
    const endDate = new Date(subDetails.current_end * 1000);
    const plan = await Plan.findByPk(planId);

    let subscription = await Subscription.findOne({ where: { razorpay_subscription_id }, transaction });

    if (!subscription) {
      subscription = await Subscription.create({
        user_id: userId,
        plan_id: planId,
        status: "active",
        razorpay_subscription_id: razorpay_subscription_id,
        start_at: startDate,
        end_at: endDate,
      }, { transaction });
    } else {
      subscription.status = "active";
      subscription.end_at = endDate;
      subscription.plan_id = planId;
      await subscription.save({ transaction });
    }

    const existingPayment = await Payment.findOne({ where: { razorpay_payment_id }, transaction });
    if (!existingPayment) {
      await Payment.create({
        subscription_id: subscription.id,
        razorpay_payment_id: razorpay_payment_id,
        amount: plan.price,
        status: "success",
        paid_at: startDate,
      }, { transaction });
    }

    await User.update({ plan_id: planId }, { where: { id: userId }, transaction });
    await transaction.commit();

    await syncInstanceResourcesWithPlan(userId, planId);

    return res.status(200).json(new ApiResponse(200, null, "Subscription activated successfully"));
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(500, "Payment successful but activation processing failed. Check back in a minute.");
  }
});

const getMySubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscription = await Subscription.findOne({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    include: [{ model: Plan, as: 'Plan', attributes: ['name', 'price', 'cpu_limit', 'memory_limit_mb'] }]
  });

  if (subscription && subscription.status === 'active' && new Date(subscription.end_at) < new Date()) {
    subscription.status = 'expired';
    await subscription.save({ hooks: false });
    
    const freePlan = await Plan.findOne({ where: { name: "Free" } });
    const freePlanId = freePlan ? freePlan.id : 1;

    await User.update({ plan_id: freePlanId }, { where: { id: userId } });
    await syncInstanceResourcesWithPlan(userId, freePlanId);
  }

  const user = await User.findByPk(userId, { attributes: ['plan_id'] });
  const currentPlan = await Plan.findByPk(user.plan_id || 1);

  return res.status(200).json(new ApiResponse(200, {
    current_plan: currentPlan,
    subscription_details: subscription || null
  }, "Subscription details fetched"));
});

export { createSubscription, verifySubscription, getMySubscription };
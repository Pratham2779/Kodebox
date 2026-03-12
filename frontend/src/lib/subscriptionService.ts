import { api } from "./axios";

export interface SubscriptionDetails {
  id: number;
  status: "active" | "expired" | "created";
  start_at: string;
  end_at: string;
  plan_id: number;
  razorpay_subscription_id?: string;
}

export interface CurrentSubscriptionResponse {
  data: CurrentSubscriptionResponse;
  current_plan: {
    id: number;
    name: "Free" | "Starter" | "Pro";
    price: number;
    cpu_limit: number;
    memory_limit_mb: number;
  } | null;
  subscription_details: SubscriptionDetails | null;
}

export const subscriptionService = {
  getCurrentSubscription() {
    return api.get<CurrentSubscriptionResponse>("/subscription/current");
  },

  createSubscription(planId: number) {
    return api.post("/subscription/create", { planId });
  },

  verifySubscription(data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) {
    return api.post("/subscription/verify", data);
  },
};
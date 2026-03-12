import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { subscriptionService, CurrentSubscriptionResponse } from "../../lib/subscriptionService";
import { authService } from "../../lib/authService";

type PlanTier = "Free" | "Starter" | "Pro";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanUI {
  id: string;
  dbId: number;
  name: PlanTier;
  priceDisplay: string;
  cpu: string;
  memory: string;
  backups: boolean;
  features: string[];
  recommended?: boolean;
}

const PLANS: PlanUI[] = [
  {
    id: "plan_free",
    dbId: 1,
    name: "Free",
    priceDisplay: "Free",
    cpu: "1 Core",
    memory: "1 GB",
    backups: false,
    features: ["1 Core CPU Limit", "1 GB RAM", "Community Support", "No Auto Backups"],
  },
  {
    id: "plan_starter",
    dbId: 2,
    name: "Starter",
    priceDisplay: "₹249",
    cpu: "2 Cores",
    memory: "2 GB",
    backups: true,
    recommended: true,
    features: ["2 Cores CPU Limit", "2 GB RAM", "Manual / Monthly Backups", "6 Months Backup Retention", "Email Support"],
  },
  {
    id: "plan_pro",
    dbId: 3,
    name: "Pro",
    priceDisplay: "₹499",
    cpu: "4 Cores",
    memory: "4 GB",
    backups: true,
    features: ["4 Cores CPU Limit", "4 GB RAM", "Manual / Monthly Backups", "6 Months Backup Retention", "Priority Support"],
  },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true); return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UpgradePlan() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<CurrentSubscriptionResponse | null>(null);
  
  // New state for the full-screen buffering overlay
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.getCurrentSubscription();

      const payload = res.data?.data || res.data;
      setSubscriptionData(payload);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const handleUpgrade = async (plan: PlanUI) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load payment gateway.");
      return;
    }

    setProcessingId(plan.dbId);

    try {
      const { data: createData } = await subscriptionService.createSubscription(plan.dbId);
      const { subscription_id, key_id, amount, plan_name } = createData.data || createData;

      const options = {
        key: key_id,
        amount: amount,
        currency: "INR",
        name: "Kodebox Cloud",
        description: `6-Month Access: ${plan_name}`,
        subscription_id: subscription_id,
        handler: async function (response: any) {
          // 1. Show the full-screen buffering overlay immediately after payment
          setIsUpgrading(true);
          setProcessingId(null);

          // 2. Fire the verify endpoint in the background (Idempotent sync)
          subscriptionService.verifySubscription({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }).catch(() => console.log("Background verification processing..."));

          // 3. Start Polling to check if Webhook/Verify updated the DB
          const startTime = Date.now();
          const timeoutLimit = 90 * 1000; // 1.5 minutes (90,000 ms)

          const pollInterval = setInterval(async () => {
            // Check for Timeout
            if (Date.now() - startTime > timeoutLimit) {
              clearInterval(pollInterval);
              setIsUpgrading(false);
              alert("Payment verification failed or timed out. If amount was deducted, please contact support.");
              window.location.reload(); // Refresh after timeout
              return;
            }

            try {
              // Fetch latest user profile to see if the plan_id has changed in the database
              const meRes = await authService.me();
              const freshUser = meRes.data?.data?.user;

              if (freshUser && freshUser.plan_id === plan.dbId) {
                // Success! The webhook/backend has finished scaling resources
                clearInterval(pollInterval);
                updateUser(freshUser);
                await fetchSubscriptionStatus();
                setIsUpgrading(false);
                alert("Payment Successful! Your plan is upgraded and resources have been scaled.");
                window.location.reload(); // Refresh after success
              }
            } catch (pollError) {
              console.error("Polling error:", pollError);
              // Ignore network hiccups during polling and keep trying until timeout
            }
          }, 3000); // Poll every 3 seconds
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
          contact: user?.phone_number,
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: function () { setProcessingId(null); }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Subscription Error:", error);
      const msg = error.response?.data?.message || "Transaction failed";
      alert(msg);
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const currentPlanId = subscriptionData?.current_plan?.id || 1;
  const isSubActive = subscriptionData?.subscription_details?.status === "active";
  const subEndDate = subscriptionData?.subscription_details?.end_at;

  return (
    <>
      {/* Full Screen Loading Overlay */}
      {isUpgrading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <svg 
            className="mb-4 h-16 w-16 animate-spin text-brand-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="mb-2 text-2xl font-bold text-white">Upgrading Your Plan...</h2>
          <p className="text-gray-300">Scaling resources and syncing with server. Please wait...</p>
        </div>
      )}

      <div>
        <PageMeta title="Upgrade Plan | Kodebox" description="Choose the perfect plan." />
        <PageBreadcrumb pageTitle="Pricing & Plans" />

        <div className="min-h-screen space-y-6">

          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03] lg:py-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-lg text-gray-500 dark:text-gray-400">
              Choose your plan. Plans are billed in 6-month cycles.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isMyPlan = currentPlanId === plan.dbId;
              const isFree = plan.dbId === 1;
              const isProcessing = processingId === plan.dbId;

              const isDisabled = loading || isProcessing || isSubActive || isUpgrading;

              let buttonText = "Upgrade Now";
              let subText = "";

              if (loading) {
                buttonText = "Loading...";
              } else if (isProcessing) {
                buttonText = "Processing...";
              } else if (isMyPlan && isFree) {
                buttonText = "Current Plan";
              } else if (isMyPlan && isSubActive) {
                buttonText = "Current Plan";
                if (subEndDate) subText = `Expires: ${formatDate(subEndDate)}`;
              } else if (isSubActive && !isMyPlan) {
                buttonText = "Upgrade Unavailable";
                subText = "Active subscription exists";
              } else if (isMyPlan && !isSubActive && !isFree) {
                buttonText = "Renew Plan";
                subText = "Plan Expired";
              }

              return (
                <div key={plan.id} className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-900 ${plan.recommended ? "border-brand-500 ring-1 ring-brand-500 dark:border-brand-500" : "border-gray-200 dark:border-gray-800"
                  }`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{plan.name}</h3>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-800 dark:text-white">{plan.priceDisplay}</span>
                        {!isFree && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/month</span>}
                      </div>
                      {!isFree && <span className="text-xs text-gray-400 mt-1">(6-month cycle)</span>}
                    </div>
                  </div>

                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className={`mt-1 h-4 w-4 shrink-0 ${plan.name === "Free" && idx > 1 ? "text-gray-400 dark:text-gray-600" : "text-brand-500"}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto space-y-2">
                    <div className="flex flex-col items-center w-full">
                      {isMyPlan && !isFree && (
                        <div className="mb-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full w-max mx-auto border border-green-200 dark:border-green-800">
                          ACTIVE PLAN
                        </div>
                      )}
                      <Button
                        className="w-full justify-center"
                        variant={isMyPlan ? "outline" : plan.recommended ? "primary" : "outline"}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && handleUpgrade(plan)}
                      >
                        {buttonText}
                      </Button>
                    </div>
                    {subText && <p className="text-center text-xs font-medium text-brand-500">{subText}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Comparison Table */}
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Features</th>
                    <th className="py-4 text-center text-sm font-semibold text-gray-800 dark:text-white">Free</th>
                    <th className="py-4 text-center text-sm font-semibold text-brand-500">Starter</th>
                    <th className="py-4 text-center text-sm font-semibold text-gray-800 dark:text-white">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">CPU Limit</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">1 Core</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">2 Cores</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">4 Cores</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">Memory (RAM)</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">1 GB</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">2 GB</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">4 GB</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">Backups Allowed</td>
                    <td className="py-4 text-center"><span className="text-red-500">✗</span></td>
                    <td className="py-4 text-center"><span className="text-green-500">✓</span></td>
                    <td className="py-4 text-center"><span className="text-green-500">✓</span></td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">Backup Frequency</td>
                    <td className="py-4 text-center text-sm text-gray-400">–</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">Man/Mon</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">Man/Mon</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm font-medium text-gray-800 dark:text-white">Retention</td>
                    <td className="py-4 text-center text-sm text-gray-400">–</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">6 Months</td>
                    <td className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">6 Months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
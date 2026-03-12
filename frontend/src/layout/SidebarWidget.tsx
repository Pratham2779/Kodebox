import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SidebarWidget() {
  const { user } = useAuth();

  if (!user) return null;

  let planName = "Free Plan";
  let badgeColor = "bg-gray-500";
  let statusText = "Standard";

  if (user.plan_id === 2) {
    planName = "Starter Plan";
    badgeColor = "bg-brand-500";
    statusText = "Active";
  } else if (user.plan_id === 3) {
    planName = "Pro Plan";
    badgeColor = "bg-purple-500";
    statusText = "Active";
  }


  const isPaidPlan = user.plan_id > 1;


  const planLabel = planName.split(" ")[0];

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Account Status
        </h3>
        <span
          title={user.is_email_verified ? "Email Verified" : "Email Unverified"}
          className={`flex h-2 w-2 rounded-full ${user.is_email_verified ? "bg-green-500" : "bg-yellow-500"
            }`}
        ></span>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
          {planName}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`h-1.5 w-1.5 rounded-full ${badgeColor}`}></span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {statusText} Subscription
          </p>
        </div>
      </div>

      <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {user.plan_id === 1
          ? "Upgrade to unlock cloud backups and more resources."
          : "Your plan is active. Enjoy your premium features."}
      </p>


      {isPaidPlan ? (
        <button
          disabled
          className="flex w-full items-center justify-center p-3 font-medium text-brand-500 rounded-lg bg-brand-500/10 text-sm cursor-default transition-opacity"
        >
          {planLabel} Active
        </button>
      ) : (
        <Link
          to="/upgrade-plan"
          className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-sm transition-all hover:bg-brand-600 shadow-sm hover:shadow-md active:scale-95"
        >
          Upgrade Plan
        </Link>
      )}
    </div>
  );
}
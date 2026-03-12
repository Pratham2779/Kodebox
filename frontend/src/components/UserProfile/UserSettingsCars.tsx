import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { api } from "../../lib/axios";

export default function UserAddressCard() {
  const { user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();


  const [backupFrequency, setBackupFrequency] = useState("manual");
  const [tempFrequency, setTempFrequency] = useState("manual");


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);


      await api.patch("/instance/backup-settings", { frequency: tempFrequency });

      setBackupFrequency(tempFrequency);
      closeModal();
    } catch (err: any) {
      console.error("Failed to save backup preferences:", err);
      setError(err.response?.data?.message || "Failed to update backup settings");
    } finally {
      setIsLoading(false);
    }
  };

  const planId = user?.plan_id || 1;
  const isPro = planId === 3;
  const isStarter = planId === 2;

  let planDisplayName = "Free Plan";
  let planFeatures = "1 Core • 1 GB RAM • No Backups";
  let badgeColor = "bg-gray-500";

  if (isStarter) {
    planDisplayName = "Starter Plan";
    planFeatures = "2 Cores • 2 GB RAM • Email Support";
    badgeColor = "bg-brand-500";
  } else if (isPro) {
    planDisplayName = "Pro Plan";
    planFeatures = "4 Cores • 4 GB RAM • Priority Support";
    badgeColor = "bg-purple-500";
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Subscription & Settings
              </h4>

              {/* Upgrade Button (Visible if not on Pro) */}
              {!isPro && (
                <Link to="/upgrade-plan">
                  <Button size="sm" className="hidden sm:inline-flex">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">

              {/* --- Current Plan Section --- */}
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Current Active Plan
                </p>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${badgeColor}`}></span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {planDisplayName}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {planFeatures}
                </p>
              </div>

              {/* --- Backup Frequency Section --- */}
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Auto Backup Frequency
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {backupFrequency === "monthly" ? "Monthly" : "Manual"}
                </p>
              </div>

            </div>

            {/* Mobile Upgrade Button (if hidden above on small screens) */}
            {!isPro && (
              <div className="mt-6 sm:hidden">
                <Link to="/upgrade-plan" className="w-full">
                  <Button className="w-full">Upgrade Plan</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={() => {
              setTempFrequency(backupFrequency);
              setError(null);
              openModal();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto ml-0 lg:ml-6 mt-4 lg:mt-0"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="px-2">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Preferences
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Configure your automatic backup settings.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="px-2">
              <div className="grid grid-cols-1 gap-5">

                {/* --- Backup Option --- */}
                <div>
                  <Label>Auto Backup Duration</Label>
                  <select
                    className="w-full px-4 py-3 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                    value={tempFrequency}
                    onChange={(e) => setTempFrequency(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="manual" className="dark:bg-gray-900">Manual (No Auto Backup)</option>
                    <option value="monthly" className="dark:bg-gray-900">Monthly</option>
                  </select>
                </div>

              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={isLoading}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
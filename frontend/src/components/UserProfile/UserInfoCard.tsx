import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../lib/profileService.ts";
import { authService } from "../../lib/authService";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";


type Step = "edit" | "otp" | "new-password";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth();


  const [currentStep, setCurrentStep] = useState<Step>("edit");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  useEffect(() => {
    if (user) {
      setPhoneNumber(user.phone_number || "");
    }
  }, [user, isOpen]);

  // Handlers
  const handleOpen = () => {
    setCurrentStep("edit");
    setError(null);
    if (user) setPhoneNumber(user.phone_number || "");
    openModal();
  };

  const handleClose = () => {
    setCurrentStep("edit");
    setError(null);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    closeModal();
  };


  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);

      await profileService.updateProfile(formData);

      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update phone", err);
      setError(err.response?.data?.message || "Failed to update phone number");
      setIsLoading(false);
    }
  };


  const handleStartReset = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(user!.email);
      setCurrentStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyPasswordResetOtp(user!.email, otp);
      setCurrentStep("new-password");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {

      await authService.resetPassword(user!.email, newPassword);

      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update password", err);
      setError(err.response?.data?.message || "Failed to update password");
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.full_name}</p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Username</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">@{user.username}</p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.email}</p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.phone_number}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpen}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {currentStep === "edit" && (
            <>
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Contact Details</h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your phone number.</p>
              </div>
              <form onSubmit={handleSavePhone} className="flex flex-col">
                <div className="px-2 pb-3">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2">
                      <Label>Phone Number</Label>
                      <Input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between rounded-lg bg-gray-50 p-4 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white/90">Password</h5>
                      <p className="text-xs text-gray-500">Secure your account by updating your password.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleStartReset} disabled={isLoading}>
                      {isLoading ? "Sending..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={handleClose} disabled={isLoading}>Close</Button>
                  <Button size="sm" disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </>
          )}

          {currentStep === "otp" && (
            <div className="flex flex-col h-full justify-center px-2">
              <div className="text-center mb-8">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Verify It's You</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">We've sent a code to {user.email}.</p>
              </div>
              <div className="max-w-xs mx-auto w-full mb-8">
                <Label className="mb-3 text-center block">Enter OTP</Label>
                <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-lg tracking-[0.5em] font-bold" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button size="sm" variant="outline" onClick={() => setCurrentStep("edit")} disabled={isLoading}>Back</Button>
                <Button size="sm" onClick={handleVerifyOtp} disabled={isLoading}>{isLoading ? "Verifying..." : "Verify Code"}</Button>
              </div>
            </div>
          )}

          {currentStep === "new-password" && (
            <div className="px-2">
              <div className="mb-8">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Set New Password</h4>
              </div>
              <form onSubmit={handleUpdatePassword}>
                <div className="grid grid-cols-1 gap-5 mb-8">
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button size="sm" variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                  <Button size="sm" disabled={isLoading}>{isLoading ? "Updating..." : "Update Password"}</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

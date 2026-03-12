import { useState } from "react";
import { ChevronLeftIcon } from "../../icons";
import Button from "../ui/button/Button";
import { authService } from "../../lib/authService";

export default function ForgotPasswordForm() {

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");

    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setError("");

    setLoading(true);
    try {
      await authService.verifyPasswordResetOtp(email, otp);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, newPassword);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Back */}
      <div className="w-full max-w-md pt-10 mx-auto">
        <a
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to sign in
        </a>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 && "Enter your email to receive an OTP."}
              {step === 2 && `Enter the OTP sent to ${email}.`}
              {step === 3 && "Create a new secure password."}
              {step === 4 && "Password reset successfully."}
            </p>
          </div>

          {/* Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          )}

          {/*Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}

          {/* Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {/* Added Strong Password Rules Here */}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.
                </p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Success Message */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400">
                Your password has been successfully reset. You can now log in with your new credentials.
              </div>
              <a
                href="/signin"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                Go to Sign In
              </a>
            </div>
          )}

          {/* Footer link for steps 1-3 */}
          {step !== 4 && (
            <p className="mt-6 text-sm text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remembered your password?{" "}
              <a href="/signin" className="text-brand-500 hover:text-brand-600">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

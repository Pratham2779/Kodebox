import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

import { api } from "../../lib/axios";

export default function SignUpForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter email first");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/email/verification/request", { email });
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/email/verification/confirm", { email, otp });
      setEmailVerified(true);
      alert("Email verified successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailVerified) {
      alert("Please verify email first");
      return;
    }

    if (!isChecked) {
      alert("Please accept Terms & Privacy Policy");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    try {
      await api.post("/user/create", {
        fullName: formData.get("fullName"),
        username: formData.get("username"),
        phoneNumber: formData.get("phone"),
        email,
        password: formData.get("password"),
      });

      alert("Account created successfully");
      navigate("/signin", { replace: true });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your account by filling the details below.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>Full Name*</Label>
                <Input name="fullName" type="text" placeholder="Enter your full name" />
              </div>

              <div>
                <Label>Username*</Label>
                <Input name="username" type="text" placeholder="Choose a username" />
              </div>

              <div>
                <Label>Phone Number*</Label>
                <Input name="phone" type="tel" placeholder="Enter your phone number" />
              </div>

              {/* Email */}
              <div>
                <Label>Email*</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailVerified}
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-4 text-sm text-white rounded-lg bg-brand-500 hover:bg-brand-600"
                    >
                      Verify
                    </button>
                  )}
                </div>

                {emailVerified && (
                  <p className="mt-1 text-sm text-green-600">
                    ✔ Email verified
                  </p>
                )}
              </div>

              {/* OTP */}
              {otpSent && !emailVerified && (
                <div>
                  <Label>OTP*</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="px-4 text-sm text-white rounded-lg bg-green-500 hover:bg-green-600"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}

              <div>
                <Label>Password*</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2"
                  >

                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  I agree to Terms & Privacy Policy
                </p>
              </div>


              <button
                type="submit"
                disabled={!emailVerified || !isChecked}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-5 text-sm text-center text-gray-700 dark:text-gray-400 sm:text-start">
            Already have an account?{" "}
            <Link to="/signin" className="text-brand-500 hover:text-brand-600">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

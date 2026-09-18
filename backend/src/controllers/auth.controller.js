import { config } from "dotenv";
config();

import validator from "validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { EmailVerification } from "../models/email-verification.model.js";
import {
  generateAccessToken,
  generateOTP,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/auth.util.js";
import { sendMail } from "../configs/email/index.js";
import { otpTemplate } from "../configs/email/templates/otp.template.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import ms from "ms";
import jwt from "jsonwebtoken";


const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const normalizedData = {
    email: email.trim().toLowerCase(),
    password: password.trim(),
    rememberMe:
      rememberMe === true ||
      rememberMe === "true" ||
      rememberMe === 1 ||
      rememberMe === "1" ||
      rememberMe === "True",
  };

  const user = await User.scope("withSecrets").findOne({
    where: { email: normalizedData.email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.is_email_verified === false) {
    throw new ApiError(403, "Email not verified");
  }

  const isPasswordCorrect = await bcrypt.compare(
    normalizedData.password,
    user.password_hash
  );
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, normalizedData.rememberMe);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
    maxAge: normalizedData.rememberMe
      ? ms(process.env.JWT_REMEMBER_ME_REFRESH_TOKEN_EXPIRY || "30d")
      : ms(process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d"),
  });

  // store hashed refresh token 
  user.refresh_token = hashRefreshToken(refreshToken);
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { accessToken }, "Login successful")
  );
});


const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findByPk(userId);

  if (user) {
    user.refresh_token = null;
    await user.save();
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth/refresh",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});


const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {

    console.error("JWT VERIFY ERROR:", error.name, error.message);
    throw new ApiError(401, "Session expired. Please login again.");
  }

  const user = await User.scope("withSecrets").findByPk(decoded.id);
  if (!user || !user.refresh_token) {
    throw new ApiError(401, "Unauthorized");
  }

  const incomingHash = hashRefreshToken(refreshToken);
  if (incomingHash !== user.refresh_token) {
    throw new ApiError(401, "Unauthorized");
  }

  const accessToken = generateAccessToken(user);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});


const requestEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  const normalizedEmail = email.toLowerCase();


  const existing = await EmailVerification.findOne({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (existing.verified) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Email already verified"));
    }

    if (existing.expires_at && existing.expires_at < new Date()) {
      await existing.destroy();
    }
  }

  const otp = generateOTP();


  await EmailVerification.upsert({
    email: normalizedEmail,
    otp,
    verified: false,
    expires_at: new Date(
      Date.now() + Number(process.env.OTP_EXPIRY || "10") * 60 * 1000
    ),
  });

  try {
    await sendMail({
      to: normalizedEmail,
      subject: `${process.env.APP_NAME} - Email Verification OTP`,
      html: otpTemplate(otp),
      text: `Your OTP is: ${otp}`,
    });
  } catch (mailErr) {
    console.error("Failed to send verification email:", mailErr);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, null, "Verification OTP sent"));
});


const confirmEmailVerification = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Invalid email");
  }

  const normalizedEmail = email.toLowerCase();

  const record = await EmailVerification.findOne({
    where: { email: normalizedEmail },
  });

  if (!record) {
    throw new ApiError(400, "No verification request found");
  }

  if (record.verified) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email already verified"));
  }

  if (record.expires_at && record.expires_at < new Date()) {
    await record.destroy();
    throw new ApiError(400, "OTP expired");
  }

  // normalize types and compare
  if (String(record.otp) !== String(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  record.verified = true;
  record.otp = null;
  await record.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
});


const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }

  if (
    !validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new ApiError(400, "Weak password");
  }

  const normalizedEmail = email.toLowerCase();

  const record = await EmailVerification.findOne({
    where: { email: normalizedEmail },
  });

  if (!record || !record.verified) {
    throw new ApiError(400, "Email not verified or request expired");
  }

  const user = await User.scope("withSecrets").findOne({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  await user.save();

  await record.destroy();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});


export {
  login,
  logout,
  refresh,
  requestEmailVerification,
  confirmEmailVerification,
  resetPassword,
};
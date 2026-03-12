import { config } from "dotenv";
config();

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import validator from "validator";
import { hash } from "bcrypt";
import { User } from "../models/user.model.js";
import { EmailVerification } from "../models/email-verification.model.js";
import { Op } from "sequelize";
import { uploadAvatar, deleteAvatar, getProfilePhotoUrl } from "../utils/user.util.js";

const createUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, phoneNumber } = req.body;

  if (!fullName || !username || !email || !password || !phoneNumber) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedData = {
    fullName: fullName.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    phoneNumber: String(phoneNumber).trim(),
  };

  // email must be verified first
  const verification = await EmailVerification.findOne({
    where: { email: normalizedData.email },
  });

  if (!verification || !verification.verified) {
    throw new ApiError(403, "Email not verified, cannot proceed");
  }

  // validations
  if (!validator.isEmail(normalizedData.email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!validator.isNumeric(normalizedData.phoneNumber) || normalizedData.phoneNumber.length !== 10) {
    throw new ApiError(400, "Invalid phone number");
  }

  if (
    !validator.isStrongPassword(normalizedData.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new ApiError(400, "Weak password");
  }

  if (normalizedData.fullName.length < 2) {
    throw new ApiError(400, "Invalid full name");
  }

  if (normalizedData.username.length < 3) {
    throw new ApiError(400, "Invalid username");
  }

  // check existing user
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedData.email },
        { phone_number: normalizedData.phoneNumber },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.username === normalizedData.username) {
      throw new ApiError(409, "Username already taken");
    }
    if (existingUser.email === normalizedData.email) {
      throw new ApiError(409, "Email already in use");
    }
    if (existingUser.phone_number === normalizedData.phoneNumber) {
      throw new ApiError(409, "Phone number already in use");
    }
  }

  const password_hash = await hash(normalizedData.password, 10);

  let user;
  try {
    user = await User.create({
      full_name: normalizedData.fullName,
      username: normalizedData.username,
      email: normalizedData.email,
      password_hash,
      phone_number: normalizedData.phoneNumber,
      avatar_key: process.env.DEFAULT_AVATAR_KEY,
      is_email_verified: true,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      throw new ApiError(409, "User already exists");
    }
    throw err;
  }

  // consume verification record
  await EmailVerification.destroy({
    where: { email: normalizedData.email },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});



const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { username, phoneNumber, password } = req.body;
  const avatarPath = req.file?.path;

  const updateData = {};

  if (username !== undefined) {
    if (typeof username !== "string") {
      throw new ApiError(400, "Invalid username");
    }

    const value = username.trim();
    if (value.length < 3) {
      throw new ApiError(400, "Invalid username");
    }

    updateData.username = value;
  }

  if (phoneNumber !== undefined) {
    const value = String(phoneNumber).trim();

    if (!validator.isNumeric(value) || value.length !== 10) {
      throw new ApiError(400, "Invalid phone number");
    }

    updateData.phone_number = value;
  }

  if (password !== undefined) {
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      throw new ApiError(400, "Weak password");
    }

    updateData.password_hash = await hash(password, 10);
  }

  if (!Object.keys(updateData).length && !avatarPath) {
    throw new ApiError(400, "No valid fields to update");
  }

  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (updateData.username) {
    const exists = await User.findOne({
      where: {
        username: updateData.username,
        id: { [Op.ne]: userId },
      },
    });
    if (exists) throw new ApiError(409, "Username already in use");
  }

  if (updateData.phone_number) {
    const exists = await User.findOne({
      where: {
        phone_number: updateData.phone_number,
        id: { [Op.ne]: userId },
      },
    });
    if (exists) throw new ApiError(409, "Phone number already in use");
  }

  if (avatarPath) {
    try {
      const { key } = await uploadAvatar(avatarPath);

      if (
        user.avatar_key &&
        user.avatar_key !== process.env.DEFAULT_AVATAR_KEY
      ) {
        await deleteAvatar(user.avatar_key);
      }

      updateData.avatar_key = key;
    } catch (err) {
      console.error("Avatar update failed:", err);
      throw new ApiError(500, "Avatar update failed");
    }
  }

  user.set(updateData);
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, "Profile updated successfully")
  );
});


const deleteUser = asyncHandler(async (req, res) => {
  // for future case

});


const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req?.user?.id);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const avatar_url = await getProfilePhotoUrl(user?.avatar_key);

  return res.status(200).json(
    new ApiResponse(200, { user, avatar_url }, "User fetched successfully")
  );
});

export {
  createUser,
  updateUser,
  deleteUser,
  me
};
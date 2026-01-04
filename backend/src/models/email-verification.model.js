import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const EmailVerification = sequelize.define(
  "EmailVerification",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "OTP or verification code",
    },

    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "email_verifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [{ fields: ["email"] }],
  }
);

export { EmailVerification };

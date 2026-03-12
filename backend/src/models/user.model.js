import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [2, 255] },
    },

    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 255],
        is: /^[a-zA-Z0-9_.]+$/i,
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    avatar_key: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },

    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    refresh_token: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },

    razorpay_customer_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    plan_id: {
      type: DataTypes.BIGINT.UNSIGNED, 
      defaultValue: 1,
      allowNull: false,
    }

  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      { fields: ["email"] },
      { fields: ["username"] },
      { fields: ["phone_number"] },
    ],

    defaultScope: {
      attributes: {
        exclude: ["password_hash", "refresh_token"],
      },
    },

    scopes: {
      withSecrets: {
        attributes: {
          include: ["password_hash", "refresh_token"],
        },
      },
    },
  }
);

export { User };

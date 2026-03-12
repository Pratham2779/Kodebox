import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    plan_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "expired"),
      allowNull: false,
      defaultValue: "active",
    },

    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    razorpay_subscription_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [
      { fields: ["user_id"] },
      { fields: ["plan_id"] },
      { fields: ["status"] },
      { fields: ["end_at"] },
      { fields: ["razorpay_subscription_id"] },
    ],
  }
);

export { Subscription };


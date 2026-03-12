import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    subscription_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    razorpay_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("success", "failed", "refunded"),
      allowNull: false,
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [{ fields: ["subscription_id"] }],
  }
);

export { Payment };


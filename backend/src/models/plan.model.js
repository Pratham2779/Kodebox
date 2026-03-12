import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Plan = sequelize.define(
  "Plan",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.ENUM("Free", "Starter", "Pro"),
      allowNull: false,
      unique: true,
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    razorpay_plan_id: {
      type: DataTypes.STRING(100),
      allowNull: true, // NULL for free
    },

    cpu_limit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    memory_limit_mb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    disk_limit_mb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    is_backup_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    backup_retention_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "plans",
    timestamps: false,
  }
);

export { Plan };


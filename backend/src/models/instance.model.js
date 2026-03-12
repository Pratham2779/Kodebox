import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Instance = sequelize.define(
  "Instance",
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    instance_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("running", "stopped", "deleted"),
      allowNull: false,
      defaultValue: "stopped",
    },
    network_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    locked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    backup_frequency: {
      type: DataTypes.ENUM("manual", "monthly"),
      allowNull: false,
      defaultValue: "manual",
    },
    last_backup_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "instances",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["is_locked"] },
    ],
  }
);

export { Instance };
import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Backup = sequelize.define(
  "Backup",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    instance_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    volume_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    object_path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    size_mb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  },
  {
    tableName: "backups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [
      { fields: ["instance_id"] },
      { fields: ["volume_id"] },
    ],
  }
);

export { Backup };

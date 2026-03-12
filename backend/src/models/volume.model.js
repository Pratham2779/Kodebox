import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db/index.js";

const Volume = sequelize.define(
  "Volume",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    volume_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    instance_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    mount_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    size_limit_mb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "volumes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [{ fields: ["instance_id"] }],
  }
);

export { Volume };

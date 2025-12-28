import {config} from 'dotenv';
config();
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2, 
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`\nMySQL connected at host : ${process.env.DB_HOST}\n`);
  } catch (error) {
    console.error("MySQL connection failed", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };

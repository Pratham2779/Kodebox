import { sequelize } from "../configs/db/index.js";
import { Plan } from "../models/plan.model.js";
import { config } from "dotenv";
config();

async function seedPlans() {
  try {
    console.log("Seeding plans...");

    //Connect to DB
    await sequelize.authenticate();
    console.log("Database connected");


    await sequelize.sync({ alter: false });
    console.log("Tables synced (created if not present)");

    const plans = [
      {
        name: "Free",
        price: 0,
        razorpay_plan_id: "free_plan",
        cpu_limit: 1,
        memory_limit_mb: 1024,
        disk_limit_mb: 7168,
        is_backup_allowed: false,
        backup_retention_months: 0,
        commitment_months: 0,
      },
      {
        name: "Starter",
        price: 249,
        razorpay_plan_id: "plan_RzlBYZId9bOsMO",
        cpu_limit: 2,
        memory_limit_mb: 2048,
        disk_limit_mb: 15360,
        is_backup_allowed: true,
        backup_retention_months: 6,
        commitment_months: 6,
      },
      {
        name: "Pro",
        price: 499,
        razorpay_plan_id: "plan_RzlF2pNzUltpnP",
        cpu_limit: 4,
        memory_limit_mb: 4096,
        disk_limit_mb: 25600,
        is_backup_allowed: true,
        backup_retention_months: 6,
        commitment_months: 6,
      },
    ];


    for (const plan of plans) {
      const [_, created] = await Plan.findOrCreate({
        where: { name: plan.name },
        defaults: plan,
      });

      if (created) {
        console.log(`Created plan: ${plan.name}`);
      } else {
        console.log(`Plan already exists: ${plan.name}`);
      }
    }

    console.log("Plan seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Plan seeding failed:", error);
    process.exit(1);
  }
}

seedPlans();

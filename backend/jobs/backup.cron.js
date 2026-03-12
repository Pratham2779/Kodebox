
import cron from "node-cron";
import { Op } from "sequelize";
import { Instance } from "../src/models/instance.model.js";
import { User } from "../src/models/user.model.js";
import { createBackup } from "../src/utils/backup.util.js";

export const processMonthlyBackups = async () => {
  console.log("[CRON] Checking for due backups...");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const instancesToBackup = await Instance.findAll({
      where: {
        backup_frequency: "monthly",
        status: ["running", "stopped"], 
        [Op.or]: [
          { last_backup_at: { [Op.lte]: thirtyDaysAgo } },
          { last_backup_at: null }
        ]
      }
    });

    console.log(`[CRON] Found ${instancesToBackup.length} instances to backup.`);

    for (const instance of instancesToBackup) {
      try {
        const user = await User.findByPk(instance.user_id);
        
        if (!user) {
          console.warn(`[CRON] User not found for instance ${instance.name}. Skipping.`);
          continue;
        }

        console.log(`[CRON] Backing up instance: ${instance.name}`);
        
        await createBackup({
          username: user.username,
          instanceId: instance.id
        });
      } catch (err) {
        console.error(`[CRON] Failed for ${instance.name}:`, err.message);
      }
    }
  } catch (error) {
    console.error("[CRON] Database query failed:", error);
  }
};

export const startBackupCron = () => {
  cron.schedule("0 2 * * *", processMonthlyBackups);
  console.log("[CRON] Backup scheduler initialized.");
};
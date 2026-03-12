import { User } from "./user.model.js";
import { Plan } from "./plan.model.js";
import { Subscription } from "./subscription.model.js";
import { Instance } from "./instance.model.js";
import { Volume } from "./volume.model.js";
import { Backup } from "./backup.model.js";
import { Payment } from "./payment.model.js";
import { EmailVerification } from "./email-verification.model.js";

console.log("Initializing Database Associations...");


Plan.hasMany(Subscription, { foreignKey: "plan_id" });
Subscription.belongsTo(Plan, { foreignKey: "plan_id", as: "Plan" });


Plan.hasMany(User, { foreignKey: "plan_id" });
User.belongsTo(Plan, { foreignKey: "plan_id" });


User.hasMany(Subscription, { foreignKey: "user_id" });
Subscription.belongsTo(User, { foreignKey: "user_id" });


Subscription.hasMany(Payment, { foreignKey: "subscription_id" });
Payment.belongsTo(Subscription, { foreignKey: "subscription_id" });


User.hasOne(Instance, { foreignKey: "user_id" });
Instance.belongsTo(User, { foreignKey: "user_id" });


Instance.hasOne(Volume, { foreignKey: "instance_id" });
Volume.belongsTo(Instance, { foreignKey: "instance_id" });


Instance.hasMany(Backup, { foreignKey: "instance_id" });
Backup.belongsTo(Instance, { foreignKey: "instance_id" });


Volume.hasMany(Backup, { foreignKey: "volume_id" });
Backup.belongsTo(Volume, { foreignKey: "volume_id" });

export {
  User,
  Plan,
  Subscription,
  Instance,
  Volume,
  Backup,
  Payment,
  EmailVerification
};
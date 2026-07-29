import { pgTable, uuid, varchar, numeric } from "drizzle-orm/pg-core";
import { users } from "../schema.js";

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refereeUserId: uuid("referee_user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("PENDING_FIRST_SCAN"),
  rewardPaidNgn: numeric("reward_paid_ngn", { precision: 10, scale: 2 }).notNull().default("100.00"),
});

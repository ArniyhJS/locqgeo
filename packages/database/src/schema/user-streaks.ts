import { pgTable, uuid, integer, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { users } from "../schema.js";

export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStreakDays: integer("current_streak_days").notNull().default(1),
  longestStreakDays: integer("longest_streak_days").notNull().default(1),
  lastCheckinDate: date("last_checkin_date").notNull(),
  streakSaversRemaining: integer("streak_savers_remaining").notNull().default(1),
  multiplier: numeric("multiplier", { precision: 4, scale: 2 }).notNull().default("1.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

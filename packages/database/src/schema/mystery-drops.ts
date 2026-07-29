import { pgTable, uuid, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { geofences } from "../schema.js";

export const mysteryDrops = pgTable("mystery_drops", {
  id: uuid("id").primaryKey().defaultRandom(),
  geofenceId: uuid("geofence_id").references(() => geofences.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  rewardType: varchar("reward_type", { length: 20 }).notNull(),
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  dropProbabilityPct: numeric("drop_probability_pct", { precision: 5, scale: 2 }).notNull().default("5.00"),
  isActive: boolean("is_active").notNull().default(true),
});

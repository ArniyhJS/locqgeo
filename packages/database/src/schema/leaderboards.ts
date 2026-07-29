import { pgTable, uuid, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { users } from "../schema.js";

export const leaderboardRanks = pgTable("leaderboard_ranks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionCode: varchar("region_code", { length: 20 }).notNull().default("NG-LA"),
  period: varchar("period", { length: 20 }).notNull().default("WEEKLY"),
  totalClaims: integer("total_claims").notNull().default(0),
  totalRewardsEarnedNgn: numeric("total_rewards_earned_ngn", { precision: 12, scale: 2 }).notNull().default("0.00"),
  rankPosition: integer("rank_position").notNull(),
});

import { pgTable, uuid, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { users } from "../schema.js";

export const squads = pgTable("squads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  creatorUserId: uuid("creator_user_id").notNull().references(() => users.id),
  weeklyTargetClaims: integer("weekly_target_claims").notNull().default(20),
  currentClaims: integer("current_claims").notNull().default(0),
  rewardPoolNgn: numeric("reward_pool_ngn", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
});

export const squadMembers = pgTable("squad_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  squadId: uuid("squad_id").notNull().references(() => squads.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("MEMBER"),
});

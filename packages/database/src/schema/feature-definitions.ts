import { pgTable, uuid, varchar, text, boolean, integer, primaryKey } from "drizzle-orm/pg-core";
import { plans } from "./plans.js";

export const featureDefinitions = pgTable("feature_definitions", {
  key: varchar("key", { length: 50 }).primaryKey(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(),
  description: text("description"),
});

export const planFeatures = pgTable("plan_features", {
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  featureKey: varchar("feature_key", { length: 50 }).notNull().references(() => featureDefinitions.key, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  limitValue: integer("limit_value"),
  limitUnit: varchar("limit_unit", { length: 30 }),
}, (table) => [
  primaryKey({ columns: [table.planId, table.featureKey] }),
]);

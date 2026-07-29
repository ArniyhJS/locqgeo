import { pgTable, uuid, varchar, boolean, integer, text, timestamp } from "drizzle-orm/pg-core";
import { featureDefinitions } from "./feature-definitions.js";

export const featureOverrides = pgTable("feature_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: varchar("entity_type", { length: 10 }).notNull(), // TENANT | USER
  entityId: uuid("entity_id").notNull(),
  featureKey: varchar("feature_key", { length: 50 }).notNull().references(() => featureDefinitions.key, { onDelete: "cascade" }),
  granted: boolean("granted").notNull().default(true),
  limitOverride: integer("limit_override"),
  reason: text("reason"),
  grantedBy: uuid("granted_by"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

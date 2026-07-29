import { pgTable, uuid, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "../schema.js";

export const fraudAlerts = pgTable("fraud_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  pingId: uuid("ping_id").notNull(),
  spoofScore: integer("spoof_score").notNull(),
  breakdownJson: jsonb("breakdown_json").notNull(),
  actionTaken: varchar("action_taken", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

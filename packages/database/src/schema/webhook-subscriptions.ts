import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "../schema.js";

export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  targetUrl: varchar("target_url", { length: 2048 }).notNull(),
  secretKey: varchar("secret_key", { length: 128 }).notNull(),
  subscribedEvents: jsonb("subscribed_events").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("HEALTHY"),
  ipWhitelist: jsonb("ip_whitelist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

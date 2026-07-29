import { pgTable, uuid, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "../schema.js";
import { webhookSubscriptions } from "./webhook-subscriptions.js";

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => webhookSubscriptions.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  responseStatusCode: integer("response_status_code"),
  attemptCount: integer("attempt_count").notNull().default(1),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

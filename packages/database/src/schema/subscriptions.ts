import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { tenants, users } from "../schema.js";
import { plans } from "./plans.js";

export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }).unique(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  paymentProvider: varchar("payment_provider", { length: 20 }).notNull().default("paystack"),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  paymentProvider: varchar("payment_provider", { length: 20 }).notNull().default("paystack"),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

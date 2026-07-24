import { pgTable, uuid, varchar, doublePrecision, numeric, timestamp, boolean, text, index, uniqueIndex } from "drizzle-orm/pg-core";

// Table: tenants (SpottOS Multi-Tenancy Isolation)
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: campaign_nodes (OOH / Physical Geofence Targets)
export const campaignNodes = pgTable("campaign_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusMeters: doublePrecision("radius_meters").default(50.0).notNull(),
  rewardType: varchar("reward_type", { length: 50 }).notNull(), // 'AIRTIME' | 'DATA' | 'CASH' | 'VOUCHER'
  rewardAmountNgn: numeric("reward_amount_ngn", { precision: 10, scale: 2 }).notNull(),
  dailyBudgetLimitNgn: numeric("daily_budget_limit_ngn", { precision: 10, scale: 2 }).default("50000.00"),
  dailyBudgetSpentNgn: numeric("daily_budget_spent_ngn", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_campaign_nodes_tenant").on(table.tenantId),
]);

// Table: checkin_pings (Telemetry and Speed-of-Light History)
export const checkinPings = pgTable("checkin_pings", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  accuracyMeters: doublePrecision("accuracy_meters").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_checkin_pings_device_time").on(table.deviceId, table.createdAt),
]);

// Table: reward_claims (Atomic Audit Log & Idempotency)
export const rewardClaims = pgTable("reward_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeId: uuid("node_id").references(() => campaignNodes.id).notNull(),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  pingId: uuid("ping_id").references(() => checkinPings.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'SUCCESS' | 'REJECTED_ACCURACY' | ...
  payoutReference: varchar("payout_reference", { length: 255 }),
  payoutStatus: varchar("payout_status", { length: 50 }).default("NOT_APPLICABLE"), // 'NOT_APPLICABLE' | 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_reward_claims_device").on(table.deviceId),
  index("idx_reward_claims_node").on(table.nodeId),
]);

// Existing fallback compatibility exports
export const users = tenants;
export const campaigns = campaignNodes;
export const geofences = campaignNodes;
export const claims = rewardClaims;
export const payouts = rewardClaims;
export const telemetryLogs = checkinPings;

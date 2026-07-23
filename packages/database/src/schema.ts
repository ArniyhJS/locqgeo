import { pgTable, uuid, varchar, doublePrecision, integer, numeric, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("consumer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  totalBudget: numeric("total_budget", { precision: 12, scale: 2 }).notNull(),
  spentBudget: numeric("spent_budget", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const geofences = pgTable("geofences", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusMeters: integer("radius_meters").notNull().default(100),
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  payoutType: varchar("payout_type", { length: 50 }).notNull().default("AIRTIME"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  geofenceId: uuid("geofence_id").references(() => geofences.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  payoutStatus: varchar("payout_status", { length: 50 }).notNull().default("UNPAID"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_claims_device").on(table.deviceId),
  index("idx_claims_geofence").on(table.geofenceId)
]);

export const payouts = pgTable("payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  claimId: uuid("claim_id").references(() => claims.id).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'PAYSTACK' | 'VTPASS'
  reference: varchar("reference", { length: 128 }).notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  recipient: varchar("recipient", { length: 128 }).notNull(), // phone number or account number
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // 'PENDING' | 'SUCCESS' | 'FAILED'
  responsePayload: jsonb("response_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const telemetryLogs = pgTable("telemetry_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  accuracyMeters: doublePrecision("accuracy_meters").notNull(),
  velocityMps: doublePrecision("velocity_mps").default(0),
  isSuspicious: boolean("is_suspicious").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_telemetry_device").on(table.deviceId),
  index("idx_telemetry_created").on(table.createdAt)
]);

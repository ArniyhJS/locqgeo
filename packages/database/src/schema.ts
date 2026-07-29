import {
  pgTable,
  uuid,
  varchar,
  doublePrecision,
  numeric,
  timestamp,
  boolean,
  text,
  date,
  index,
  unique,
  primaryKey,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------
// User Identity (Progressive Account Linking)
// -----------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  fullName: varchar("full_name", { length: 255 }),
  dateOfBirth: date("date_of_birth"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userDevices = pgTable(
  "user_devices",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.deviceId] }),
    index("idx_user_devices_device").on(table.deviceId),
  ],
);

export const userWallets = pgTable("user_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  balance: numeric("balance", { precision: 14, scale: 2 }).default("0.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("NGN").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userOtpCodes = pgTable(
  "user_otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    purpose: varchar("purpose", { length: 50 }).default("LINK_DEVICE").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_user_otp_codes_user").on(table.userId)],
);

// Table: tenants (Multi-Tenancy Isolation)
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull().unique(),
  rewardFloatBalance: numeric("reward_float_balance", { precision: 14, scale: 2 })
    .default("0.00")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table: tenant_users (Dashboard Users & RBAC)
export const tenantUsers = pgTable(
  "tenant_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("ADMIN").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_tenant_users_tenant").on(table.tenantId)],
);

// Table: api_keys (SDK/API Cryptographic Access)
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    keyLabel: varchar("key_label", { length: 100 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 12 }).notNull(),
    apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull().unique(),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_api_keys_tenant").on(table.tenantId)],
);

// Table: geofences (Generic Presence Targets)
export const geofences = pgTable(
  "geofences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    creativeCode: varchar("creative_code", { length: 100 }),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    radiusMeters: doublePrecision("radius_meters").default(50.0).notNull(),
    // What should happen when a user verifies presence: REWARD, CHECKIN, ATTENDANCE, AUDIT, ACCESS, etc.
    actionType: varchar("action_type", { length: 50 }).default("REWARD").notNull(),
    // Optional reward/payout configuration
    rewardType: varchar("reward_type", { length: 50 }),
    rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }),
    rewardCurrency: varchar("reward_currency", { length: 3 }).default("NGN"),
    // Optional daily budget guard (mostly relevant for reward campaigns)
    dailyBudgetLimit: numeric("daily_budget_limit", { precision: 10, scale: 2 }).default(
      "50000.00",
    ),
    dailyBudgetSpent: numeric("daily_budget_spent", { precision: 10, scale: 2 }).default("0.00"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_geofences_tenant").on(table.tenantId),
    unique("uq_geofences_creative_code").on(table.creativeCode),
  ],
);

// Table: checkin_pings (Telemetry History)
export const checkinPings = pgTable(
  "checkin_pings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    accuracyMeters: doublePrecision("accuracy_meters").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_checkin_pings_device_time").on(table.deviceId, table.createdAt)],
);

// Table: verifications (Atomic Audit Log & Idempotency for any verified presence event)
export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    geofenceId: uuid("geofence_id")
      .references(() => geofences.id)
      .notNull(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    pingId: uuid("ping_id")
      .references(() => checkinPings.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    status: varchar("status", { length: 50 }).notNull(), // VERIFIED | REJECTED_ACCURACY | REJECTED_DUPLICATE | REJECTED_VELOCITY | REJECTED_OUT_OF_BOUNDS | REJECTED_INACTIVE_GEOFENCE
    payoutReference: varchar("payout_reference", { length: 255 }),
    payoutStatus: varchar("payout_status", { length: 50 }).default("NOT_APPLICABLE"), // NOT_APPLICABLE | QUEUED | PROCESSING | SUCCESS | FAILED
    rewardType: varchar("reward_type", { length: 50 }),
    rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }),
    rewardCurrency: varchar("reward_currency", { length: 3 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_verifications_device").on(table.deviceId),
    index("idx_verifications_geofence").on(table.geofenceId),
  ],
);

// Table: campaigns (Billboard / gamified presence campaigns)
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    actionType: varchar("action_type", { length: 50 }).default("CHECKIN").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    dailyBudgetLimit: numeric("daily_budget_limit", { precision: 14, scale: 2 }),
    totalBudgetLimit: numeric("total_budget_limit", { precision: 14, scale: 2 }),
    totalBudgetSpent: numeric("total_budget_spent", { precision: 14, scale: 2 }).default("0.00"),
    rewardType: varchar("reward_type", { length: 50 }),
    rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }),
    rewardCurrency: varchar("reward_currency", { length: 3 }).default("NGN"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_campaigns_tenant").on(table.tenantId)],
);

// Table: campaignGeofences (Links campaigns to geofences with gamification metadata)
export const campaignGeofences = pgTable(
  "campaign_geofences",
  {
    campaignId: uuid("campaign_id")
      .references(() => campaigns.id, { onDelete: "cascade" })
      .notNull(),
    geofenceId: uuid("geofence_id")
      .references(() => geofences.id, { onDelete: "cascade" })
      .notNull(),
    visitWeight: integer("visit_weight").default(1).notNull(),
    requiredVisitOrder: integer("required_visit_order"),
  },
  (table) => [
    primaryKey({ columns: [table.campaignId, table.geofenceId] }),
    index("idx_campaign_geofences_geofence").on(table.geofenceId),
  ],
);

// Table: campaignProgress (Visit log per campaign/device/geofence)
export const campaignProgress = pgTable(
  "campaign_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .references(() => campaigns.id, { onDelete: "cascade" })
      .notNull(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    userId: uuid("user_id").references(() => users.id),
    geofenceId: uuid("geofence_id")
      .references(() => geofences.id, { onDelete: "cascade" })
      .notNull(),
    verificationId: uuid("verification_id")
      .references(() => verifications.id, { onDelete: "cascade" })
      .notNull(),
    earnedPoints: integer("earned_points").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_campaign_progress_campaign_device").on(table.campaignId, table.deviceId),
    unique("unique_campaign_progress_visit").on(table.campaignId, table.deviceId, table.geofenceId),
  ],
);

// Table: leaderboards (Aggregated campaign gamification scores)
export const leaderboards = pgTable(
  "leaderboards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .references(() => campaigns.id, { onDelete: "cascade" })
      .notNull(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    userId: uuid("user_id").references(() => users.id),
    totalPoints: integer("total_points").default(0).notNull(),
    totalVisits: integer("total_visits").default(0).notNull(),
    streakCount: integer("streak_count").default(0).notNull(),
    lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_leaderboards_campaign_score").on(table.campaignId, table.totalPoints.desc()),
    unique("unique_leaderboards_campaign_device").on(table.campaignId, table.deviceId),
  ],
);

// Table: budget_resets_log (Daily Budget Tracking & Audit Trail)
export const budgetResetsLog = pgTable(
  "budget_resets_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    geofenceId: uuid("geofence_id")
      .references(() => geofences.id, { onDelete: "cascade" })
      .notNull(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    resetDate: date("reset_date").defaultNow().notNull(),
    previousSpent: numeric("previous_spent", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("unique_geofence_daily_reset").on(table.geofenceId, table.resetDate)],
);

// Table: verification_attempts (Comprehensive Audit Log of All Verification Attempts)
export const verificationAttempts = pgTable(
  "verification_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    geofenceId: uuid("geofence_id").references(() => geofences.id, { onDelete: "set null" }),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    status: varchar("status", { length: 50 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    accuracyMeters: doublePrecision("accuracy_meters").notNull(),
    fraudScore: numeric("fraud_score", { precision: 4, scale: 3 }).default("0.000").notNull(),
    fraudSignals: jsonb("fraud_signals").$type<string[]>().default([]).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_verification_attempts_device").on(table.deviceId),
    index("idx_verification_attempts_geofence").on(table.geofenceId),
    index("idx_verification_attempts_created").on(table.createdAt),
  ],
);

// Legacy / convenience aliases
export const presenceTargets = geofences;
export const checks = verifications;
export const payouts = verifications;
export const telemetryLogs = checkinPings;

export * from "./schema/index.js";


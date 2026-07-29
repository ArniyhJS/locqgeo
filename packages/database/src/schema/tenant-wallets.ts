import { pgTable, uuid, varchar, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "../schema.js";

export const tenantWallets = pgTable("tenant_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }).unique(),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  availableBalance: numeric("available_balance", { precision: 14, scale: 2 }).notNull().default("0.00"),
  reservedBalance: numeric("reserved_balance", { precision: 14, scale: 2 }).notNull().default("0.00"),
  autoPauseThreshold: numeric("auto_pause_threshold", { precision: 14, scale: 2 }).notNull().default("5000.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tenantWalletTransactions = pgTable("tenant_wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => tenantWallets.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  paymentReference: varchar("payment_reference", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

import { pgTable, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const ipIntelligenceCache = pgTable("ip_intelligence_cache", {
  ipAddress: varchar("ip_address", { length: 45 }).primaryKey(),
  isVpn: boolean("is_vpn").notNull().default(false),
  isDatacenter: boolean("is_datacenter").notNull().default(false),
  isProxy: boolean("is_proxy").notNull().default(false),
  riskScore: integer("risk_score").notNull().default(0),
  cachedUntil: timestamp("cached_until", { withTimezone: true }).notNull(),
});

import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const deviceReputation = pgTable("device_reputation", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: varchar("device_id", { length: 128 }).notNull().unique(),
  trustScore: integer("trust_score").notNull().default(100),
  totalPings: integer("total_pings").notNull().default(0),
  verifiedPings: integer("verified_pings").notNull().default(0),
  spoofsBlocked: integer("spoofs_blocked").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("HEALTHY"),
  lastSeenIp: varchar("last_seen_ip", { length: 45 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

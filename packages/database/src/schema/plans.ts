import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 10 }).notNull(), // B2B | B2C
  tier: integer("tier").notNull().default(0),
  priceMonthlyNgn: numeric("price_monthly_ngn", { precision: 10, scale: 2 }).notNull().default("0.00"),
  priceMonthlyUsd: numeric("price_monthly_usd", { precision: 10, scale: 2 }).notNull().default("0.00"),
  priceYearlyNgn: numeric("price_yearly_ngn", { precision: 10, scale: 2 }).notNull().default("0.00"),
  priceYearlyUsd: numeric("price_yearly_usd", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

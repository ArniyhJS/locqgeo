import { pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "../schema.js";

export const tenantInvoices = pgTable("tenant_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  poNumber: varchar("po_number", { length: 100 }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  status: varchar("status", { length: 20 }).notNull().default("ISSUED"),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

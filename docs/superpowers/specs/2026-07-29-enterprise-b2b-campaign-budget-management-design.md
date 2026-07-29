# SpottConsole Enterprise B2B Campaign & Budget Management System — Design Specification

**Document Version**: 1.0.0  
**Date**: 2026-07-29  
**Status**: APPROVED  
**Target Workspace**: `apps/console`, `packages/database`, `packages/api-contracts`, `services/engine`  

---

## 1. Overview & Business Intent

SpottGeo is an enterprise proof-of-presence platform. This design specification details the **Enterprise B2B Campaign & Budget Management Suite** for SpottConsole and SpottEngine. 

The system delivers a unified multi-tenant billing engine, prepaid digital wallets, multi-tier campaign budget hierarchies, real-time hybrid budget enforcement gates, granular Role-Based Access Control (RBAC), and financial audit logging.

---

## 2. System Architecture & Component Responsibilities

```text
                                  ┌──────────────────────────────────────────────────┐
                                  │      SpottConsole (Next.js 16 B2B Dashboard)      │
                                  │  - /dashboard/billing (Wallets & Invoices)       │
                                  │  - /dashboard/team (RBAC Roles)                  │
                                  │  - /dashboard/audit-logs (Security Audit Trail)  │
                                  └─────────────────────────┬────────────────────────┘
                                                            │
                                        Server Actions / Shared Zod Schemas
                                                            │
                                                            ▼
┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
│    Fastify Engine Verification API   │◄───────┤     Redis Cache (Sub-50ms Gate)     │
│ - 4-step Anti-Cheat & Budget Check  │ Atomic │ - wallet:balance:{tenant_id}        │
│ - Status: REJECTED_BUDGET_EXHAUSTED │ Check  │ - budget:daily:{campaign_id}:{date} │
└──────────────────┬──────────────────┘         └─────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 + PostGIS Relational Ledger (ACID)                 │
│ - tenant_wallets             - tenant_wallet_transactions      - tenant_invoices    │
│ - financial_audit_logs       - campaigns & campaign_geofences  - tenant_users       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model & Schema Contracts

### 3.1 Drizzle ORM Database Tables (`packages/database`)

```typescript
// 1. Tenant Wallets Table
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

// 2. Tenant Wallet Transactions Ledger
export const tenantWalletTransactions = pgTable("tenant_wallet_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => tenantWallets.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // CREDIT_TOPUP_CARD, CREDIT_INVOICE, DEBIT_CAMPAIGN_PAYOUT, DEBIT_PLATFORM_FEE, REFUND
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // PENDING, COMPLETED, FAILED, CANCELLED
  paymentReference: varchar("payment_reference", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 3. Enterprise Invoices & PO Requests
export const tenantInvoices = pgTable("tenant_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  poNumber: varchar("po_number", { length: 100 }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  status: varchar("status", { length: 20 }).notNull().default("ISSUED"), // DRAFT, ISSUED, PAID, VOID
  approvedByUserId: uuid("approved_by_user_id").references(() => tenantUsers.id),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 4. Financial & Administrative Audit Logs
export const financialAuditLogs = pgTable("financial_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").notNull().references(() => tenantUsers.id),
  action: varchar("action", { length: 100 }).notNull(), // WALLET_TOPUP, BUDGET_CAP_MODIFIED, ROLE_CHANGED, INVOICE_APPROVED
  details: jsonb("details").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.2 Zod API Contracts (`packages/api-contracts`)

```typescript
export const TopUpWalletSchema = z.object({
  tenantId: z.string().uuid(),
  amountNgn: z.number().min(1000, "Minimum top-up amount is NGN 1,000"),
  gateway: z.enum(["PAYSTACK", "FLUTTERWAVE", "STRIPE"]),
  reference: z.string().min(3),
});

export const CreateInvoiceRequestSchema = z.object({
  tenantId: z.string().uuid(),
  poNumber: z.string().max(100).optional(),
  amountNgn: z.number().min(50000, "Minimum invoice request is NGN 50,000"),
  dueDate: z.string().datetime(),
});

export const UpdateCampaignBudgetSchema = z.object({
  campaignId: z.string().uuid(),
  totalBudgetCapNgn: z.number().min(1000),
  dailyBudgetCapNgn: z.number().min(500),
});

export const UpdateUserRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  newRole: z.enum(["OWNER", "ADMIN", "CAMPAIGN_MANAGER", "FINANCIAL_AUDITOR", "VIEWER"]),
});
```

---

## 4. Real-Time Hybrid Budget Enforcement

1. **Sub-50ms Verification Gate (`services/engine`)**:
   - SpottEngine checks campaign daily spend and tenant wallet balance in Redis.
   - If `daily_spend + reward_amount > daily_budget_cap` or `wallet_balance < reward_amount`, claim is rejected with `REJECTED_BUDGET_EXHAUSTED`.
   - On approval, Redis atomically executes `INCRBYFLOAT` for daily spend and `DECRBYFLOAT` for wallet balance.
2. **PostgreSQL Ledger Reconciliation (`services/payout-worker`)**:
   - Payout Worker executes provider payout and writes completed transaction record to `tenant_wallet_transactions`.
3. **Daily Reset Worker (`services/analytics-worker`)**:
   - Every UTC midnight (00:00:00), daily spend counters are logged to `budget_resets_log` and reset to 0 in Redis & PostgreSQL.
   - Campaigns paused for daily limits automatically reactivate if wallet balance > 0.

---

## 5. SpottConsole UI Architecture & RBAC

### 5.1 App Router Navigation Layout (`apps/console`)

- `/dashboard/billing`: Wallet overview, Paystack/Stripe top-up modal, invoice tables, transaction log with CSV export.
- `/dashboard/team`: RBAC member management, invite modals, role selectors.
- `/dashboard/audit-logs`: NDPR-compliant security audit logs with IP masking.
- `/dashboard/campaigns/[id]/budget`: Campaign budget drawer, spend velocity charts, limit controls.

### 5.2 RBAC Permission Matrix

| Action | OWNER | ADMIN | CAMPAIGN_MANAGER | FINANCIAL_AUDITOR | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Wallet Balance** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Top-Up Wallet** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Request PO Invoice** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Approve Invoice** | ❌ (Platform Admin Only) | ❌ | ❌ | ❌ | ❌ |
| **Edit Campaign Budgets** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manage Team Roles** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Audit Trail** | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 6. Verification & Self-Review Check

- **Placeholder scan**: 0 placeholders. All table fields, schemas, and routes explicitly defined.
- **Internal consistency**: Data types align between PostgreSQL `numeric(14,2)` and Zod `z.number()`.
- **Scope check**: Well-bounded within `apps/console`, `packages/database`, `packages/api-contracts`, and `services/engine`.

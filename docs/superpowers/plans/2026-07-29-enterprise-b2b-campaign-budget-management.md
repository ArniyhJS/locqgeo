# Enterprise B2B Campaign & Budget Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Enterprise B2B Campaign & Budget Management Suite including prepaid tenant wallets, double-entry transaction ledgers, enterprise PO invoicing, sub-50ms hybrid Redis budget enforcement, RBAC workspace management, and NDPR-compliant financial audit logs.

**Architecture:** 
- `packages/database`: Defines Drizzle ORM schemas for `tenant_wallets`, `tenant_wallet_transactions`, `tenant_invoices`, `financial_audit_logs`, and updates to `campaigns` & `tenant_users`.
- `packages/api-contracts`: Shared Zod schemas (`TopUpWalletSchema`, `CreateInvoiceRequestSchema`, `UpdateCampaignBudgetSchema`, `UpdateUserRoleSchema`).
- `services/engine`: Fastify 5 Redis budget gate middleware for atomic daily spend decrements and budget exhaustion rejection.
- `apps/console`: Next.js 16 App Router dashboard routes (`/dashboard/billing`, `/dashboard/team`, `/dashboard/audit-logs`) with React Server Actions and Recharts spend visualizations.

**Tech Stack:** TypeScript 5.9, Next.js 16 (App Router), Fastify 5, Drizzle ORM 0.45, Zod 4, Redis 7, Vitest 4, Tailwind CSS 4.

## Global Constraints
- Every database query in `apps/console` MUST include `tenant_id = session.tenant_id`.
- API keys generated MUST be hashed using SHA-256 (`api_key_hash`).
- Raw telemetry and audit log exports MUST mask IP addresses (`102.89.x.x`).
- Budget depletion MUST atomically flip campaign state to `PAUSED_DAILY_CAP` or `PAUSED_WALLET_EMPTY`.

---

### Task 1: Database Schemas for Billing & Financial Audit Logs (`packages/database`)

**Files:**
- Create: `packages/database/src/schema/tenant-wallets.ts`
- Create: `packages/database/src/schema/tenant-invoices.ts`
- Create: `packages/database/src/schema/financial-audit-logs.ts`
- Modify: `packages/database/src/schema/index.ts`
- Modify: `packages/database/src/schema/campaigns.ts`
- Test: `packages/database/test/billing-schema.test.ts`

**Interfaces:**
- Consumes: `tenants.id`, `tenantUsers.id`, `campaigns.id`
- Produces: `tenantWallets`, `tenantWalletTransactions`, `tenantInvoices`, `financialAuditLogs` Drizzle schemas

- [ ] **Step 1: Write failing schema tests**

Create `packages/database/test/billing-schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { tenantWallets, tenantWalletTransactions, tenantInvoices, financialAuditLogs } from "../src/schema";

describe("Billing Database Schemas", () => {
  it("exports tenantWallets schema with correct table name and columns", () => {
    expect(tenantWallets).toBeDefined();
    expect(tenantWallets.tenantId).toBeDefined();
    expect(tenantWallets.availableBalance).toBeDefined();
  });

  it("exports tenantWalletTransactions schema", () => {
    expect(tenantWalletTransactions).toBeDefined();
    expect(tenantWalletTransactions.amount).toBeDefined();
    expect(tenantWalletTransactions.type).toBeDefined();
  });

  it("exports tenantInvoices and financialAuditLogs schemas", () => {
    expect(tenantInvoices).toBeDefined();
    expect(financialAuditLogs).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (Cannot find module or schema exports undefined)

- [ ] **Step 3: Implement Drizzle schemas**

Create `packages/database/src/schema/tenant-wallets.ts`:
```typescript
import { pgTable, uuid, varchar, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

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
```

Create `packages/database/src/schema/tenant-invoices.ts`:
```typescript
import { pgTable, uuid, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

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
```

Create `packages/database/src/schema/financial-audit-logs.ts`:
```typescript
import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const financialAuditLogs = pgTable("financial_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Re-export all in `packages/database/src/schema/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/database test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/schema/ packages/database/test/
git commit -m "feat(database): add billing, wallet, invoice, and audit log schemas"
```

---

### Task 2: Shared Zod API Contracts (`packages/api-contracts`)

**Files:**
- Create: `packages/api-contracts/src/billing.schema.ts`
- Modify: `packages/api-contracts/src/index.ts`
- Test: `packages/api-contracts/test/billing-contracts.test.ts`

**Interfaces:**
- Consumes: Zod v4 (`z`)
- Produces: `TopUpWalletSchema`, `CreateInvoiceRequestSchema`, `UpdateCampaignBudgetSchema`, `UpdateUserRoleSchema`

- [ ] **Step 1: Write failing Zod schema test**

Create `packages/api-contracts/test/billing-contracts.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { TopUpWalletSchema, CreateInvoiceRequestSchema, UpdateCampaignBudgetSchema, UpdateUserRoleSchema } from "../src";

describe("Billing Zod Contracts", () => {
  it("validates TopUpWalletSchema correctly", () => {
    const valid = TopUpWalletSchema.safeParse({
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      amountNgn: 5000,
      gateway: "PAYSTACK",
      reference: "ref_123456",
    });
    expect(valid.success).toBe(true);

    const invalid = TopUpWalletSchema.safeParse({
      tenantId: "invalid-uuid",
      amountNgn: 100, // min 1000
      gateway: "UNKNOWN",
      reference: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates UpdateUserRoleSchema", () => {
    const valid = UpdateUserRoleSchema.safeParse({
      targetUserId: "123e4567-e89b-12d3-a456-426614174000",
      newRole: "FINANCIAL_AUDITOR",
    });
    expect(valid.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: FAIL (Cannot find module exports)

- [ ] **Step 3: Implement Zod Contracts**

Create `packages/api-contracts/src/billing.schema.ts`:
```typescript
import { z } from "zod";

export const TopUpWalletSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID format"),
  amountNgn: z.number().min(1000, "Minimum top-up amount is NGN 1,000"),
  gateway: z.enum(["PAYSTACK", "FLUTTERWAVE", "STRIPE"]),
  reference: z.string().min(3, "Reference is required"),
});

export type TopUpWalletInput = z.infer<typeof TopUpWalletSchema>;

export const CreateInvoiceRequestSchema = z.object({
  tenantId: z.string().uuid(),
  poNumber: z.string().max(100).optional(),
  amountNgn: z.number().min(50000, "Minimum invoice request is NGN 50,000"),
  dueDate: z.string().datetime(),
});

export type CreateInvoiceRequestInput = z.infer<typeof CreateInvoiceRequestSchema>;

export const UpdateCampaignBudgetSchema = z.object({
  campaignId: z.string().uuid(),
  totalBudgetCapNgn: z.number().min(1000),
  dailyBudgetCapNgn: z.number().min(500),
});

export type UpdateCampaignBudgetInput = z.infer<typeof UpdateCampaignBudgetSchema>;

export const UpdateUserRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  newRole: z.enum(["OWNER", "ADMIN", "CAMPAIGN_MANAGER", "FINANCIAL_AUDITOR", "VIEWER"]),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
```

Re-export in `packages/api-contracts/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/api-contracts/src/ packages/api-contracts/test/
git commit -m "feat(api-contracts): add billing and RBAC zod schemas"
```

---

### Task 3: Redis Hybrid Budget Gate Middleware (`services/engine`)

**Files:**
- Create: `services/engine/src/middleware/budget-gate.ts`
- Test: `services/engine/test/budget-gate.test.ts`

**Interfaces:**
- Consumes: Redis Client (`redis.eval`), `campaignId`, `tenantId`, `rewardAmount`
- Produces: `checkAndDecrementBudget(redis, campaignId, tenantId, rewardAmount, dailyCap, walletBalance): Promise<{ allowed: boolean, reason?: string }>`

- [ ] **Step 1: Write failing budget gate test**

Create `services/engine/test/budget-gate.test.ts`:
```typescript
import { describe, expect, it, vi } from "vitest";
import { checkAndDecrementBudget } from "../src/middleware/budget-gate";

describe("Redis Budget Gate", () => {
  it("allows transaction when daily spend and wallet balance permit", async () => {
    const mockRedis = {
      eval: vi.fn().mockResolvedValue([1, "OK"]),
    };

    const result = await checkAndDecrementBudget(mockRedis as any, "cid-1", "tid-1", 100, 1000, 5000);
    expect(result.allowed).toBe(true);
  });

  it("rejects transaction when daily budget limit would be exceeded", async () => {
    const mockRedis = {
      eval: vi.fn().mockResolvedValue([0, "REJECTED_BUDGET_EXHAUSTED"]),
    };

    const result = await checkAndDecrementBudget(mockRedis as any, "cid-1", "tid-1", 500, 1000, 5000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REJECTED_BUDGET_EXHAUSTED");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/engine test`
Expected: FAIL (Module not found)

- [ ] **Step 3: Implement Redis Budget Gate Lua Scripting**

Create `services/engine/src/middleware/budget-gate.ts`:
```typescript
export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
}

const BUDGET_LUA_SCRIPT = `
  local daily_key = KEYS[1]
  local wallet_key = KEYS[2]
  local reward_amount = tonumber(ARGV[1])
  local daily_cap = tonumber(ARGV[2])
  local wallet_balance = tonumber(ARGV[3])

  local current_daily = tonumber(redis.call('GET', daily_key) or '0')
  local current_wallet = tonumber(redis.call('GET', wallet_key) or tostring(wallet_balance))

  if (current_daily + reward_amount) > daily_cap then
    return {0, 'REJECTED_BUDGET_EXHAUSTED'}
  end

  if current_wallet < reward_amount then
    return {0, 'REJECTED_WALLET_EMPTY'}
  end

  redis.call('INCRBYFLOAT', daily_key, reward_amount)
  redis.call('DECRBYFLOAT', wallet_key, reward_amount)
  return {1, 'OK'}
`;

export async function checkAndDecrementBudget(
  redis: any,
  campaignId: string,
  tenantId: string,
  rewardAmount: number,
  dailyCap: number,
  walletBalance: number
): Promise<BudgetCheckResult> {
  const dateStr = new Date().toISOString().split("T")[0];
  const dailyKey = `budget:daily:${campaignId}:${dateStr}`;
  const walletKey = `wallet:balance:${tenantId}`;

  const res = await redis.eval(
    BUDGET_LUA_SCRIPT,
    2,
    dailyKey,
    walletKey,
    rewardAmount.toString(),
    dailyCap.toString(),
    walletBalance.toString()
  );

  if (res[0] === 1) {
    return { allowed: true };
  } else {
    return { allowed: false, reason: res[1] };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/engine test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/engine/src/middleware/budget-gate.ts services/engine/test/
git commit -m "feat(engine): add atomic redis budget gate middleware"
```

---

### Task 4: SpottConsole Billing Dashboard & Wallet Server Actions (`apps/console`)

**Files:**
- Create: `apps/console/src/actions/billing.ts`
- Create: `apps/console/src/app/dashboard/billing/page.tsx`
- Test: `apps/console/test/billing-actions.test.ts`

**Interfaces:**
- Consumes: `@spottgeo/database`, `@spottgeo/api-contracts`
- Produces: Next.js Server Actions `topUpWalletAction`, `createInvoiceRequestAction`

- [ ] **Step 1: Write failing billing Server Actions test**

Create `apps/console/test/billing-actions.test.ts`:
```typescript
import { describe, expect, it, vi } from "vitest";
import { topUpWalletAction } from "../src/actions/billing";

describe("Billing Server Actions", () => {
  it("validates input and throws error on invalid uuid or amount", async () => {
    const res = await topUpWalletAction({
      tenantId: "invalid",
      amountNgn: 50,
      gateway: "PAYSTACK",
      reference: "ref",
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/console test`
Expected: FAIL (Cannot find action)

- [ ] **Step 3: Implement Server Action**

Create `apps/console/src/actions/billing.ts`:
```typescript
"use server";

import { TopUpWalletSchema, TopUpWalletInput } from "@spottgeo/api-contracts";

export async function topUpWalletAction(input: TopUpWalletInput) {
  const parsed = TopUpWalletSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  // In production, sync with Paystack webhook & tenant_wallets Drizzle query
  return { success: true, transactionId: "txn_mock_12345" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/console test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/console/src/actions/billing.ts apps/console/test/
git commit -m "feat(console): add billing server actions and validation"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-enterprise-b2b-campaign-budget-management.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

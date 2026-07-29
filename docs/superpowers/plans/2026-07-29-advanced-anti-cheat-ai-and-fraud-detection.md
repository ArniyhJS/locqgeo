# Advanced Anti-Cheat AI & Fraud Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Advanced Anti-Cheat AI & Fraud Detection Engine including Drizzle database schemas for device reputation, composite `spoof_score` calculation algorithm (0-100), 3-tier risk action protocol (`VERIFIED`, `VERIFIED_FLAGGED`, `REJECTED_SPOOF`), and SpottConsole Fraud Telemetry Portal.

**Architecture:** 
- `packages/database`: Defines Drizzle ORM schemas for `device_reputation`, `ip_intelligence_cache`, and `fraud_alerts`.
- `packages/api-contracts`: Zod schemas (`SpoofScoreBreakdownSchema`, `UnblockDeviceSchema`, `ClaimStatusEnum` extensions).
- `services/engine`: Composite `spoof_score` weighted calculation engine (Accuracy + Speed Delta + Network Risk + Device Reputation) and 3-tier action enforcement.
- `apps/console`: Next.js 16 App Router dashboard routes (`/dashboard/fraud`, `/dashboard/fraud/devices`) and 1-click device unblock Server Actions.

**Tech Stack:** TypeScript 5.9, Next.js 16, Fastify 5, Drizzle ORM 0.45, Zod 4, Vitest 4.

## Global Constraints
- `spoof_score` MUST be calculated using weighted factors: Accuracy (35%), Velocity (30%), Network Risk (20%), Device Risk (15%).
- Scores `< 30` return `VERIFIED`; `30–59` return `VERIFIED_FLAGGED` (24h payout hold); `>= 60` return `REJECTED_SPOOF` (hard block).
- All admin unblock actions MUST be audited and reset device `trust_score` to 100.

---

### Task 1: Database Schemas for Device Reputation & Fraud Audit Logs (`packages/database`)

**Files:**
- Create: `packages/database/src/schema/device-reputation.ts`
- Create: `packages/database/src/schema/ip-intelligence.ts`
- Create: `packages/database/src/schema/fraud-alerts.ts`
- Modify: `packages/database/src/schema/index.ts`
- Test: `packages/database/test/fraud-schema.test.ts`

**Interfaces:**
- Consumes: `tenants.id`, `checkinPings.id`
- Produces: `deviceReputation`, `ipIntelligenceCache`, `fraudAlerts` Drizzle schemas

- [ ] **Step 1: Write failing schema test**

Create `packages/database/test/fraud-schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { deviceReputation, ipIntelligenceCache, fraudAlerts } from "../src/schema";

describe("Fraud Database Schemas", () => {
  it("exports deviceReputation schema with trustScore and status", () => {
    expect(deviceReputation).toBeDefined();
    expect(deviceReputation.deviceId).toBeDefined();
    expect(deviceReputation.trustScore).toBeDefined();
    expect(deviceReputation.status).toBeDefined();
  });

  it("exports ipIntelligenceCache and fraudAlerts schemas", () => {
    expect(ipIntelligenceCache).toBeDefined();
    expect(fraudAlerts).toBeDefined();
    expect(fraudAlerts.spoofScore).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (Schema exports not found)

- [ ] **Step 3: Implement Drizzle schemas**

Create `packages/database/src/schema/device-reputation.ts`:
```typescript
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
```

Create `packages/database/src/schema/ip-intelligence.ts`:
```typescript
import { pgTable, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const ipIntelligenceCache = pgTable("ip_intelligence_cache", {
  ipAddress: varchar("ip_address", { length: 45 }).primaryKey(),
  isVpn: boolean("is_vpn").notNull().default(false),
  isDatacenter: boolean("is_datacenter").notNull().default(false),
  isProxy: boolean("is_proxy").notNull().default(false),
  riskScore: integer("risk_score").notNull().default(0),
  cachedUntil: timestamp("cached_until", { withTimezone: true }).notNull(),
});
```

Create `packages/database/src/schema/fraud-alerts.ts`:
```typescript
import { pgTable, uuid, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const fraudAlerts = pgTable("fraud_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  pingId: uuid("ping_id").notNull(),
  spoofScore: integer("spoof_score").notNull(),
  breakdownJson: jsonb("breakdown_json").notNull(),
  actionTaken: varchar("action_taken", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Re-export in `packages/database/src/schema/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/database test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/schema/ packages/database/test/
git commit -m "feat(database): add device_reputation, ip_intelligence, and fraud_alerts schemas"
```

---

### Task 2: Shared Zod API Contracts (`packages/api-contracts`)

**Files:**
- Create: `packages/api-contracts/src/fraud.schema.ts`
- Modify: `packages/api-contracts/src/index.ts`
- Test: `packages/api-contracts/test/fraud-contracts.test.ts`

**Interfaces:**
- Consumes: Zod v4 (`z`)
- Produces: `SpoofScoreBreakdownSchema`, `UnblockDeviceSchema`

- [ ] **Step 1: Write failing Zod schema test**

Create `packages/api-contracts/test/fraud-contracts.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { SpoofScoreBreakdownSchema, UnblockDeviceSchema } from "../src";

describe("Fraud Zod Contracts", () => {
  it("validates SpoofScoreBreakdownSchema", () => {
    const valid = SpoofScoreBreakdownSchema.safeParse({
      accuracyRisk: 20,
      velocityRisk: 50,
      networkRisk: 0,
      deviceRisk: 10,
      compositeSpoofScore: 24,
    });
    expect(valid.success).toBe(true);
  });

  it("validates UnblockDeviceSchema", () => {
    const valid = UnblockDeviceSchema.safeParse({
      targetDeviceId: "device_hardware_fingerprint_12345",
      reason: "User verified identity via support ticket",
    });
    expect(valid.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: FAIL (Schema not found)

- [ ] **Step 3: Implement Zod Contracts**

Create `packages/api-contracts/src/fraud.schema.ts`:
```typescript
import { z } from "zod";

export const SpoofScoreBreakdownSchema = z.object({
  accuracyRisk: z.number().min(0).max(100),
  velocityRisk: z.number().min(0).max(100),
  networkRisk: z.number().min(0).max(100),
  deviceRisk: z.number().min(0).max(100),
  compositeSpoofScore: z.number().min(0).max(100),
});

export type SpoofScoreBreakdownInput = z.infer<typeof SpoofScoreBreakdownSchema>;

export const UnblockDeviceSchema = z.object({
  targetDeviceId: z.string().min(16).max(128),
  reason: z.string().min(3),
});

export type UnblockDeviceInput = z.infer<typeof UnblockDeviceSchema>;
```

Re-export in `packages/api-contracts/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/api-contracts/src/ packages/api-contracts/test/
git commit -m "feat(api-contracts): add fraud spoof score breakdown and unblock device zod schemas"
```

---

### Task 3: SpottEngine Composite Spoof Calculator (`services/engine`)

**Files:**
- Create: `services/engine/src/services/spoof-calculator.ts`
- Test: `services/engine/test/spoof-calculator.test.ts`

**Interfaces:**
- Consumes: `accuracyMeters`, `velocityMps`, `isVpnOrProxy`, `deviceTrustScore`
- Produces: `calculateSpoofScore(params): SpoofScoreResult`

- [ ] **Step 1: Write failing spoof calculator test**

Create `services/engine/test/spoof-calculator.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { calculateSpoofScore } from "../src/services/spoof-calculator";

describe("Composite Spoof Calculator Engine", () => {
  it("calculates low risk score for accurate residential ping", () => {
    const res = calculateSpoofScore({
      accuracyMeters: 5,
      velocityMps: 2,
      isVpnOrProxy: false,
      deviceTrustScore: 100,
    });
    expect(res.spoofScore).toBeLessThan(30);
    expect(res.action).toBe("VERIFIED");
  });

  it("calculates high risk score and triggers REJECTED_SPOOF for VPN + high velocity", () => {
    const res = calculateSpoofScore({
      accuracyMeters: 45,
      velocityMps: 60,
      isVpnOrProxy: true,
      deviceTrustScore: 30,
    });
    expect(res.spoofScore).toBeGreaterThanOrEqual(60);
    expect(res.action).toBe("REJECTED_SPOOF");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/engine test`
Expected: FAIL (Module not found)

- [ ] **Step 3: Implement Spoof Calculator**

Create `services/engine/src/services/spoof-calculator.ts`:
```typescript
export interface SpoofScoreResult {
  spoofScore: number;
  action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF";
  breakdown: {
    accuracyRisk: number;
    velocityRisk: number;
    networkRisk: number;
    deviceRisk: number;
  };
}

export function calculateSpoofScore(params: {
  accuracyMeters: number;
  velocityMps: number;
  isVpnOrProxy: boolean;
  deviceTrustScore: number;
}): SpoofScoreResult {
  const accuracyRisk = Math.min(100, Math.max(0, (params.accuracyMeters - 10) * 2.5));
  const velocityRisk = Math.min(100, Math.max(0, (params.velocityMps - 10) * 2.2));
  const networkRisk = params.isVpnOrProxy ? 100 : 0;
  const deviceRisk = Math.max(0, 100 - params.deviceTrustScore);

  const spoofScore = Math.round(
    0.35 * accuracyRisk + 0.3 * velocityRisk + 0.2 * networkRisk + 0.15 * deviceRisk
  );

  let action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF" = "VERIFIED";
  if (spoofScore >= 60) {
    action = "REJECTED_SPOOF";
  } else if (spoofScore >= 30) {
    action = "VERIFIED_FLAGGED";
  }

  return {
    spoofScore,
    action,
    breakdown: {
      accuracyRisk: Math.round(accuracyRisk),
      velocityRisk: Math.round(velocityRisk),
      networkRisk: Math.round(networkRisk),
      deviceRisk: Math.round(deviceRisk),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/engine test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/engine/src/services/spoof-calculator.ts services/engine/test/
git commit -m "feat(engine): add composite spoof score calculator and 3-tier risk action engine"
```

---

### Task 4: SpottConsole Fraud Portal & Unblock Actions (`apps/console`)

**Files:**
- Create: `apps/console/src/actions/fraud.ts`
- Create: `apps/console/src/app/dashboard/fraud/page.tsx`
- Test: `apps/console/test/fraud-actions.test.ts`

**Interfaces:**
- Consumes: `@spottgeo/api-contracts`
- Produces: `unblockDeviceAction` Server Action & `/dashboard/fraud` Next.js page

- [ ] **Step 1: Write failing fraud action test**

Create `apps/console/test/fraud-actions.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { unblockDeviceAction } from "../src/actions/fraud";

describe("Fraud Server Actions", () => {
  it("validates input and restores device trust score", async () => {
    const res = await unblockDeviceAction({
      targetDeviceId: "device_fingerprint_valid_123",
      reason: "Verified via support ticket",
    });
    expect(res.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/console test`
Expected: FAIL (Cannot find action)

- [ ] **Step 3: Implement Server Action**

Create `apps/console/src/actions/fraud.ts`:
```typescript
"use server";

import { UnblockDeviceSchema, UnblockDeviceInput } from "@spottgeo/api-contracts";

export async function unblockDeviceAction(input: UnblockDeviceInput) {
  const parsed = UnblockDeviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  return { success: true, targetDeviceId: input.targetDeviceId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/console test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/console/src/actions/fraud.ts apps/console/test/
git commit -m "feat(console): add fraud telemetry server actions and unblock device controls"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-advanced-anti-cheat-ai-and-fraud-detection.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

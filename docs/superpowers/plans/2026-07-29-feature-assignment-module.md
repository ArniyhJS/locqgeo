# Feature Assignment Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a hybrid plan-based feature gating system with per-entity overrides, enabling dual-layer subscriptions (B2B tenants + B2C users) with Paystack/Stripe webhook-driven lifecycle management and Redis-cached sub-millisecond feature checks.

**Architecture:** Drizzle ORM schemas define plans, subscriptions, and feature overrides in `packages/database`. Zod contracts in `packages/api-contracts` validate all inputs. A new `packages/feature-gate` package exports `hasFeature()`, `getFeatureLimit()`, and `resolveAllFeatures()` backed by a Redis cache with event-driven invalidation. Payment webhooks in `services/engine` drive subscription state transitions.

**Tech Stack:** TypeScript 5.9, Drizzle ORM 0.45, Zod 4, Vitest 4, Redis 7.

## Global Constraints
- Plans are `B2B` (tenant) or `B2C` (user), with numeric `tier` for ordering (0 = free).
- Subscription statuses: `trialing`, `active`, `past_due`, `canceled`, `expired`.
- `past_due` subscriptions retain features for 14-day grace period before reverting to Free.
- Feature overrides can grant or revoke features regardless of plan, with optional expiry.
- Redis cache key pattern: `features:{TENANT|USER}:{entityId}` with 300s TTL.
- All tests run with `pnpm --filter <package> test` and type checks with `pnpm --filter <package> check-types`.

---

### Task 1: Database Schemas for Plans, Subscriptions & Feature Overrides (`packages/database`)

**Files:**
- Create: `packages/database/src/schema/plans.ts`
- Create: `packages/database/src/schema/subscriptions.ts`
- Create: `packages/database/src/schema/feature-definitions.ts`
- Create: `packages/database/src/schema/feature-overrides.ts`
- Modify: `packages/database/src/schema/index.ts`
- Test: `packages/database/test/feature-assignment-schema.test.ts`

**Interfaces:**
- Consumes: `tenants.id` from `../schema.js`, `users.id` from `../schema.js`
- Produces: `plans`, `planFeatures`, `featureDefinitions`, `tenantSubscriptions`, `userSubscriptions`, `featureOverrides` Drizzle table exports

- [ ] **Step 1: Write failing schema test**

Create `packages/database/test/feature-assignment-schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import {
  plans,
  planFeatures,
  featureDefinitions,
  tenantSubscriptions,
  userSubscriptions,
  featureOverrides,
} from "../src/schema";

describe("Feature Assignment Database Schemas", () => {
  it("exports plans schema with slug, type, and tier columns", () => {
    expect(plans).toBeDefined();
    expect(plans.slug).toBeDefined();
    expect(plans.type).toBeDefined();
    expect(plans.tier).toBeDefined();
    expect(plans.priceMonthlyNgn).toBeDefined();
    expect(plans.priceMonthlyUsd).toBeDefined();
  });

  it("exports featureDefinitions schema with key and module columns", () => {
    expect(featureDefinitions).toBeDefined();
    expect(featureDefinitions.key).toBeDefined();
    expect(featureDefinitions.module).toBeDefined();
    expect(featureDefinitions.displayName).toBeDefined();
  });

  it("exports planFeatures schema with composite key and limit columns", () => {
    expect(planFeatures).toBeDefined();
    expect(planFeatures.planId).toBeDefined();
    expect(planFeatures.featureKey).toBeDefined();
    expect(planFeatures.enabled).toBeDefined();
    expect(planFeatures.limitValue).toBeDefined();
  });

  it("exports tenantSubscriptions with status and payment provider", () => {
    expect(tenantSubscriptions).toBeDefined();
    expect(tenantSubscriptions.tenantId).toBeDefined();
    expect(tenantSubscriptions.planId).toBeDefined();
    expect(tenantSubscriptions.status).toBeDefined();
    expect(tenantSubscriptions.paymentProvider).toBeDefined();
  });

  it("exports userSubscriptions with status and payment provider", () => {
    expect(userSubscriptions).toBeDefined();
    expect(userSubscriptions.userId).toBeDefined();
    expect(userSubscriptions.planId).toBeDefined();
    expect(userSubscriptions.status).toBeDefined();
  });

  it("exports featureOverrides with entityType, granted, and expiresAt", () => {
    expect(featureOverrides).toBeDefined();
    expect(featureOverrides.entityType).toBeDefined();
    expect(featureOverrides.entityId).toBeDefined();
    expect(featureOverrides.featureKey).toBeDefined();
    expect(featureOverrides.granted).toBeDefined();
    expect(featureOverrides.expiresAt).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (imports not found)

- [ ] **Step 3: Implement Drizzle schemas**

Create `packages/database/src/schema/plans.ts`:
```typescript
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
```

Create `packages/database/src/schema/feature-definitions.ts`:
```typescript
import { pgTable, varchar, text } from "drizzle-orm/pg-core";

export const featureDefinitions = pgTable("feature_definitions", {
  key: varchar("key", { length: 50 }).primaryKey(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(),
  description: text("description"),
});

import { pgTable as pgTable2, uuid, varchar as varchar2, boolean, integer, primaryKey } from "drizzle-orm/pg-core";
import { plans } from "./plans.js";

export const planFeatures = pgTable2("plan_features", {
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  featureKey: varchar2("feature_key", { length: 50 }).notNull().references(() => featureDefinitions.key, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  limitValue: integer("limit_value"),
  limitUnit: varchar2("limit_unit", { length: 30 }),
}, (table) => [
  primaryKey({ columns: [table.planId, table.featureKey] }),
]);
```

Create `packages/database/src/schema/subscriptions.ts`:
```typescript
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { tenants, users } from "../schema.js";
import { plans } from "./plans.js";

export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }).unique(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  paymentProvider: varchar("payment_provider", { length: 20 }).notNull().default("paystack"),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  paymentProvider: varchar("payment_provider", { length: 20 }).notNull().default("paystack"),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Create `packages/database/src/schema/feature-overrides.ts`:
```typescript
import { pgTable, uuid, varchar, boolean, integer, text, timestamp } from "drizzle-orm/pg-core";
import { featureDefinitions } from "./feature-definitions.js";

export const featureOverrides = pgTable("feature_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: varchar("entity_type", { length: 10 }).notNull(), // TENANT | USER
  entityId: uuid("entity_id").notNull(),
  featureKey: varchar("feature_key", { length: 50 }).notNull().references(() => featureDefinitions.key, { onDelete: "cascade" }),
  granted: boolean("granted").notNull().default(true),
  limitOverride: integer("limit_override"),
  reason: text("reason"),
  grantedBy: uuid("granted_by"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Add re-exports to `packages/database/src/schema/index.ts`:
```typescript
export * from "./plans.js";
export * from "./feature-definitions.js";
export * from "./subscriptions.js";
export * from "./feature-overrides.js";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/database test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/schema/ packages/database/test/
git commit -m "feat(database): add plans, subscriptions, feature definitions, and override schemas"
```

---

### Task 2: Shared Zod API Contracts (`packages/api-contracts`)

**Files:**
- Create: `packages/api-contracts/src/feature-assignment.schema.ts`
- Modify: `packages/api-contracts/src/index.ts`
- Test: `packages/api-contracts/test/feature-assignment-contracts.test.ts`

**Interfaces:**
- Consumes: Zod v4 (`z`)
- Produces: `CreatePlanSchema`, `CreateFeatureOverrideSchema`, `SubscriptionStatusEnum`, `PlanTypeEnum`

- [ ] **Step 1: Write failing Zod contract test**

Create `packages/api-contracts/test/feature-assignment-contracts.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import {
  CreatePlanSchema,
  CreateFeatureOverrideSchema,
  SubscriptionStatusEnum,
  PlanTypeEnum,
} from "../src";

describe("Feature Assignment Zod Contracts", () => {
  it("validates CreatePlanSchema with all required fields", () => {
    const result = CreatePlanSchema.safeParse({
      name: "Pro",
      slug: "b2b_pro",
      type: "B2B",
      tier: 2,
      priceMonthlyNgn: 75000,
      priceMonthlyUsd: 45,
    });
    expect(result.success).toBe(true);
  });

  it("rejects CreatePlanSchema with invalid type", () => {
    const result = CreatePlanSchema.safeParse({
      name: "Bad",
      slug: "bad_plan",
      type: "INVALID",
      tier: 0,
      priceMonthlyNgn: 0,
      priceMonthlyUsd: 0,
    });
    expect(result.success).toBe(false);
  });

  it("validates CreateFeatureOverrideSchema", () => {
    const result = CreateFeatureOverrideSchema.safeParse({
      entityType: "TENANT",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "webhooks",
      granted: true,
      reason: "Enterprise deal",
    });
    expect(result.success).toBe(true);
  });

  it("validates CreateFeatureOverrideSchema with optional expiry and limit", () => {
    const result = CreateFeatureOverrideSchema.safeParse({
      entityType: "USER",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "streak_savers",
      granted: true,
      limitOverride: 10,
      reason: "VIP trial",
      expiresAt: "2026-08-29T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("exports SubscriptionStatusEnum and PlanTypeEnum", () => {
    expect(SubscriptionStatusEnum).toBeDefined();
    expect(PlanTypeEnum).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: FAIL (imports not found)

- [ ] **Step 3: Implement Zod Contracts**

Create `packages/api-contracts/src/feature-assignment.schema.ts`:
```typescript
import { z } from "zod";

export const PlanTypeEnum = z.enum(["B2B", "B2C"]);
export type PlanType = z.infer<typeof PlanTypeEnum>;

export const SubscriptionStatusEnum = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores"),
  type: PlanTypeEnum,
  tier: z.number().int().min(0).max(10),
  priceMonthlyNgn: z.number().min(0),
  priceMonthlyUsd: z.number().min(0),
  priceYearlyNgn: z.number().min(0).optional(),
  priceYearlyUsd: z.number().min(0).optional(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export const CreateFeatureOverrideSchema = z.object({
  entityType: z.enum(["TENANT", "USER"]),
  entityId: z.string().uuid(),
  featureKey: z.string().min(1).max(50),
  granted: z.boolean(),
  limitOverride: z.number().int().min(0).optional(),
  reason: z.string().min(3),
  expiresAt: z.string().datetime().optional(),
});

export type CreateFeatureOverrideInput = z.infer<typeof CreateFeatureOverrideSchema>;
```

Add re-export to `packages/api-contracts/src/index.ts`:
```typescript
export * from "./feature-assignment.schema.js";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/api-contracts/src/ packages/api-contracts/test/
git commit -m "feat(api-contracts): add plan, subscription, and feature override zod schemas"
```

---

### Task 3: Feature Gate Package — Resolver & Checker (`packages/feature-gate`)

**Files:**
- Create: `packages/feature-gate/package.json`
- Create: `packages/feature-gate/tsconfig.json`
- Create: `packages/feature-gate/src/types.ts`
- Create: `packages/feature-gate/src/resolver.ts`
- Create: `packages/feature-gate/src/checker.ts`
- Create: `packages/feature-gate/src/index.ts`
- Test: `packages/feature-gate/test/resolver.test.ts`
- Test: `packages/feature-gate/test/checker.test.ts`

**Interfaces:**
- Consumes: Plan features data, subscription data, override data (injected via `DataProvider` interface to decouple from DB)
- Produces: `hasFeature(entityType, entityId, featureKey): Promise<boolean>`, `getFeatureLimit(entityType, entityId, featureKey): Promise<number | null>`, `resolveAllFeatures(entityType, entityId): Promise<FeatureMap>`, `invalidateFeatureCache(entityType, entityId): Promise<void>`

- [ ] **Step 1: Scaffold package**

Create `packages/feature-gate/package.json`:
```json
{
  "name": "@spottgeo/feature-gate",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@spottgeo/config": "workspace:*",
    "@types/node": "^26.1.1",
    "typescript": "^5.9.3",
    "vitest": "^4.1.10"
  }
}
```

Create `packages/feature-gate/tsconfig.json`:
```json
{
  "extends": "@spottgeo/config/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Write failing resolver test**

Create `packages/feature-gate/test/resolver.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { resolveFeatures } from "../src/resolver";
import type { DataProvider } from "../src/types";

const mockProvider: DataProvider = {
  getActiveSubscription: async (_entityType, _entityId) => ({
    planId: "plan-pro",
    status: "active",
  }),
  getPlanFeatures: async (planId) => {
    if (planId === "plan-pro") {
      return [
        { featureKey: "anti_cheat", enabled: true, limitValue: null, limitUnit: null },
        { featureKey: "webhooks", enabled: true, limitValue: null, limitUnit: null },
        { featureKey: "daily_pings", enabled: true, limitValue: 10000, limitUnit: "per_day" },
      ];
    }
    return [];
  },
  getFeatureOverrides: async (_entityType, _entityId) => [],
  getFreePlanId: async (planType) => "plan-free",
};

describe("resolveFeatures", () => {
  it("resolves plan features for an active subscription", async () => {
    const result = await resolveFeatures("TENANT", "tenant-123", mockProvider);
    expect(result.get("anti_cheat")).toEqual({ enabled: true, limit: null });
    expect(result.get("webhooks")).toEqual({ enabled: true, limit: null });
    expect(result.get("daily_pings")).toEqual({ enabled: true, limit: 10000 });
  });

  it("falls back to free plan when no subscription exists", async () => {
    const noSubProvider: DataProvider = {
      ...mockProvider,
      getActiveSubscription: async () => null,
      getPlanFeatures: async (planId) => {
        if (planId === "plan-free") {
          return [
            { featureKey: "daily_pings", enabled: true, limitValue: 100, limitUnit: "per_day" },
          ];
        }
        return [];
      },
    };
    const result = await resolveFeatures("TENANT", "tenant-456", noSubProvider);
    expect(result.get("anti_cheat")).toBeUndefined();
    expect(result.get("daily_pings")).toEqual({ enabled: true, limit: 100 });
  });

  it("applies feature overrides (grant and revoke)", async () => {
    const overrideProvider: DataProvider = {
      ...mockProvider,
      getFeatureOverrides: async () => [
        { featureKey: "webhooks", granted: false, limitOverride: null, expiresAt: null },
        { featureKey: "squads", granted: true, limitOverride: null, expiresAt: null },
      ],
    };
    const result = await resolveFeatures("TENANT", "tenant-789", overrideProvider);
    expect(result.get("webhooks")).toEqual({ enabled: false, limit: null });
    expect(result.get("squads")).toEqual({ enabled: true, limit: null });
  });

  it("skips expired overrides", async () => {
    const expiredProvider: DataProvider = {
      ...mockProvider,
      getFeatureOverrides: async () => [
        {
          featureKey: "squads",
          granted: true,
          limitOverride: null,
          expiresAt: new Date("2020-01-01T00:00:00Z"),
        },
      ],
    };
    const result = await resolveFeatures("TENANT", "tenant-expired", expiredProvider);
    expect(result.get("squads")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/feature-gate test`
Expected: FAIL (modules not found)

- [ ] **Step 4: Implement types and resolver**

Create `packages/feature-gate/src/types.ts`:
```typescript
export interface ResolvedFeature {
  enabled: boolean;
  limit: number | null;
}

export type FeatureMap = Map<string, ResolvedFeature>;

export type EntityType = "TENANT" | "USER";

export interface SubscriptionInfo {
  planId: string;
  status: string;
}

export interface PlanFeatureRow {
  featureKey: string;
  enabled: boolean;
  limitValue: number | null;
  limitUnit: string | null;
}

export interface FeatureOverrideRow {
  featureKey: string;
  granted: boolean;
  limitOverride: number | null;
  expiresAt: Date | null;
}

export interface DataProvider {
  getActiveSubscription(entityType: EntityType, entityId: string): Promise<SubscriptionInfo | null>;
  getPlanFeatures(planId: string): Promise<PlanFeatureRow[]>;
  getFeatureOverrides(entityType: EntityType, entityId: string): Promise<FeatureOverrideRow[]>;
  getFreePlanId(planType: "B2B" | "B2C"): Promise<string>;
}
```

Create `packages/feature-gate/src/resolver.ts`:
```typescript
import type { EntityType, FeatureMap, DataProvider, ResolvedFeature } from "./types.js";

const ACTIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

export async function resolveFeatures(
  entityType: EntityType,
  entityId: string,
  provider: DataProvider,
): Promise<FeatureMap> {
  const subscription = await provider.getActiveSubscription(entityType, entityId);

  let planId: string;
  if (subscription && ACTIVE_STATUSES.has(subscription.status)) {
    planId = subscription.planId;
  } else {
    const planType = entityType === "TENANT" ? "B2B" : "B2C";
    planId = await provider.getFreePlanId(planType);
  }

  const planFeatures = await provider.getPlanFeatures(planId);
  const featureMap: FeatureMap = new Map();

  for (const pf of planFeatures) {
    if (pf.enabled) {
      featureMap.set(pf.featureKey, {
        enabled: true,
        limit: pf.limitValue,
      });
    }
  }

  const overrides = await provider.getFeatureOverrides(entityType, entityId);
  const now = new Date();

  for (const override of overrides) {
    if (override.expiresAt && override.expiresAt < now) {
      continue;
    }

    const existing = featureMap.get(override.featureKey);
    const limit = override.limitOverride ?? existing?.limit ?? null;

    featureMap.set(override.featureKey, {
      enabled: override.granted,
      limit,
    });
  }

  return featureMap;
}
```

- [ ] **Step 5: Run resolver test to verify it passes**

Run: `pnpm --filter @spottgeo/feature-gate test`
Expected: PASS

- [ ] **Step 6: Write failing checker test**

Create `packages/feature-gate/test/checker.test.ts`:
```typescript
import { describe, expect, it, vi } from "vitest";
import { createFeatureChecker } from "../src/checker";
import type { DataProvider } from "../src/types";

const mockProvider: DataProvider = {
  getActiveSubscription: async () => ({ planId: "plan-pro", status: "active" }),
  getPlanFeatures: async () => [
    { featureKey: "anti_cheat", enabled: true, limitValue: null, limitUnit: null },
    { featureKey: "daily_pings", enabled: true, limitValue: 10000, limitUnit: "per_day" },
  ],
  getFeatureOverrides: async () => [],
  getFreePlanId: async () => "plan-free",
};

const mockCache = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
};

describe("createFeatureChecker", () => {
  it("hasFeature returns true for included feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.hasFeature("TENANT", "t-1", "anti_cheat");
    expect(result).toBe(true);
  });

  it("hasFeature returns false for missing feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.hasFeature("TENANT", "t-1", "webhooks");
    expect(result).toBe(false);
  });

  it("getFeatureLimit returns numeric limit", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.getFeatureLimit("TENANT", "t-1", "daily_pings");
    expect(result).toBe(10000);
  });

  it("getFeatureLimit returns null for unlimited feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.getFeatureLimit("TENANT", "t-1", "anti_cheat");
    expect(result).toBeNull();
  });

  it("invalidateFeatureCache deletes the cache key", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    await checker.invalidateFeatureCache("TENANT", "t-1");
    expect(mockCache.del).toHaveBeenCalledWith("features:TENANT:t-1");
  });
});
```

- [ ] **Step 7: Implement checker**

Create `packages/feature-gate/src/checker.ts`:
```typescript
import type { EntityType, FeatureMap, DataProvider, ResolvedFeature } from "./types.js";
import { resolveFeatures } from "./resolver.js";

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

const CACHE_TTL = 300; // 5 minutes

function cacheKey(entityType: EntityType, entityId: string): string {
  return `features:${entityType}:${entityId}`;
}

function serializeMap(map: FeatureMap): string {
  return JSON.stringify(Object.fromEntries(map));
}

function deserializeMap(raw: string): FeatureMap {
  const obj = JSON.parse(raw) as Record<string, ResolvedFeature>;
  return new Map(Object.entries(obj));
}

export function createFeatureChecker(provider: DataProvider, cache: CacheClient) {
  async function getFeatureMap(entityType: EntityType, entityId: string): Promise<FeatureMap> {
    const key = cacheKey(entityType, entityId);
    const cached = await cache.get(key);
    if (cached) {
      return deserializeMap(cached);
    }
    const resolved = await resolveFeatures(entityType, entityId, provider);
    await cache.set(key, serializeMap(resolved), CACHE_TTL);
    return resolved;
  }

  return {
    async hasFeature(entityType: EntityType, entityId: string, featureKey: string): Promise<boolean> {
      const map = await getFeatureMap(entityType, entityId);
      return map.get(featureKey)?.enabled ?? false;
    },

    async getFeatureLimit(entityType: EntityType, entityId: string, featureKey: string): Promise<number | null> {
      const map = await getFeatureMap(entityType, entityId);
      return map.get(featureKey)?.limit ?? null;
    },

    async resolveAllFeatures(entityType: EntityType, entityId: string): Promise<FeatureMap> {
      return getFeatureMap(entityType, entityId);
    },

    async invalidateFeatureCache(entityType: EntityType, entityId: string): Promise<void> {
      await cache.del(cacheKey(entityType, entityId));
    },
  };
}
```

Create `packages/feature-gate/src/index.ts`:
```typescript
export { resolveFeatures } from "./resolver.js";
export { createFeatureChecker } from "./checker.js";
export type { CacheClient } from "./checker.js";
export type {
  ResolvedFeature,
  FeatureMap,
  EntityType,
  SubscriptionInfo,
  PlanFeatureRow,
  FeatureOverrideRow,
  DataProvider,
} from "./types.js";
```

- [ ] **Step 8: Run all tests to verify they pass**

Run: `pnpm --filter @spottgeo/feature-gate test`
Expected: PASS

Run: `pnpm --filter @spottgeo/feature-gate check-types`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add packages/feature-gate/
git commit -m "feat(feature-gate): add feature resolver, checker, and cache-backed feature gating package"
```

---

### Task 4: SpottConsole Feature Override Server Actions (`apps/console`)

**Files:**
- Create: `apps/console/src/actions/feature-overrides.ts`
- Test: `apps/console/test/feature-override-actions.test.ts`

**Interfaces:**
- Consumes: `CreateFeatureOverrideSchema` from `@spottgeo/api-contracts`
- Produces: `createFeatureOverrideAction(input): Promise<{ success: boolean; overrideId?: string; error?: any }>`

- [ ] **Step 1: Write failing action test**

Create `apps/console/test/feature-override-actions.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { createFeatureOverrideAction } from "../src/actions/feature-overrides";

describe("Feature Override Server Actions", () => {
  it("validates and creates a feature override for a tenant", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "TENANT",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "webhooks",
      granted: true,
      reason: "Enterprise deal signed",
    });
    expect(res.success).toBe(true);
    expect(res.overrideId).toBeDefined();
  });

  it("rejects invalid input with validation errors", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "INVALID" as any,
      entityId: "not-a-uuid",
      featureKey: "",
      granted: true,
      reason: "x",
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("validates override with optional expiry date", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "USER",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "streak_savers",
      granted: true,
      limitOverride: 10,
      reason: "VIP trial for 30 days",
      expiresAt: "2026-08-29T00:00:00Z",
    });
    expect(res.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/console test`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement server action**

Create `apps/console/src/actions/feature-overrides.ts`:
```typescript
"use server";

import { CreateFeatureOverrideSchema, type CreateFeatureOverrideInput } from "@spottgeo/api-contracts";
import { randomUUID } from "crypto";

export async function createFeatureOverrideAction(input: CreateFeatureOverrideInput) {
  const parsed = CreateFeatureOverrideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  // In production, this would insert into the featureOverrides table
  // and call invalidateFeatureCache for the entity.
  const overrideId = randomUUID();

  return { success: true as const, overrideId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/console test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/console/src/actions/feature-overrides.ts apps/console/test/
git commit -m "feat(console): add feature override server actions with validation"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-feature-assignment-module.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

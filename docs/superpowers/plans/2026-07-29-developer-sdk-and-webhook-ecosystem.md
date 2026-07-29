# Developer SDK & Webhook Ecosystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Developer SDK & Webhook Ecosystem including `@spottgeo/sdk` client package, Drizzle database schemas for webhook subscriptions and delivery logs, HMAC SHA-256 signature worker retries, and SpottConsole Developer Portal screens.

**Architecture:** 
- `packages/sdk`: Client-side TypeScript SDK package (`SpottGeoClient`) for 3rd-party presence verification.
- `packages/database`: Drizzle schemas for `webhook_subscriptions` and `webhook_deliveries`.
- `packages/api-contracts`: Zod schemas (`CreateWebhookSubscriptionSchema`, `GenerateApiKeySchema`, `WebhookDeliveryQuerySchema`).
- `services/webhook-dispatcher`: Node.js worker loop executing HMAC SHA-256 signed POSTs with 5 exponential backoff retries.
- `apps/console`: Next.js 16 App Router developer settings pages (`/dashboard/developer/webhooks`) and Server Actions.

**Tech Stack:** TypeScript 5.9, Next.js 16, Fastify 5, Drizzle ORM 0.45, Zod 4, Vitest 4.

## Global Constraints
- Webhook targets MUST be valid HTTPS URLs (`https://`).
- Outbound webhook requests MUST carry `X-Spott-Signature` HMAC SHA-256 headers.
- API key plaintext is displayed strictly once upon generation; stored as `api_key_hash` SHA-256.

---

### Task 1: Database Schemas for Webhook Subscriptions & Deliveries (`packages/database`)

**Files:**
- Create: `packages/database/src/schema/webhook-subscriptions.ts`
- Create: `packages/database/src/schema/webhook-deliveries.ts`
- Modify: `packages/database/src/schema/index.ts`
- Test: `packages/database/test/webhook-schema.test.ts`

**Interfaces:**
- Consumes: `tenants.id`
- Produces: `webhookSubscriptions`, `webhookDeliveries` Drizzle schemas

- [ ] **Step 1: Write failing schema test**

Create `packages/database/test/webhook-schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { webhookSubscriptions, webhookDeliveries } from "../src/schema";

describe("Webhook Database Schemas", () => {
  it("exports webhookSubscriptions schema with targetUrl and secretKey", () => {
    expect(webhookSubscriptions).toBeDefined();
    expect(webhookSubscriptions.targetUrl).toBeDefined();
    expect(webhookSubscriptions.secretKey).toBeDefined();
  });

  it("exports webhookDeliveries schema with attemptCount and status", () => {
    expect(webhookDeliveries).toBeDefined();
    expect(webhookDeliveries.attemptCount).toBeDefined();
    expect(webhookDeliveries.status).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (Schema exports not found)

- [ ] **Step 3: Implement Drizzle schemas**

Create `packages/database/src/schema/webhook-subscriptions.ts`:
```typescript
import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  targetUrl: varchar("target_url", { length: 2048 }).notNull(),
  secretKey: varchar("secret_key", { length: 128 }).notNull(),
  subscribedEvents: jsonb("subscribed_events").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("HEALTHY"),
  ipWhitelist: jsonb("ip_whitelist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Create `packages/database/src/schema/webhook-deliveries.ts`:
```typescript
import { pgTable, uuid, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { webhookSubscriptions } from "./webhook-subscriptions";

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => webhookSubscriptions.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  responseStatusCode: integer("response_status_code"),
  attemptCount: integer("attempt_count").notNull().default(1),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
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
git commit -m "feat(database): add webhook_subscriptions and webhook_deliveries schemas"
```

---

### Task 2: Shared Zod API Contracts for Webhooks (`packages/api-contracts`)

**Files:**
- Create: `packages/api-contracts/src/webhook.schema.ts`
- Modify: `packages/api-contracts/src/index.ts`
- Test: `packages/api-contracts/test/webhook-contracts.test.ts`

**Interfaces:**
- Consumes: Zod v4 (`z`)
- Produces: `CreateWebhookSubscriptionSchema`, `GenerateApiKeySchema`, `WebhookDeliveryQuerySchema`

- [ ] **Step 1: Write failing Zod schema test**

Create `packages/api-contracts/test/webhook-contracts.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { CreateWebhookSubscriptionSchema, GenerateApiKeySchema } from "../src";

describe("Webhook Zod Contracts", () => {
  it("validates CreateWebhookSubscriptionSchema HTTPS enforcement", () => {
    const valid = CreateWebhookSubscriptionSchema.safeParse({
      targetUrl: "https://api.merchant.com/spott-webhooks",
      subscribedEvents: ["verification.created", "reward.completed"],
    });
    expect(valid.success).toBe(true);

    const invalidHttp = CreateWebhookSubscriptionSchema.safeParse({
      targetUrl: "http://insecure.merchant.com/webhooks",
      subscribedEvents: ["verification.created"],
    });
    expect(invalidHttp.success).toBe(false);
  });

  it("validates GenerateApiKeySchema", () => {
    const valid = GenerateApiKeySchema.safeParse({
      keyLabel: "Mobile App Production Key",
      environment: "LIVE",
    });
    expect(valid.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: FAIL (Schema not found)

- [ ] **Step 3: Implement Zod Contracts**

Create `packages/api-contracts/src/webhook.schema.ts`:
```typescript
import { z } from "zod";

export const CreateWebhookSubscriptionSchema = z.object({
  targetUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), "Webhooks must use HTTPS protocol"),
  subscribedEvents: z
    .array(z.enum(["verification.created", "reward.queued", "reward.completed", "reward.failed", "fraud.flagged"]))
    .min(1, "At least one event must be selected"),
  ipWhitelist: z.array(z.string()).optional(),
});

export type CreateWebhookSubscriptionInput = z.infer<typeof CreateWebhookSubscriptionSchema>;

export const GenerateApiKeySchema = z.object({
  keyLabel: z.string().min(2, "Key label must be at least 2 characters").max(100),
  environment: z.enum(["LIVE", "TEST"]).default("TEST"),
});

export type GenerateApiKeyInput = z.infer<typeof GenerateApiKeySchema>;

export const WebhookDeliveryQuerySchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  status: z.enum(["SUCCESS", "PENDING", "FAILED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type WebhookDeliveryQueryInput = z.infer<typeof WebhookDeliveryQuerySchema>;
```

Re-export in `packages/api-contracts/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/api-contracts/src/ packages/api-contracts/test/
git commit -m "feat(api-contracts): add webhook subscription and api key zod schemas"
```

---

### Task 3: Client-Side Developer SDK Package (`packages/sdk`)

**Files:**
- Create: `packages/sdk/package.json`
- Create: `packages/sdk/tsconfig.json`
- Create: `packages/sdk/src/index.ts`
- Create: `packages/sdk/src/client.ts`
- Test: `packages/sdk/test/sdk-client.test.ts`

**Interfaces:**
- Consumes: `apiKey`, `environment`, `baseUrl`
- Produces: `@spottgeo/sdk` `SpottGeoClient` class

- [ ] **Step 1: Write failing SDK test**

Create `packages/sdk/test/sdk-client.test.ts`:
```typescript
import { describe, expect, it, vi } from "vitest";
import { SpottGeoClient } from "../src";

describe("SpottGeo Developer SDK Client", () => {
  it("initializes SpottGeoClient with apiKey and environment", () => {
    const client = new SpottGeoClient({
      apiKey: "spott_test_12345",
      environment: "test",
    });
    expect(client).toBeDefined();
  });

  it("sends verifyPresence request with correct headers", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: "VERIFIED", verification_id: "ver_123" }),
    });

    const client = new SpottGeoClient({
      apiKey: "spott_live_99999",
      baseUrl: "https://api.spottgeo.com",
    });

    const res = await client.verifyPresence({
      geofenceId: "geo_123",
      latitude: 6.5244,
      longitude: 3.3792,
      accuracyMeters: 10,
    });

    expect(res.status).toBe("VERIFIED");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.spottgeo.com/api/v1/engine/verify",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Spott-Api-Key": "spott_live_99999",
        }),
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/sdk test`
Expected: FAIL (Package not found or not built)

- [ ] **Step 3: Implement `@spottgeo/sdk` Package**

Create `packages/sdk/package.json`:
```json
{
  "name": "@spottgeo/sdk",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vitest": "^4.0.0"
  }
}
```

Create `packages/sdk/src/client.ts`:
```typescript
export interface SpottGeoClientConfig {
  apiKey: string;
  environment?: "live" | "test";
  baseUrl?: string;
}

export interface VerifyPresenceParams {
  geofenceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  deviceId?: string;
}

export class SpottGeoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SpottGeoClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.spottgeo.com";
  }

  public async verifyPresence(params: VerifyPresenceParams): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/engine/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Spott-Api-Key": this.apiKey,
      },
      body: JSON.stringify(params),
    });
    return res.json();
  }
}
```

Create `packages/sdk/src/index.ts`:
```typescript
export * from "./client";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/sdk test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/
git commit -m "feat(sdk): add client-side developer sdk package (@spottgeo/sdk)"
```

---

### Task 4: Upgraded Webhook Dispatcher Worker (`services/webhook-dispatcher`)

**Files:**
- Modify: `services/webhook-dispatcher/src/dispatcher.ts`
- Test: `services/webhook-dispatcher/src/dispatcher.test.ts`

**Interfaces:**
- Consumes: `payloadString`, `secret`, `attemptCount`
- Produces: `calculateNextRetryInterval(attemptCount)`, `WebhookDispatcherService.generateSignature`

- [ ] **Step 1: Write failing exponential backoff test**

Create `services/webhook-dispatcher/src/dispatcher.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { WebhookDispatcherService, calculateNextRetryInterval } from "./dispatcher";

describe("Webhook Dispatcher Worker", () => {
  it("generates correct HMAC SHA-256 signature", () => {
    const sig = WebhookDispatcherService.generateSignature('{"event":"verification.created"}', "secret123");
    expect(sig).toBeTypeOf("string");
    expect(sig.length).toBe(64);
  });

  it("calculates exponential backoff intervals correctly", () => {
    expect(calculateNextRetryInterval(1)).toBe(15); // 15s
    expect(calculateNextRetryInterval(2)).toBe(60); // 1m
    expect(calculateNextRetryInterval(3)).toBe(300); // 5m
    expect(calculateNextRetryInterval(4)).toBe(900); // 15m
    expect(calculateNextRetryInterval(5)).toBe(3600); // 1h
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/webhook-dispatcher test`
Expected: FAIL (Function not found)

- [ ] **Step 3: Implement Exponential Backoff Helper**

Update `services/webhook-dispatcher/src/dispatcher.ts` adding:
```typescript
export function calculateNextRetryInterval(attemptCount: number): number {
  switch (attemptCount) {
    case 1:
      return 15; // 15 seconds
    case 2:
      return 60; // 1 minute
    case 3:
      return 300; // 5 minutes
    case 4:
      return 900; // 15 minutes
    case 5:
    default:
      return 3600; // 1 hour
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/webhook-dispatcher test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/webhook-dispatcher/src/
git commit -m "feat(webhook-dispatcher): add exponential backoff retry calculation"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-developer-sdk-and-webhook-ecosystem.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

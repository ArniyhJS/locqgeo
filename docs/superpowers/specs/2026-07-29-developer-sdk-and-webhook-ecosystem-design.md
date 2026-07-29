# Developer SDK & Webhook Ecosystem — Design Specification

**Document Version**: 1.0.0  
**Date**: 2026-07-29  
**Status**: APPROVED  
**Target Workspace**: `packages/sdk`, `services/webhook-dispatcher`, `packages/database`, `packages/api-contracts`, `apps/console`  

---

## 1. Overview & Business Intent

This specification details the **Developer SDK & Webhook Ecosystem** for SpottGeo. The ecosystem enables B2B clients to integrate proof-of-presence verification directly into their 3rd-party web applications via a lightweight client-side TypeScript/React SDK (`packages/sdk`), while receiving real-time, HMAC-signed webhook notifications (`services/webhook-dispatcher`) for events such as `verification.created`, `reward.completed`, and `fraud.flagged`.

---

## 2. System Architecture & Component Interactions

```text
┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐
│     3rd-Party Web & Mobile App        │         │      SpottConsole Developer Portal     │
│  - Imports @spottgeo/sdk              │         │  - /dashboard/developer/api-keys      │
│  - Calls spott.verifyPresence()       │         │  - /dashboard/developer/webhooks      │
└──────────────────┬────────────────────┘         └──────────────────┬────────────────────┘
                   │                                                 │
       X-Spott-Api-Key Header                            Server Actions & Zod Contracts
                   │                                                 │
                   ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          Fastify SpottEngine API & Database                             │
│ - Validates API key hash (api_key_hash)       - Stores webhook_subscriptions            │
│ - Executes 4-step Anti-Cheat Pipeline         - Logs pending webhook_deliveries          │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                       services/webhook-dispatcher Worker Loop                           │
│ - Polls `webhook_deliveries` (status = PENDING)                                         │
│ - Computes HMAC SHA-256 Signature (X-Spott-Signature)                                   │
│ - Executes HTTP POST with 5 Exponential Backoff Retries (15s, 1m, 5m, 15m, 1h)          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model & Schema Contracts

### 3.1 Drizzle ORM Database Tables (`packages/database`)

```typescript
// 1. Webhook Subscriptions Table
export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  targetUrl: varchar("target_url", { length: 2048 }).notNull(),
  secretKey: varchar("secret_key", { length: 128 }).notNull(),
  subscribedEvents: jsonb("subscribed_events").notNull(), // ['verification.created', 'reward.completed', 'fraud.flagged']
  status: varchar("status", { length: 20 }).notNull().default("HEALTHY"), // HEALTHY, DEGRADED, DISABLED
  ipWhitelist: jsonb("ip_whitelist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 2. Webhook Delivery Audit Log & Retry Queue
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => webhookSubscriptions.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  responseStatusCode: integer("response_status_code"),
  attemptCount: integer("attempt_count").notNull().default(1),
  nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"), // SUCCESS, PENDING, FAILED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.2 Zod API Contracts (`packages/api-contracts`)

```typescript
export const CreateWebhookSubscriptionSchema = z.object({
  targetUrl: z.string().url("Must be a valid HTTPS URL").refine((url) => url.startsWith("https://"), "Webhooks must use HTTPS"),
  subscribedEvents: z.array(z.enum(["verification.created", "reward.queued", "reward.completed", "reward.failed", "fraud.flagged"])).min(1),
  ipWhitelist: z.array(z.string()).optional(),
});

export const GenerateApiKeySchema = z.object({
  keyLabel: z.string().min(2).max(100),
  environment: z.enum(["LIVE", "TEST"]).default("TEST"),
});

export const WebhookDeliveryQuerySchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  status: z.enum(["SUCCESS", "PENDING", "FAILED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
```

---

## 4. Developer Client SDK (`packages/sdk`)

```typescript
export interface SpottGeoClientConfig {
  apiKey: string;
  environment?: "live" | "test";
  baseUrl?: string;
}

export class SpottGeoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SpottGeoClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.spottgeo.com";
  }

  public async verifyPresence(params: {
    geofenceId: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number;
  }) {
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

---

## 5. Webhook Worker HMAC & Retry Logic (`services/webhook-dispatcher`)

1. **HMAC SHA-256 Signature Header**:
   $$\text{signature} = \text{HMAC-SHA256}(\text{payload\_json\_string}, \text{secret\_key})$$
   $$\text{Header}: \text{X-Spott-Signature: t=1753780000,v1=a3f89c...}$$
2. **Exponential Backoff Intervals**:
   - Attempt 1: Immediate
   - Attempt 2: +15 seconds
   - Attempt 3: +1 minute
   - Attempt 4: +5 minutes
   - Attempt 5: +15 minutes (Final attempt; if failed, mark delivery `FAILED` and subscription `DEGRADED`).

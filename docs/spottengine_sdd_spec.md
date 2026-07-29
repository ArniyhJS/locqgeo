# SpottEngine Core Engine — Spec-Driven Development (SDD) Technical Specification

Document Version: 3.1.0

Service Workspace: `services/engine`

Tech Stack: Node.js (Fastify) + TypeScript + Zod + Drizzle ORM / postgres + PostGIS (EPSG:4326)

Target AI Agents: Cursor, Antigravity, Windsurf, Aider, Claude Code

---

## 1. System Invariants & Mathematical Rules

Every route handler, database transaction, and validation middleware inside `services/engine` MUST enforce the following immutable system invariants:

1. **Spatial Standard (EPSG:4326)**: All geographic points MUST be represented using the WGS 84 spatial reference system, formatted in PostGIS as `GEOGRAPHY(Point, 4326)`. Coordinates are always stored and queried in $(\text{longitude}, \text{latitude})$ order in SQL queries.
2. **Multi-Tenancy Boundary**: Every campaign lookup, check-in write, and payout trigger MUST include a validated `tenant_id` filter parameter.
3. **Accuracy Filter Threshold**: Any incoming ping with `accuracy_meters > 50.0` MUST be immediately rejected with status `REJECTED_ACCURACY` and error code `ERR_LOW_GPS_ACCURACY`.
4. **Velocity Check Invariant**: Velocity $v$ is calculated against the target device's most recent valid check-in ping:

$$v = \frac{\Delta d}{\Delta t} = \frac{\text{distance\_delta\_meters}}{\text{time\_delta\_seconds}}$$

If $v > 55.56\text{ m/s}$ ($200\text{ km/h}$), the request MUST be rejected with status `REJECTED_VELOCITY` and error code `ERR_IMPOSSIBLE_SPEED`. 5. **Deduplication Window**: A `device_id` can successfully claim a specific `node_id` reward at most once per 86,400 seconds (24-hour rolling window). 6. **Time Delta Guard**: If $\Delta t = 0\text{ seconds}$ between consecutive pings from the same `device_id` with a distance delta $\Delta d > 10\text{m}$, the transaction MUST be rejected as an instant spoofing attempt (`ERR_ZERO_TIME_SPOOF`).

---

## 2. Shared Type Contracts & Zod Schemas

Located in `packages/api-contracts/src/grid.schema.ts` and consumed directly by Fastify route validators:

```typescript
import { z } from "zod";

export const PingRequestSchema = z
  .object({
    device_id: z
      .string()
      .min(16, "Device ID must be at least 16 characters")
      .max(128, "Device ID cannot exceed 128 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Device ID contains invalid characters"),
    latitude: z.number().min(-90.0, "Latitude must be >= -90").max(90.0, "Latitude must be <= 90"),
    longitude: z
      .number()
      .min(-180.0, "Longitude must be >= -180")
      .max(180.0, "Longitude must be <= 180"),
    accuracy_meters: z.number().min(0.0, "Accuracy cannot be negative"),
    // Exactly one of geofence_id or alias must be supplied. Alias maps to geofences.creative_code.
    geofence_id: z.string().uuid("geofence_id must be a valid UUID v4").optional(),
    alias: z
      .string()
      .min(1, "alias cannot be empty")
      .max(100, "alias cannot exceed 100 characters")
      .optional(),
    tenant_id: z.string().uuid("tenant_id must be a valid UUID v4").optional(),
    user_id: z.string().uuid("user_id must be a valid UUID v4").optional(),
    campaign_id: z.string().uuid("campaign_id must be a valid UUID v4").optional(),
    velocity_mps: z.number().optional(),
    user_agent: z.string().optional(),
  })
  .refine((data) => data.geofence_id || data.alias, {
    message: "Either geofence_id or alias must be provided",
    path: ["geofence_id"],
  });

export type PingRequest = z.infer<typeof PingRequestSchema>;

export const RewardTypeEnum = z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]);
export type RewardType = z.infer<typeof RewardTypeEnum>;

export const ClaimStatusEnum = z.enum([
  "SUCCESS",
  "REJECTED_ACCURACY",
  "REJECTED_DUPLICATE",
  "REJECTED_VELOCITY",
  "REJECTED_OUT_OF_BOUNDS",
  "REJECTED_INACTIVE_NODE",
]);
export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;

export const PingResponseSuccessSchema = z.object({
  success: z.literal(true),
  status: z.literal("VERIFIED"),
  data: z.object({
    claim_id: z.string().uuid(),
    distance_meters: z.number(),
    reward: z.object({
      type: RewardTypeEnum,
      amount_ngn: z.number(),
      payout_status: z.enum(["QUEUED", "PROCESSING", "COMPLETED"]),
    }),
  }),
});

export const PingResponseErrorSchema = z.object({
  success: z.literal(false),
  status: ClaimStatusEnum,
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type PingResponseSuccess = z.infer<typeof PingResponseSuccessSchema>;
export type PingResponseError = z.infer<typeof PingResponseErrorSchema>;
```

---

## 3. Database Schema Specification (PostgreSQL + PostGIS DDL)

```sql
-- Enable PostGIS and UUID Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: tenants (SpottConsole Multi-Tenancy Isolation)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: campaign_nodes (OOH / Physical Geofence Targets)
CREATE TABLE campaign_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    radius_meters FLOAT NOT NULL DEFAULT 50.0,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('AIRTIME', 'DATA', 'CASH', 'VOUCHER')),
    reward_amount_ngn NUMERIC(10, 2) NOT NULL,
    daily_budget_limit_ngn NUMERIC(10, 2) DEFAULT 50000.00,
    daily_budget_spent_ngn NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast Spatial and Relational Indexing
CREATE INDEX idx_campaign_nodes_location ON campaign_nodes USING GIST(location);
CREATE INDEX idx_campaign_nodes_tenant ON campaign_nodes(tenant_id);

-- Table: checkin_pings (Telemetry and Speed-of-Light History)
CREATE TABLE checkin_pings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(128) NOT NULL,
    user_location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy_meters FLOAT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkin_pings_device_time ON checkin_pings(device_id, created_at DESC);

-- Table: reward_claims (Atomic Audit Log & Idempotency)
CREATE TABLE reward_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL REFERENCES campaign_nodes(id),
    device_id VARCHAR(128) NOT NULL,
    ping_id UUID NOT NULL REFERENCES checkin_pings(id),
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'SUCCESS',
            'REJECTED_ACCURACY',
            'REJECTED_DUPLICATE',
            'REJECTED_VELOCITY',
            'REJECTED_OUT_OF_BOUNDS',
            'REJECTED_INACTIVE_NODE'
        )
    ),
    payout_reference VARCHAR(255),
    payout_status VARCHAR(50) DEFAULT 'NOT_APPLICABLE' CHECK (
        payout_status IN ('NOT_APPLICABLE', 'QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deduplication Index: Prevents multiple successful claims within 24 hours
CREATE UNIQUE INDEX idx_unique_daily_claim
ON reward_claims(device_id, node_id)
WHERE status = 'SUCCESS' AND created_at > NOW() - INTERVAL '24 hours';
```

---

## 4. Deterministic Anti-Cheat Engine Execution Flow

```
                  [ Incoming POST /api/v1/engine/verify ]
                                   |
                                   v
             +-------------------------------------------+
             | Step 1: Accuracy Filter                   |
             | (If accuracy_meters > 50.0m)             |
             +---------------------+---------------------+
                                   |
                          Pass     |     Fail
                     +-------------+-------------+
                     |                           |
                     v                           v
     +-------------------------------+   +-------------------------------+
     | Step 2: 24h Duplicate Filter  |   | Reject Request                |
     | (Query reward_claims index)   |   | Status: REJECTED_ACCURACY     |
     +---------------+---------------+   | Code: ERR_LOW_GPS_ACCURACY    |
                     |                   +-------------------------------+
            Pass     |     Fail
       +-------------+-------------+
       |                           |
       v                           v
+------------------------------+  +-------------------------------+
| Step 3: Velocity Filter      |  | Reject Request                |
| (Query last ping for device) |  | Status: REJECTED_DUPLICATE    |
| Calc speed v = dist / delta_t|  | Code: ERR_DUPLICATE_CLAIM     |
+--------------+---------------+  +-------------------------------+
               |
      Pass     |     Fail
 +-------------+-------------+
 |                           |
 v                           v
+------------------------+  +-------------------------------+
| Step 4: Spatial Distance|  | Reject Request                |
| (PostGIS ST_DWithin)   |  | Status: REJECTED_VELOCITY     |
+--------------+---------+  | Code: ERR_IMPOSSIBLE_SPEED    |
               |            +-------------------------------+
      Pass     |     Fail
 +-------------+-------------+
 |                           |
 v                           v
+------------------------+  +-------------------------------+
| Step 5: Execute Claim  |  | Reject Request                |
| - Record successful ping|  | Status: REJECTED_OUT_OF_BOUNDS|
| - Insert reward_claim  |  | Code: ERR_OUT_OF_BOUNDS       |
| - Trigger async payout |  +-------------------------------+
+------------------------+
```

---

## 5. SQL Implementation Contracts for Fastify Services

### 5.1 Step 2: Duplicate Claim Check Query

```sql
SELECT id
FROM reward_claims
WHERE device_id = $1
  AND node_id = $2
  AND status = 'SUCCESS'
  AND created_at > NOW() - INTERVAL '24 hours'
LIMIT 1;
```

### 5.2 Step 3: Last Telemetry Fetch for Velocity Check

```sql
SELECT
    created_at,
    ST_Distance(
        user_location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) AS distance_delta_meters,
    EXTRACT(EPOCH FROM (NOW() - created_at)) AS time_delta_seconds
FROM checkin_pings
WHERE device_id = $3
ORDER BY created_at DESC
LIMIT 1;
```

### 5.3 Step 4: Spatial Distance Geofence Verification

```sql
SELECT
    cn.id,
    cn.tenant_id,
    cn.radius_meters,
    cn.reward_type,
    cn.reward_amount_ngn,
    cn.is_active,
    ST_Distance(
        cn.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) AS distance_meters,
    ST_DWithin(
        cn.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        cn.radius_meters
    ) AS is_within_fence
FROM campaign_nodes cn
WHERE cn.id = $3 AND cn.is_active = TRUE;
```

---

## 6. System Prompt Directive for AI Agents

> "You are building the SpottEngine core engine inside services/engine following spottengine_sdd_spec.md. Always validate inputs using PingRequestSchema from @spottgeo/api-contracts. Ensure all SQL queries with PostGIS geometries format point inputs strictly as ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography (note: longitude comes before latitude in PostGIS points). Implement the 4-step anti-cheat checks in the exact sequence specified: Accuracy -> Duplicate -> Velocity -> Spatial Distance. Write Vitest unit tests verifying that velocity calculations exceeding $55.56\text{ m/s}$ trigger HTTP 422 with error code ERR_IMPOSSIBLE_SPEED."

---

## 7. Operational & Developer Integration Endpoints

| Endpoint | Method | Security | Description |
|----------|--------|----------|-------------|
| `/api/v1/webhooks/paystack` | `POST` | HMAC SHA-512 (`x-paystack-signature`) | Ingests Paystack subscription events (`subscription.create`, `charge.success`, `subscription.disable`) and invalidates `@spottgeo/feature-gate` cache |
| `/api/v1/webhooks/stripe` | `POST` | HMAC SHA-256 (`stripe-signature`) | Ingests Stripe subscription events (`customer.subscription.created`, `invoice.paid`, `customer.subscription.deleted`) and invalidates `@spottgeo/feature-gate` cache |
| `/api/v1/engine/telemetry/stream` | `GET` | SSE (`text/event-stream`) | Real-time broadcast stream emitting presence verification telemetry frames (`VERIFIED`, `VERIFIED_FLAGGED`, `REJECTED_SPOOF`) to SpottConsole |
| `/docs/json` | `GET` | None (Public Developer Spec) | Exposes OpenAPI 3.0.3 JSON schema definition for 3rd-party `@spottgeo/sdk` consumers |


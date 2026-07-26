# SpottConsole Enterprise B2B Dashboard — Spec-Driven Development (SDD) Technical Specification

Document Version: 1.0.0

Workspace Path: `apps/console`

Tech Stack: Next.js 16+ (App Router) + TypeScript + Tailwind CSS + Zod + Drizzle ORM / postgres + PostGIS + Recharts

Target AI Agents: Cursor, Antigravity, Windsurf, Aider, Claude Code

---

## 1. System Invariants & Security Guardrails

Every Next.js Page, Server Action, API Route, and Database Access Function inside `apps/console` MUST enforce the following immutable enterprise invariants:

1. **Strict Multi-Tenancy Boundary**: Every database query executed within SpottConsole MUST include `tenant_id = session.tenant_id`. Cross-tenant data leakage is a critical security violation.
2. **API Key Cryptographic Hashing**: API keys generated for enterprise B2B SDK integrations MUST be stored using SHA-256 digests (`api_key_hash`). Plaintext keys are shown strictly once upon generation.
3. **Daily Budget Depletion Guard**: If a campaign node's cumulative daily claims reach or exceed its assigned budget cap, the system MUST automatically flip `is_active` to `FALSE` for that node:

$$\text{daily\_budget\_spent\_ngn} \ge \text{daily\_budget\_limit\_ngn} \implies \text{is\_active} = \text{FALSE}$$

4. **Calculated Conversion Rate Invariant**: Conversion rates on analytics dashboards MUST be computed strictly as:

$$\text{conversion\_rate\_pct} = \left( \frac{\text{verified\_claims}}{\text{total\_pings}} \right) \times 100$$

If $\text{total\_pings} = 0$, $\text{conversion\_rate\_pct}$ MUST return $0.00\%$ to prevent divide-by-zero exceptions.

5. **NDPR Compliance Anonymization**: Exported raw telemetry logs MUST mask full IP addresses (e.g., `102.89.x.x`) and truncate `device_id` hardware hashes to 8 characters for display.

---

## 2. Shared Type Contracts & Zod Schemas

Located in `packages/api-contracts/src/os.schema.ts` and consumed directly by Next.js Server Actions and API routes:

```typescript
import { z } from "zod";

// 1. Campaign Node Builder Schemas
export const CreateCampaignNodeSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  latitude: z.number().min(-90.0, "Latitude must be >= -90").max(90.0, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180.0, "Longitude must be >= -180")
    .max(180.0, "Longitude must be <= 180"),
  radius_meters: z
    .number()
    .min(10.0, "Minimum geofence radius is 10m")
    .max(500.0, "Maximum geofence radius is 500m")
    .default(50.0),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z
    .number()
    .min(10.0, "Minimum reward amount is NGN 10")
    .max(50000.0, "Maximum reward amount is NGN 50,000"),
  daily_budget_limit_ngn: z
    .number()
    .min(1000.0, "Minimum daily budget limit is NGN 1,000")
    .default(50000.0),
});

export type CreateCampaignNodeInput = z.infer<typeof CreateCampaignNodeSchema>;

export const BulkCampaignNodeCsvRowSchema = z.object({
  title: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().min(10).max(500).default(50),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z.coerce.number().min(10).max(50000),
  daily_budget_limit_ngn: z.coerce.number().min(1000).default(50000),
});

// 2. Enterprise Telemetry & Analytics Schemas
export const TelemetryQuerySchema = z.object({
  tenant_id: z.string().uuid("tenant_id must be a valid UUID v4"),
  node_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type TelemetryQuery = z.infer<typeof TelemetryQuerySchema>;

export const TelemetrySummaryResponseSchema = z.object({
  tenant_id: z.string().uuid(),
  summary: z.object({
    total_pings: z.number().int().min(0),
    verified_claims: z.number().int().min(0),
    fraud_blocked: z.number().int().min(0),
    conversion_rate_pct: z.number().min(0).max(100),
    total_spend_ngn: z.number().min(0),
  }),
  fraud_breakdown: z.object({
    rejected_accuracy: z.number().int().min(0),
    rejected_velocity: z.number().int().min(0),
    rejected_out_of_bounds: z.number().int().min(0),
    rejected_duplicate: z.number().int().min(0),
  }),
  time_series: z.array(
    z.object({
      timestamp_hour: z.string(),
      pings: z.number().int(),
      verified_claims: z.number().int(),
      blocked_fraud: z.number().int(),
    }),
  ),
});

export type TelemetrySummaryResponse = z.infer<typeof TelemetrySummaryResponseSchema>;

// 3. Enterprise API Key Management Schemas
export const CreateApiKeySchema = z.object({
  key_label: z.string().min(2).max(100),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
```

---

## 3. Database Extension DDL (PostgreSQL + PostGIS)

```sql
-- Table: tenant_users (Enterprise Dashboard Users & RBAC)
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'MARKETER', 'VIEWER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);

-- Table: api_keys (B2B SDK Cryptographic Access)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_label VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_lookup ON api_keys(api_key_hash) WHERE is_revoked = FALSE;

-- Table: budget_resets_log (Daily Budget Tracking & Audit Trail)
CREATE TABLE budget_resets_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id UUID NOT NULL REFERENCES campaign_nodes(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    previous_spent_ngn NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_node_daily_reset UNIQUE(node_id, reset_date)
);
```

---

## 4. System Prompt Directive for AI Agents

> "You are building the SpottConsole Enterprise B2B Dashboard inside apps/console following spottconsole_sdd_spec.md. Always enforce multi-tenancy isolation by including tenant_id filters on every SQL query and Server Action. Validate user inputs using CreateCampaignNodeSchema and CreateApiKeySchema from @spottgeo/api-contracts. Ensure all PostGIS geography points format location inputs strictly as ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography (note: longitude comes before latitude). Build interactive forms using React Hook Form paired with Zod schemas. Display telemetry charts using Recharts, with conversion percentages dynamically calculated via $(\text{verified\_claims} / \text{total\_pings}) \times 100$."

# Feature Assignment Module — Design Specification

## Overview

A hybrid plan-based feature gating system with per-entity overrides. Tenants (B2B) and Users (B2C) independently subscribe to plans that control which SpottGeo features are accessible. A shared `packages/feature-gate` package provides sub-millisecond Redis-cached feature checks consumed across the entire monorepo.

## Subscription Subjects

Two independent subscription layers:

- **B2B (Tenants)**: Businesses subscribe to plans controlling console features, engine capabilities, and API limits. End-users of a tenant inherit the tenant's feature set.
- **B2C (Users)**: Consumers independently subscribe to personal plans controlling gamification features in the Drop PWA.

## Payment Providers

- **Paystack** for NGN (Nigerian tenants and users)
- **Stripe** for USD (international tenants and users)

Both providers send webhook events to drive subscription state transitions.

## Plan Tiers

### B2B Plans (Tenants)

| Tier | Slug | Price (NGN/mo) | Price (USD/mo) |
|------|------|----------------|----------------|
| 0 | `b2b_free` | ₦0 | $0 |
| 1 | `b2b_starter` | ₦25,000 | $15 |
| 2 | `b2b_pro` | ₦75,000 | $45 |
| 3 | `b2b_enterprise` | Custom | Custom |

### B2C Plans (Users)

| Tier | Slug | Price (NGN/mo) | Price (USD/mo) |
|------|------|----------------|----------------|
| 0 | `b2c_free` | ₦0 | $0 |
| 1 | `b2c_premium` | ₦1,500 | $3 |
| 2 | `b2c_vip` | ₦3,500 | $7 |

---

## Data Model

### `plans` — Central plan registry

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | varchar(100) | Display name (e.g., "Pro") |
| `slug` | varchar(50) UNIQUE | Machine key (e.g., "b2b_pro") |
| `type` | varchar(10) | `B2B` or `B2C` |
| `tier` | integer | Numeric ordering (0 = free, higher = more features) |
| `price_monthly_ngn` | numeric(10,2) | Naira monthly price |
| `price_monthly_usd` | numeric(10,2) | USD monthly price |
| `price_yearly_ngn` | numeric(10,2) | Naira yearly price (discounted) |
| `price_yearly_usd` | numeric(10,2) | USD yearly price (discounted) |
| `is_active` | boolean | Soft-disable a plan from new signups |
| `created_at` | timestamptz | |

### `feature_definitions` — Master feature registry

| Column | Type | Notes |
|--------|------|-------|
| `key` | varchar(50) PK | Machine key (e.g., "anti_cheat") |
| `display_name` | varchar(100) | Human-readable name |
| `module` | varchar(50) | Grouping (engine, developer, gamification) |
| `description` | text | |

Initial feature keys:

- `anti_cheat` — Anti-Cheat AI spoof detection
- `webhooks` — Webhook Portal & delivery
- `sdk_access` — SDK API access
- `squads` — Squad Quests
- `mystery_drops` — Mystery Drops
- `streaks` — Daily Streaks
- `leaderboards` — Leaderboards
- `daily_pings` — Daily ping volume (limit-type feature)
- `api_rate_limit` — API requests per minute (limit-type feature)
- `geofence_count` — Max geofences per tenant (limit-type feature)
- `streak_savers` — Monthly streak savers (limit-type feature)

### `plan_features` — Feature matrix per plan

| Column | Type | Notes |
|--------|------|-------|
| `plan_id` | uuid FK → plans.id | |
| `feature_key` | varchar(50) FK → feature_definitions.key | |
| `enabled` | boolean | Whether this feature is included |
| `limit_value` | integer (nullable) | Numeric limit (null = unlimited when enabled) |
| `limit_unit` | varchar(30) (nullable) | Unit label (e.g., "per_day", "per_month", "total") |
| PK | (plan_id, feature_key) | Composite primary key |

### `tenant_subscriptions` — B2B subscription state

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `tenant_id` | uuid FK → tenants.id UNIQUE | One active subscription per tenant |
| `plan_id` | uuid FK → plans.id | |
| `status` | varchar(20) | `trialing`, `active`, `past_due`, `canceled`, `expired` |
| `payment_provider` | varchar(20) | `paystack` or `stripe` |
| `provider_subscription_id` | varchar(255) | External subscription ID |
| `current_period_start` | timestamptz | |
| `current_period_end` | timestamptz | |
| `canceled_at` | timestamptz (nullable) | |
| `created_at` | timestamptz | |

### `user_subscriptions` — B2C subscription state

Same structure as `tenant_subscriptions` but with `user_id` FK → users.id instead of `tenant_id`.

### `feature_overrides` — Per-entity manual grants/revokes

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `entity_type` | varchar(10) | `TENANT` or `USER` |
| `entity_id` | uuid | Tenant or user ID |
| `feature_key` | varchar(50) FK → feature_definitions.key | |
| `granted` | boolean | true = force-enable, false = force-disable |
| `limit_override` | integer (nullable) | Override numeric limit |
| `reason` | text | Audit trail (e.g., "Enterprise deal", "Support ticket #1234") |
| `granted_by` | uuid (nullable) | Admin who created the override |
| `expires_at` | timestamptz (nullable) | Auto-expire the override |
| `created_at` | timestamptz | |

---

## Runtime Feature Resolution

### Algorithm

```
resolveFeatures(entityType, entityId):
  1. Look up active subscription → get planId
  2. If no active subscription OR status ∈ {canceled, expired} → fall back to Free plan
  3. If status = past_due → grant features but flag as degraded (14-day grace)
  4. Load plan_features for planId → base feature set
  5. Load feature_overrides for entity → merge overrides
     - Override granted=true  → add feature (even if plan doesn't include it)
     - Override granted=false → revoke feature (even if plan includes it)
     - Override with limit_override → replace plan limit
     - Expired overrides (expires_at < now) → skip
  6. Return resolved feature map: { [featureKey]: { enabled, limit } }
```

### Caching (Redis)

- **Key**: `features:{TENANT|USER}:{entityId}`
- **Value**: JSON hash of resolved features
- **TTL**: 300 seconds (5 minutes)
- **Invalidation**: Cache key deleted immediately on subscription change, override change, or plan matrix update. Next check triggers fresh resolution.

### Feature Check API (`packages/feature-gate`)

```typescript
// Boolean check
hasFeature(entityType: "TENANT" | "USER", entityId: string, featureKey: string): Promise<boolean>

// Limit check
getFeatureLimit(entityType: "TENANT" | "USER", entityId: string, featureKey: string): Promise<number | null>

// Bulk resolve (for dashboard rendering)
resolveAllFeatures(entityType: "TENANT" | "USER", entityId: string): Promise<FeatureMap>
```

### Integration Points

| Layer | Check Type | Example |
|-------|-----------|---------|
| `services/engine` middleware | Pre-verification gate | `hasFeature("TENANT", tenantId, "anti_cheat")` before spoof calculator |
| `apps/console` server components | UI gating | Hide webhook tab if `!hasFeature("TENANT", tenantId, "webhooks")` |
| `apps/drop` server components | Consumer feature gating | Show streak saver only if `hasFeature("USER", userId, "streaks")` |
| `services/engine` budget-gate | Limit enforcement | `getFeatureLimit("TENANT", tenantId, "daily_pings")` |

---

## Payment Webhook & Subscription Lifecycle

### State Machine

```
trialing ──(trial_end/payment_success)──► active
active   ──(payment_failed)──────────────► past_due
past_due ──(payment_success)─────────────► active
past_due ──(retries_exhausted/cancel)────► canceled
active   ──(user_cancels)────────────────► canceled
```

### Webhook Events

| Paystack Event | Stripe Event | Action |
|---------------|-------------|--------|
| `subscription.create` | `customer.subscription.created` | Insert subscription row, status = `trialing` or `active` |
| `charge.success` | `invoice.paid` | Set status = `active`, update `current_period_end` |
| `invoice.payment_failed` | `invoice.payment_failed` | Set status = `past_due` |
| `subscription.disable` | `customer.subscription.deleted` | Set status = `canceled`, set `canceled_at` |

### Webhook Security

- **Paystack**: Verify `X-Paystack-Signature` HMAC SHA-512 against secret
- **Stripe**: Verify `Stripe-Signature` via `stripe.webhooks.constructEvent()`
- Unverified payloads rejected with HTTP 400

### Cache Invalidation Flow

```
Webhook received → Verify signature → Update subscription row →
  DELETE Redis key features:{TENANT|USER}:{entityId} →
    Next feature check triggers fresh resolution & re-cache
```

### Grace Period

`past_due` subscriptions retain full feature access for 14 days. After 14 days without successful payment, status transitions to `canceled` and features revert to the Free plan.

---

## Package Structure

### New Package: `packages/feature-gate`

```
packages/feature-gate/
  src/
    resolver.ts      — resolveFeatures() core algorithm
    checker.ts       — hasFeature(), getFeatureLimit(), resolveAllFeatures()
    cache.ts         — Redis get/set/invalidate helpers
    types.ts         — FeatureMap, ResolvedFeature interfaces
    index.ts         — public exports
  test/
    resolver.test.ts
    checker.test.ts
  package.json       — @spottgeo/feature-gate
  tsconfig.json
```

### Modified Packages

- `packages/database`: New schema files for `plans`, `plan_features`, `feature_definitions`, `tenant_subscriptions`, `user_subscriptions`, `feature_overrides`
- `packages/api-contracts`: Zod schemas for plan CRUD, subscription management, feature override operations
- `services/engine`: Webhook routes (`/webhooks/paystack`, `/webhooks/stripe`) and feature-gate middleware integration
- `apps/console`: Plan management admin pages, subscription status display, feature override UI

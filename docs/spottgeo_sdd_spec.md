# SpottGeo Spec-Driven Development (SDD) Specification

Document Version: 3.1.0
Status: APPROVED

> **SpottEngine Core Engine Spec**: See [spottengine_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottengine_sdd_spec.md) for full v3.1.0 mathematical invariants, DDL schema, and 4-step anti-cheat execution details.

## 1. System Overview & Architecture

SpottGeo is a location-based rewards and telemetry platform architected as a **Unified TypeScript Monorepo** managed with **pnpm workspaces** and **Turborepo**.

### Core Components
- **`services/engine`**: Node.js + Fastify core engine processing `POST /api/v1/engine/verify` under 50ms latency.
- **`services/payout-worker`**: Standalone background worker executing queued reward payouts with multi-provider fallbacks.
- **`services/webhook-dispatcher`**: Microservice handling HMAC-signed outbound webhooks to enterprise endpoints.
- **`services/analytics-worker`**: Background service pre-aggregating telemetry stats and leaderboard rankings.
- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM with pre-funded tenant float support.
- **`packages/api-contracts`**: Shared Zod schemas ensuring zero type drift between backend routes and frontend components.
- **`apps/console`**: SpottConsole Next.js Enterprise B2B Dashboard.
- **`apps/drop`**: SpottDrop Next.js Consumer PWA for radar tracking & instant claim payouts.
- **`apps/verify`**: SpottVerify Next.js Consumer PWA for standalone attendance and check-ins.

---

## 2. Anti-Cheat Pipeline (4-Step Filter)

1. **Accuracy Filter**: Rejects pings with `accuracy_meters > 50.0m`.
2. **Velocity Filter**: Rejects pings with velocity exceeding `30 m/s` (~108 km/h).
3. **Teleportation Anomaly Filter**: Compares consecutive timestamps and calculated speed between delta coordinates.
4. **Spoof Risk Score**: Aggregates anomalies into a score (0 to 100). Rejects if score $\ge 50$.

---

## 3. Spatial Queries & PostGIS Mechanics

The core spatial query relies on PostGIS geography point indexing (`GiST`):

```sql
SELECT id, name, radius_meters, reward_amount
FROM geofences
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  $3
);
```

---

## 4. Payout Delivery & Fallback Mechanics

Supports multi-tier fallback payout orchestration:
- **VTPass Telco Airtime / Data**: Primary provider for digital top-ups.
- **Paystack Direct Transfers**: Primary provider for cash reward payouts.
- **Flutterwave**: Secondary provider fallback if primary fails.
- **User Wallet Credit (`user_wallets`)**: Fallback credit to internal user balance if external payout channels fail.

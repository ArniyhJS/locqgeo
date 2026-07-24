# SpottGeo Spec-Driven Development (SDD) Specification

Document Version: 3.1.0
Status: APPROVED

> **SpottGrid Core Engine Spec**: See [spottgrid_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottgrid_sdd_spec.md) for full v3.1.0 mathematical invariants, DDL schema, and 4-step anti-cheat execution details.

## 1. System Overview & Architecture

SpottGeo is a location-based rewards and telemetry platform architected as a **Unified TypeScript Monorepo** managed with **pnpm workspaces** and **Turborepo**.

### Core Components
- **`services/grid-engine`**: Node.js + Fastify core engine processing `POST /api/v1/grid/ping` under 50ms latency.
- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM.
- **`packages/api-contracts`**: Shared Zod schemas ensuring zero type drift between backend routes and frontend components.
- **`apps/os`**: SpottOS Next.js Enterprise B2B Dashboard.
- **`apps/drop`**: SpottDrop Next.js Consumer PWA for radar tracking & instant claim payouts.

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

## 4. Payout Delivery Mechanics

Supports dual payout providers:
- **VTPass Telco Airtime / Data**: Dispatched asynchronously via HTTP API webhooks.
- **Paystack Direct Transfers**: Instant bank account deposits for cash rewards.

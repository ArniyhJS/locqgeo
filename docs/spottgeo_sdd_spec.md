# SpottGeo Spec-Driven Development (SDD) Specification

Document Version: 3.3.0
Status: APPROVED

> **SpottEngine Core Engine Spec**: See [spottengine_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottengine_sdd_spec.md) for full v3.3.0 mathematical invariants, DDL schema, and 6-step anti-cheat execution details.

## 1. System Overview & Architecture

SpottGeo is a location-based rewards and telemetry platform architected as a **Unified TypeScript Monorepo** managed with **pnpm workspaces** and **Turborepo**.

### Core Components

- **`services/engine`**: Node.js + Fastify core engine processing `POST /api/v1/engine/verify` under 50ms latency (see [spottengine_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottengine_sdd_spec.md)).
- **`services/payout-worker`**: Standalone background worker executing queued reward payouts with multi-provider fallbacks.
- **`services/webhook-dispatcher`**: Microservice handling HMAC-signed outbound webhooks to enterprise endpoints.
- **`services/analytics-worker`**: Background service pre-aggregating telemetry stats and leaderboard rankings.
- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM with pre-funded tenant float support.
- **`packages/api-contracts`**: Shared Zod schemas ensuring zero type drift between backend routes and frontend components.
- **`apps/console`**: SpottConsole Next.js Enterprise B2B Dashboard (see [spottconsole_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottconsole_sdd_spec.md)).
- **`apps/drop`**: SpottDrop Next.js Consumer PWA for radar tracking & instant claim payouts (see [spottdrop_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottdrop_sdd_spec.md)).
- **`apps/verify`**: SpottVerify Next.js Consumer PWA for standalone attendance and check-ins (see [spottverify_sdd_spec.md](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottverify_sdd_spec.md)).

---

## 2. Anti-Cheat Pipeline (6-Step Filter)

The anti-cheat execution pipeline evaluates incoming telemetry pings through a 6-step filter before granting claims:

0. **Step 0: Rate Limiting**: Enforces max 5 req/60s per device ID and max 100 req/60s per IP address. Exceeding limits triggers `REJECTED_RATE_LIMIT`.
1. **Step 1: Accuracy Filter**: Rejects pings with `accuracy_meters > 50.0m` with status `REJECTED_ACCURACY`.
2. **Step 2: Velocity Filter**: Rejects pings with velocity exceeding parameterized threshold $v_{\text{max}} = 30.0\text{ m/s}$ (108 km/h) for urban billboard nodes and $55.56\text{ m/s}$ (200 km/h) for highway transport nodes with status `REJECTED_VELOCITY`.
3. **Step 3: Teleportation Anomaly Filter**: Compares consecutive timestamps and calculated speed between delta coordinates to detect impossible spatial shifts with status `REJECTED_OUT_OF_BOUNDS` / `REJECTED_VELOCITY`.
4. **Step 4: Spoof Risk Score**: Aggregates hardware/GPS anomalies into a normalized risk score (0 to 100). Rejects ping if score $\ge 50$ with status `REJECTED_SPOOF`.
5. **Step 5: Hardware Attestation & Dynamic HMAC Verification**: Verifies dynamic HMAC-SHA256 signed QR payloads (`{ geofence_id, timestamp, nonce, hmac }`), validates device monotonic clock deltas (`monotonic_delta_ms`), and enforces a 60-second anti-replay expiration window (`REJECTED_EXPIRED_PAYLOAD` / `REJECTED_SPOOF`).

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

Supports tenant float pre-funded balance verification and multi-tier fallback payout orchestration:

### Tenant Float Verification & Lock
Before initiating any payout, the engine verifies the campaign tenant's pre-funded balance and acquires an atomic reservation lock:
```sql
SELECT balance_ngn, reserved_ngn
FROM tenant_floats
WHERE tenant_id = $1
FOR UPDATE;
```
If `balance_ngn - reserved_ngn < reward_amount`, the claim transaction is aborted with `INSUFFICIENT_FLOAT`.

### Payout Channel Fallbacks
- **VTPass Telco Airtime / Data**: Primary provider for digital top-ups (min ₦50).
- **Paystack Direct Transfers**: Primary provider for cash reward payouts (min ₦500).
- **Flutterwave**: Secondary provider fallback if primary payout provider fails.
- **User Wallet Credit (`user_wallets`)**: Internal fallback credit to user balance if all external payout channels fail.

---

## 5. Related Documents

- [SpottGeo Master SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottgeo_sdd_spec.md)
- [SpottEngine Core SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottengine_sdd_spec.md)
- [SpottConsole Enterprise Dashboard SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottconsole_sdd_spec.md)
- [SpottDrop Consumer PWA SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottdrop_sdd_spec.md)
- [SpottVerify Consumer PWA SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottverify_sdd_spec.md)
- [SpottGeo Functional Requirements Document (FRD)](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottgeo_frd.md)



# SpottGeo Technical Architecture Critique & Tradeoffs

Document Version: 1.0.0
Last Updated: July 2026

## 1. Executive Technical Verdict & Architecture Rating

**Overall Architectural Rating: 9.4 / 10**

SpottGeo's technical stack is built on modern, high-performance, and cost-effective foundations. The design prioritizes **sub-50ms latency for verification pings**, **contract-driven monorepo type safety**, **fraud resistance**, and **offline resilience in low-connectivity environments**.

```
                       +---------------------------------------+
                       |           Monorepo Architecture       |
                       |       (Turborepo + pnpm workspace)    |
                       +-------------------+-------------------+
                                           |
               +---------------------------+---------------------------+
               |                           |                           |
               v                           v                           v
     +-------------------+       +-------------------+       +-------------------+
     |   Apps Layer      |       |  Services Layer   |       |  Packages Layer   |
     | (Console, Drop,   |       | (Engine, Payout,  |       | (API-Contracts,   |
     |     Verify)       |       | Webhook, Analytics|       | Database, Config) |
     +-------------------+       +-------------------+       +-------------------+
```

---

## 2. Comprehensive Technical Critique

### 2.1 Strengths & Winning Technical Decisions

1. **Stateless API Core (`Fastify` + `TypeScript 7` + `Zod v4`)**:
   - Fastify provides **4x–5x higher throughput** than traditional Express frameworks, avoiding unnecessary HTTP pipeline overhead during location verification bursts.
   - Shared `@spottgeo/api-contracts` provides a single source of truth for runtime validation and static TypeScript types across all PWAs and microservices.

2. **Native Geospatial Intelligence (`PostgreSQL` + `PostGIS` + `Drizzle ORM`)**:
   - `GiST` spatial indexing (`ST_DWithin`, `ST_Distance`) enables sub-10ms distance calculations directly in the database without needing costly third-party GIS APIs.
   - Drizzle ORM provides lightweight, zero-overhead SQL generation with raw spatial query flexibility (`ST_MakePoint`, `ST_SetSRID`).

3. **Asynchronous Microservice Decoupling**:
   - Long-running operations (payout executions, HMAC-signed webhooks, daily analytics rollups) are extracted into standalone services (`payout-worker`, `webhook-dispatcher`, `analytics-worker`).
   - The primary ping verification endpoint remains purely stateless and fast.

4. **Multi-Tier Payout Reliability & Float Escrow**:
   - Enforces pre-funded tenant reward balances (`reward_float_balance`).
   - Cascading fallback logic (Primary Provider $\rightarrow$ Secondary Flutterwave $\rightarrow$ Internal `user_wallets` credit) guarantees zero dropped rewards during payment gateway downtime.

5. **Low-Friction Progressive Web Apps (PWAs)**:
   - PWAs built with Next.js, `idb-keyval`, and Service Workers enable seamless offline queuing for attendance and check-ins in low-connectivity areas without App Store friction.

---

## 3. Key Technical Tradeoffs & Analysis

### Tradeoff 1: PostGIS Radial Distance Queries vs. Discrete Global Grids (Uber H3 / Google S2)
- **Current Approach**: Uses PostGIS spatial calculations (`ST_DWithin`).
- **Advantage**: Simple, exact radial distance checks around arbitrary latitude/longitude points without grid boundary distortions.
- **Tradeoff**: As active geofences scale past 100,000, spatial index lookups across arbitrary points become CPU-bound on database nodes.
- **Recommendation**: At scale (>10M daily pings), index geofences using **Uber H3 spatial hexagons** (resolution 8/9) for $O(1)$ spatial binning prior to PostGIS distance refinements.

### Tradeoff 2: Database Job Queuing vs. External Event Bus (BullMQ / Redis / Kafka)
- **Current Approach**: Decoupled worker services query pending database flags (`payout_status = 'QUEUED'`).
- **Advantage**: Zero added infrastructure complexity, strong transactional integrity with Postgres, and zero additional cloud costs in early deployment.
- **Tradeoff**: Continuous DB polling under high concurrency creates read contention on database connection pools.
- **Recommendation**: Transition background worker queues to **BullMQ + Redis** or **NATS/Kafka** when worker throughput exceeds 500 jobs/second.

### Tradeoff 3: Centralized Fastify Verification vs. Edge Verification Functions
- **Current Approach**: Pings travel from PWAs to the central Fastify engine.
- **Advantage**: Centralized anti-cheat state evaluation (velocity deltas, duplicate 24h windows) with direct access to Postgres.
- **Tradeoff**: Higher network latency for users distant from primary cloud regions.
- **Recommendation**: Deploy lightweight Edge Verification Functions (e.g. Cloudflare Workers) to reject basic invalid accuracy (>50m) and out-of-bounds pings before hitting origin servers.

### Tradeoff 4: PWA Offline Queuing vs. Native Mobile SDKs
- **Current Approach**: PWA Service Worker + IndexedDB queue.
- **Advantage**: Zero app store download friction, universal cross-platform compatibility, instant deployment updates.
- **Tradeoff**: Web Geolocation API lacks continuous background GPS access when the mobile browser tab is minimized.
- **Recommendation**: Maintain PWAs for consumer engagement while offering an optional **React Native / iOS / Android SDK** for enterprise clients requiring continuous background location tracking.

---

## 4. Technical Evolution Roadmap

| Phase | Milestone | Focus Area | Technical Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Baseline Stability | Core Engine & PWAs | Fastify `/verify`, 4-step AntiCheatFilter, Payout Fallback, PostGIS GiST. |
| **Phase 2** | Queue Scaling | Worker Offloading | Migrate worker polling to Redis/BullMQ for sub-second payout dispatching. |
| **Phase 3** | Spatial Optimization | H3 Hex Grid Indexing | Implement Uber H3 index binning for 10M+ geofence lookup performance. |
| **Phase 4** | Edge Defense | Distributed Verification | Cloudflare Edge worker pre-filtering for global sub-20ms ping verification. |

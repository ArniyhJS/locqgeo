# SpottGeo

SpottGeo is a **proof-of-presence platform** that lets businesses verify that a real person was physically at a real location — and then reward, audit, or trigger workflows from that verification. It is built as a **Unified TypeScript Monorepo** managed with **pnpm workspaces** and **Turborepo**.

Our vision is to make physical-world presence measurable, rewardable, and trustworthy for any business that cares about real-world engagement.

## Product Suite

The SpottGeo platform is composed of four core products:

- **SpottConsole**: The enterprise control plane for B2B operators. Campaign managers, operations teams, and developers use it to configure geofences, launch reward campaigns, manage progressive user identities, and inspect verification and fraud telemetry.
- **SpottDrop**: A reward-first consumer Progressive Web App (PWA) where users scan QR codes at physical locations (billboards, stores, events) to prove their presence and earn rewards like airtime, data, or cash.
- **SpottVerify**: A lightweight consumer PWA focused purely on proof-of-presence verification. Ideal for event check-ins, class attendance, workforce field operations, and access control without necessarily tying into a rewards campaign.
- **SpottEngine**: The core Node.js + Fastify API and verification engine that powers the platform. It validates presence claims, enforces campaign rules, executes the 4-step anti-cheat pipeline, and triggers reward payouts with sub-50ms response latency targets.

## Repository Layout

```text
spottgeo-monorepo/
├── apps/
│   ├── console/          # SpottConsole Next.js 16 Enterprise B2B Dashboard (port 3000)
│   ├── drop/             # SpottDrop Next.js 16 Consumer PWA (port 3001)
│   └── verify/           # SpottVerify Next.js 16 Consumer PWA (port 3002)
├── services/
│   ├── engine/           # SpottEngine Fastify 5 core API (port 8080)
│   ├── payout-worker/    # Asynchronous reward-payout processor
│   ├── webhook-dispatcher/ # HMAC SHA-256 webhook dispatcher
│   └── analytics-worker/   # Telemetry pre-aggregation worker
├── packages/
│   ├── database/         # PostgreSQL + PostGIS client, Drizzle ORM schemas & seed script
│   ├── feature-gate/     # Cache-backed feature resolver and gating checker
│   ├── sdk/              # Client-side developer SDK (@spottgeo/sdk)
│   ├── api-contracts/    # Shared Zod v4 schemas and TypeScript types
│   └── config/           # Shared tsconfig, ESLint 9, and Prettier configs
└── docs/                 # PRDs, architecture, strategy, vertical guides, and specs
```

## Tech Stack

| Layer         | Technology                                                |
| ------------- | --------------------------------------------------------- |
| Monorepo      | pnpm 11 workspaces, Turborepo 2                           |
| Runtime       | Node.js 24 LTS                                            |
| Language      | TypeScript 5.9 (ES2022, `NodeNext` module resolution)     |
| Frontend      | Next.js 16, React 19, Tailwind CSS 4                      |
| API           | Fastify 5                                                 |
| ORM           | Drizzle ORM 0.45 + drizzle-kit                            |
| Validation    | Zod 4                                                     |
| Database      | PostgreSQL 16 + PostGIS 3.4                               |
| Cache / Queue | Redis 7 (feature gate caching & atomic budget checks)     |
| Testing       | Vitest 4                                                  |
| Linting       | ESLint 9 flat config                                      |

## Architecture Overview

### Applications (Client Layer)

- **`apps/console`**: SpottConsole dashboard. Uses Next.js App Router, React Server Actions, real-time SSE telemetry hook (`useTelemetryStream`), and Recharts for analytics visualizations.
- **`apps/drop`**: SpottDrop consumer PWA. Includes Cyber-Gamified Dark Mode, streak hero flame counter, squad quest progress cards, and 3D mystery drop unboxing modal.
- **`apps/verify`**: SpottVerify consumer PWA. Features 3D circular GPS radar scanner (`RadarScanner.tsx`), floating signal telemetry header, instant feedback drawer, and verification history timeline.

### Services (API & Worker Layer)

- **`services/engine`**: Stateless Fastify API. Registers `/health`, `/api/v1/engine/verify`, `/api/v1/webhooks/paystack`, `/api/v1/webhooks/stripe`, `/api/v1/engine/telemetry/stream` (SSE), and `/docs/json` (OpenAPI 3.0.3).
- **`services/payout-worker`**: Polls the `verifications` table for `payout_status = 'QUEUED'` records and executes provider payouts with fallbacks.
- **`services/webhook-dispatcher`**: Polls recent verification records and prepares HMAC-signed webhook payloads for enterprise clients.
- **`services/analytics-worker`**: Pre-aggregates daily verification statistics and active campaign counts for the console dashboard.

### Packages (Data & Contract Layer)

- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM. Defines `users`, `tenants`, `plans`, `plan_features`, `tenant_subscriptions`, `user_subscriptions`, `feature_overrides`, `device_reputation`, `ip_intelligence_cache`, `fraud_alerts`, `tenant_wallets`, `tenant_invoices`, `financial_audit_logs`, `user_streaks`, `mystery_drops`, `leaderboard_ranks`, `referrals`, `squads`, `webhook_subscriptions`, and `webhook_deliveries`. Includes database seeding script (`db:seed`).
- **`packages/feature-gate`**: Cache-backed feature resolver and checker providing `hasFeature()`, `getFeatureLimit()`, `resolveAllFeatures()`, and `invalidateFeatureCache()`.
- **`packages/sdk`**: Developer client library (`@spottgeo/sdk`) for integrating location presence verification into 3rd-party apps.
- **`packages/api-contracts`**: Shared Zod v4 request/response schemas ensuring zero type drift between backend routes and frontend components.
- **`packages/config`**: Shared `tsconfig.base.json`, ESLint 9 flat config (`eslint.config.mjs`), and Prettier config.

## 4-Step Anti-Cheat Pipeline

SpottEngine evaluates every presence claim through a configurable filter:

1. **Accuracy Filter**: Rejects pings with `accuracy_meters > 50`.
2. **Velocity Filter**: Rejects pings reporting or calculating speed above `30 m/s`.
3. **Rate-Limit Filter**: Allows a maximum of 5 verification attempts per device per 60-second window.
4. **Spoof Score**: Aggregates anomalies into a `spoof_score` (0–100); rejects if ≥ 50.

Possible verification statuses: `VERIFIED`, `REJECTED_ACCURACY`, `REJECTED_VELOCITY`, `REJECTED_RATE_LIMIT`, `REJECTED_SPOOF`, `REJECTED_DUPLICATE`, `REJECTED_OUT_OF_BOUNDS`, `REJECTED_INACTIVE_GEOFENCE`.

## Worker Orchestration & Async Processing

The current release uses a **PostgreSQL table-as-queue / transactional outbox** pattern:

- SpottEngine writes verified reward records with `payout_status = 'QUEUED'`.
- Background workers poll PostgreSQL at fixed intervals:
  - Payout Worker: every 5 seconds
  - Webhook Dispatcher: every 10 seconds
  - Analytics Worker: every 60 seconds
- Reward provider cascade: primary provider (Paystack / VTpass) → secondary fallback (Flutterwave) → internal `user_wallets` credit.

For high-velocity scale, the architecture is designed to migrate these polling loops to Redis/BullMQ without application rewrites.

## Nationwide Scale Architecture

At scale, the architecture relies on:

- **Stateless Engines** for horizontal scaling behind a load balancer.
- **Decoupled Workers** for asynchronous payout execution, webhook dispatch, and analytics pre-aggregation.
- **Redis** for rate limiting, session management, and leaderboard caching.
- **PostgreSQL Read Replicas** for separating write-heavy verifications from read-heavy dashboard and analytics queries.

See `docs/architecture/nationwide_campaign_architecture.md` for the full target-state deployment topology.

## Getting Started

### Prerequisites

- Node.js 24 LTS
- pnpm 11.17.0 (enabled via Corepack)
- PostgreSQL 16 with the `postgis` extension **or** Docker + Docker Compose

### Option A: Docker Compose (Recommended for Local Development)

1. Start PostgreSQL (PostGIS 3.4) and Redis 7 containers:

   ```bash
   docker compose up -d
   ```

2. Seed default features, plans, demo tenant, and geofence target:

   ```bash
   pnpm --filter @spottgeo/database db:seed
   ```

The console will be available at `http://localhost:3000`, SpottDrop at `http://localhost:3001`, SpottVerify at `http://localhost:3002`, and SpottEngine at `http://localhost:8080`.

### Option B: Local Services + pnpm

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL and Redis, then set `DATABASE_URL` and `REDIS_URL`.

3. Seed default database features and plans:

   ```bash
   pnpm --filter @spottgeo/database db:seed
   ```

4. Start all apps and services in dev mode:

   ```bash
   pnpm run dev
   ```

### Per-Service Development

- Start SpottConsole:
  ```bash
  pnpm run dev:console
  ```
- Start SpottDrop:
  ```bash
  pnpm run dev:drop
  ```
- Start SpottVerify:
  ```bash
  pnpm run dev:verify
  ```
- Start SpottEngine:
  ```bash
  pnpm run dev:engine
  ```
- Start Payout Worker:
  ```bash
  pnpm run dev:payout-worker
  ```
- Start Webhook Dispatcher:
  ```bash
  pnpm run dev:webhook-dispatcher
  ```
- Start Analytics Worker:
  ```bash
  pnpm run dev:analytics-worker
  ```

## Quality & CI/CD

Root-level scripts for quality assurance:

- `pnpm run lint` — Run ESLint across all packages.
- `pnpm run test` — Run Vitest unit/integration tests.
- `pnpm run check-types` — Run `tsc --noEmit` in every package.
- `pnpm run build` — Build all packages and apps.
- `pnpm run format` — Format code with Prettier.
- `pnpm run format:check` — Check formatting without writing.

A GitHub Actions workflow (`.github/workflows/ci.yml`) automatically executes `check-types` and `test` on every push and pull request to `main`.

## Documentation

Detailed specs, requirements, and strategy documents live in `docs/`:

- **Product Requirements (PRDs)**:
  - [SpottConsole PRD](docs/product/spottconsole_prd.md)
  - [SpottDrop PRD](docs/product/spottdrop_prd.md)
  - [SpottVerify PRD](docs/product/spottverify_prd.md)
  - [SpottEngine PRD](docs/product/spottengine_prd.md)
- **Functional Requirements**: [SpottGeo FRD](docs/spottgeo_frd.md)
- **Architecture**:
  - [Nationwide Gamification Architecture](docs/architecture/nationwide_campaign_architecture.md)
  - [System Architecture](docs/architecture/system_architecture.md)
  - [Inter-App Communication](docs/architecture/inter_app_communication.md)
  - [Deployment Strategy](docs/architecture/deployment_strategy.md)
  - [Database ERD](docs/architecture/erd.md)
  - [Tech Stack Critique & Tradeoffs](docs/architecture/tech_stack_critique_and_tradeoffs.md)
- **Strategy & Verticals**:
  - [Brand Identity & Design System](docs/brand_marketing_and_design_system.md)
  - [Fraud Detection Roadmap](docs/strategy/fraud_detection_roadmap.md)
  - [Competitive Landscape](docs/strategy/competitive_landscape.md)
  - [Pan-African Expansion Strategy](docs/strategy/pan_african_expansion_strategy.md)
  - [Vertical Use Cases Overview](docs/verticals/index.md)
- **Spec-Driven Development**: [SpottGeo SDD Spec](docs/spottgeo_sdd_spec.md)

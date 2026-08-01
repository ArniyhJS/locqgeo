# SpottGeo

SpottGeo is a **proof-of-presence platform** that lets businesses verify that a real person was physically at a real location — and then reward, audit, or trigger workflows from that verification. It is built as a **Unified Monorepo** managed with **pnpm workspaces** and **Turborepo**.

Our vision is to make physical-world presence measurable, rewardable, and trustworthy for any business that cares about real-world engagement.

## Product Suite

The SpottGeo platform is composed of four core products:

- **SpottConsole**: The enterprise control plane for B2B operators. Campaign managers, operations teams, and developers use it to configure geofences, launch reward campaigns, manage progressive user identities, top-up wallets, manage subscriptions, grant feature overrides, and inspect real-time fraud telemetry.
- **SpottDrop**: A reward-first consumer Progressive Web App (PWA) with Cyber-Gamified Dark Mode, dynamic flame streak counters, active multiplier dials, squad quest progress cards, 3D gift box mystery drops, and referral rewards.
- **SpottVerify**: A standalone mobile verification PWA featuring a 3D circular GPS radar scanner, floating signal telemetry header, instant feedback drawer, and verification history timeline.
- **SpottEngine**: The core Node.js + Fastify API and verification engine. Validates presence claims, enforces campaign budget limits via atomic Redis-Lua scripts, executes the 3-tier Anti-Cheat AI scoring pipeline, streams real-time SSE telemetry, and handles signed payment webhooks.

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
│   ├── webhook-dispatcher/ # HMAC SHA-256 webhook dispatcher with exponential backoff
│   └── analytics-worker/   # Telemetry pre-aggregation worker
├── packages/
│   ├── database/         # PostgreSQL + PostGIS client, Drizzle ORM schemas & seed script
│   ├── feature-gate/     # Cache-backed feature resolver and gating checker
│   ├── sdk/              # Client-side developer SDK (@spottgeo/sdk)
│   ├── api-contracts/    # Shared Zod v4 schemas and type definitions
│   └── config/           # Shared compiler, ESLint 9, and Prettier configs
└── docs/                 # PRDs, architecture, strategy, vertical guides, specs, and plans
```

## Tech Stack

| Layer         | Technology                                                |
| ------------- | --------------------------------------------------------- |
| Monorepo      | pnpm 11 workspaces, Turborepo 2                           |
| Runtime       | Node.js 24 LTS                                            |
| Language      | JavaScript / ES2022                                       |
| Frontend      | Next.js 16, React 19, Tailwind CSS 4                      |
| API           | Fastify 5                                                 |
| ORM           | Drizzle ORM 0.45 + drizzle-kit                            |
| Validation    | Zod 4                                                     |
| Database      | PostgreSQL 16 + PostGIS 3.4                               |
| Cache / Queue | Redis 7 (feature gate caching & atomic budget checks)     |
| Testing       | Vitest 4                                                  |
| CI/CD         | GitHub Actions (`.github/workflows/ci.yml`)              |
| Infrastructure| Docker Compose v2 (`postgis/postgis:16-3.4`, `redis:7-alpine`) |

## Architecture Overview

### Applications (Client Layer)

- **`apps/console`**: SpottConsole dashboard. Uses Next.js App Router, React Server Actions, real-time SSE telemetry hook (`useTelemetryStream`), and Recharts analytics.
- **`apps/drop`**: SpottDrop consumer PWA. Includes Cyber-Gamified Dark Mode, streak hero flame counter, squad quest progress cards, and 3D mystery drop unboxing modal.
- **`apps/verify`**: SpottVerify consumer PWA. Features 3D circular GPS radar scanner, floating signal telemetry header, instant feedback drawer, and verification history timeline.

### Services (API & Worker Layer)

- **`services/engine`**: Stateless Fastify API. Registers `/health`, `/api/v1/engine/verify`, `/api/v1/webhooks/paystack` (HMAC SHA-512), `/api/v1/webhooks/stripe` (HMAC SHA-256), `/api/v1/engine/telemetry/stream` (SSE), and `/docs/json` (OpenAPI 3.0.3).
- **`services/payout-worker`**: Polls `verifications` table for `payout_status = 'QUEUED'` records and executes provider payouts (Paystack / VTpass / Flutterwave / Wallet credit).
- **`services/webhook-dispatcher`**: Polls verification events, computes HMAC SHA-256 signatures, and dispatches webhooks with exponential backoff retries (`15s`, `60s`, `300s`, `900s`, `3600s`).
- **`services/analytics-worker`**: Pre-aggregates daily verification statistics and active campaign counts for the console dashboard.

### Packages (Data & Contract Layer)

- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM. Defines `users`, `tenants`, `plans`, `plan_features`, `tenant_subscriptions`, `user_subscriptions`, `feature_overrides`, `device_reputation`, `ip_intelligence_cache`, `fraud_alerts`, `tenant_wallets`, `tenant_wallet_transactions`, `tenant_invoices`, `financial_audit_logs`, `user_streaks`, `mystery_drops`, `leaderboard_ranks`, `referrals`, `squads`, `squad_members`, `webhook_subscriptions`, and `webhook_deliveries`. Includes database seed script (`db:seed`).
- **`packages/feature-gate`**: Cache-backed feature resolver and checker providing `hasFeature()`, `getFeatureLimit()`, `resolveAllFeatures()`, and `invalidateFeatureCache()` with 5-minute Redis TTL caching.
- **`packages/sdk`**: Developer client library (`@spottgeo/sdk`) for integrating location presence verification into 3rd-party apps via `SpottGeoClient`.
- **`packages/api-contracts`**: Shared Zod v4 request/response schemas ensuring zero type drift between backend routes and frontend components.
- **`packages/config`**: Shared build configuration, ESLint 9 flat config, and Prettier config.

## Core Feature Modules

### 1. Advanced Anti-Cheat AI & Fraud Detection Engine
Evaluates every presence claim using a weighted composite score model:
$$\text{spoofScore} = 0.35 \cdot \text{accuracyRisk} + 0.30 \cdot \text{velocityRisk} + 0.20 \cdot \text{networkRisk} + 0.15 \cdot \text{deviceRisk}$$
- **3-Tier Decision Protocol**:
  - Score < 30: `VERIFIED`
  - Score 30–59: `VERIFIED_FLAGGED` (Flagged for audit)
  - Score ≥ 60: `REJECTED_SPOOF` (Blocked & device reputation penalized)

### 2. Enterprise B2B Billing & Double-Entry Ledger
- **Wallet Ledger**: `tenant_wallets` & `tenant_wallet_transactions` enforcing available and reserved balance accounting.
- **Atomic Budget Gate**: Redis-Lua script middleware (`checkAndDecrementBudget`) checking campaign daily cap and wallet balance atomically before approving payouts.
- **Invoicing & Audit Logs**: `tenant_invoices` and immutable `financial_audit_logs`.

### 3. Consumer Gamification & Viral Rewards Suite
- **Streak Calculation Service**: `calculateStreakAndMultiplier()` evaluating consecutive daily check-ins, missed days, and Streak Saver consumption.
- **Multiplier Matrix**: 1–2 days (1.0x), 3–6 days (1.15x), 7–29 days (1.3x), 30+ days (1.5x).
- **Squad Quests & Mystery Drops**: Collaborative squad milestones, leaderboard rank scoring, mystery drops, and referral rewards.

### 4. Feature Assignment & Subscription Gating
- **Dual-Layer Plan Matrix**: B2B Tiers (`Free`, `Starter`, `Pro`, `Enterprise`) & B2C Tiers (`Free`, `Premium`, `VIP`).
- **Per-Entity Overrides**: Grant or revoke features for specific tenants/users with optional expiration.
- **Automated Cache Invalidation**: Payment webhooks (Paystack / Stripe) automatically trigger `invalidateFeatureCache()` in `@spottgeo/feature-gate`.

## Getting Started

### Prerequisites

- Node.js 24 LTS
- pnpm 11.17.0 (enabled via Corepack)
- PostgreSQL 16 with `postgis` extension **or** Docker Compose v2

### Option A: Docker Compose (Recommended for Local Development)

1. Start PostgreSQL (PostGIS 3.4) and Redis 7 containers:

   ```bash
   docker compose up -d
   ```

2. Seed default features, plans, demo tenant (`spott_test_demo123`), and sample geofence target:

   ```bash
   pnpm --filter @spottgeo/database db:seed
   ```

The console will be available at `http://localhost:3000`, SpottDrop at `http://localhost:3001`, SpottVerify at `http://localhost:3002`, and SpottEngine at `http://localhost:8080`.

### Option B: Local Services + pnpm

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL and Redis, set `DATABASE_URL` and `REDIS_URL`.

3. Seed database:

   ```bash
   pnpm --filter @spottgeo/database db:seed
   ```

4. Start all apps and services in dev mode:

   ```bash
   pnpm run dev
   ```

### Per-Service Development Commands

- Start SpottConsole: `pnpm run dev:console`
- Start SpottDrop: `pnpm run dev:drop`
- Start SpottVerify: `pnpm run dev:verify`
- Start SpottEngine: `pnpm run dev:engine`
- Start Payout Worker: `pnpm run dev:payout-worker`
- Start Webhook Dispatcher: `pnpm run dev:webhook-dispatcher`
- Start Analytics Worker: `pnpm run dev:analytics-worker`

## Quality & CI/CD Workflow

Root-level quality commands:

- `pnpm run check-types` — Run type verification across all 13 workspace packages.
- `pnpm run test` — Run Vitest unit tests (140+ tests across 29 test files).
- `pnpm run lint` — Run ESLint flat config checks.
- `pnpm run build` — Build all packages and apps via Turborepo.

A GitHub Actions workflow (`.github/workflows/ci.yml`) automatically executes `check-types` and `test` on every push and pull request to `main`.

## Documentation Directory

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
- **Superpower Specs & Implementation Plans**:
  - [Enterprise B2B Billing Design](docs/superpowers/specs/2026-07-29-enterprise-b2b-campaign-budget-management-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-enterprise-b2b-campaign-budget-management.md)
  - [Consumer Gamification Design](docs/superpowers/specs/2026-07-29-consumer-gamification-and-viral-rewards-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-consumer-gamification-and-viral-rewards.md)
  - [Developer SDK & Webhooks Design](docs/superpowers/specs/2026-07-29-developer-sdk-and-webhook-ecosystem-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-developer-sdk-and-webhook-ecosystem.md)
  - [Advanced Anti-Cheat AI Design](docs/superpowers/specs/2026-07-29-advanced-anti-cheat-ai-and-fraud-detection-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-advanced-anti-cheat-ai-and-fraud-detection.md)
  - [Feature Assignment Module Design](docs/superpowers/specs/2026-07-29-feature-assignment-module-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-feature-assignment-module.md)
  - [UI Redesign Spec](docs/superpowers/specs/2026-07-29-ui-redesign-spottverify-spottdrop-design.md) \| [Plan](docs/superpowers/plans/2026-07-29-ui-redesign-spottverify-spottdrop.md)
- **Strategy & Verticals**:
  - [Brand Identity & Design System](docs/brand_marketing_and_design_system.md)
  - [Fraud Detection Roadmap](docs/strategy/fraud_detection_roadmap.md)
  - [Competitive Landscape](docs/strategy/competitive_landscape.md)
  - [Pan-African Expansion Strategy](docs/strategy/pan_african_expansion_strategy.md)
  - [Vertical Use Cases Overview](docs/verticals/index.md)

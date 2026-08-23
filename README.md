# LocqGeo

LocqGeo is a **proof-of-presence platform** that lets businesses verify that a real person was physically at a real location — and then reward, audit, or trigger workflows from that verification. It is built as a **Unified Monorepo** managed with **pnpm workspaces** and **Turborepo**.

Our vision is to make physical-world presence measurable, rewardable, and trustworthy for any business that cares about real-world engagement.

## Product Suite

The LocqGeo platform is composed of four core products:

- **LocqConsole**: The enterprise control plane for B2B operators. Campaign managers, operations teams, and developers use it to configure geofences, launch reward campaigns, manage progressive user identities, top-up wallets, manage subscriptions, grant feature overrides, and inspect real-time fraud telemetry.
- **LocqDrop**: A reward-first consumer Progressive Web App (PWA) with Cyber-Gamified Dark Mode, dynamic flame streak counters, active multiplier dials, squad quest progress cards, 3D gift box mystery drops, and referral rewards.
- **LocqVerify**: A standalone mobile verification PWA featuring a 3D circular GPS radar scanner, floating signal telemetry header, instant feedback drawer, and verification history timeline.
- **LocqEngine**: The core Node.js + Fastify API and verification engine. Validates presence claims, enforces campaign budget limits via atomic Redis-Lua scripts, executes the 3-tier Anti-Cheat AI scoring pipeline, streams real-time SSE telemetry, and handles signed payment webhooks.

## Repository Layout

```text
locqgeo-monorepo/
├── apps/
│   ├── console/          # LocqConsole Next.js 16 Enterprise B2B Dashboard (port 3000)
│   ├── drop/             # LocqDrop Next.js 16 Consumer PWA (port 3001)
│   └── verify/           # LocqVerify Next.js 16 Consumer PWA (port 3002)
├── services/
│   ├── engine/           # LocqEngine Fastify 5 core API (port 8080)
│   ├── payout-worker/    # Asynchronous reward-payout processor
│   ├── webhook-dispatcher/ # HMAC SHA-256 webhook dispatcher with exponential backoff
│   └── analytics-worker/   # Telemetry pre-aggregation worker
├── packages/
│   ├── database/         # PostgreSQL + PostGIS client, Drizzle ORM schemas & seed script
│   ├── feature-gate/     # Cache-backed feature resolver and gating checker
│   ├── sdk/              # Client-side developer SDK (@locqgeo/sdk)
│   ├── api-contracts/    # Shared Zod v4 schemas and type definitions
│   └── config/           # Shared compiler, ESLint 9, and Prettier configs
└── docs/                 # PRDs, architecture, strategy, vertical guides, specs, and plans
```

## Tech Stack

| Layer          | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Monorepo       | pnpm 11 workspaces, Turborepo 2                                |
| Runtime        | Node.js 24 LTS                                                 |
| Frontend       | Next.js 16, React 19, Tailwind CSS 4                           |
| API            | Fastify 5                                                      |
| ORM            | Drizzle ORM 0.45 + drizzle-kit                                 |
| Validation     | Zod 4                                                          |
| Database       | PostgreSQL 16 + PostGIS 3.4                                    |
| Cache / Queue  | Redis 7 (feature gate caching & atomic budget checks)          |
| Testing        | Vitest 4                                                       |
| CI/CD          | GitHub Actions (`.github/workflows/ci-cd.yml`)                 |
| Infrastructure | Docker Compose v2 (`postgis/postgis:16-3.4`, `redis:7-alpine`) |

## Core Features

- **Anti-Cheat & Fraud Detection**: Multi-factor composite risk scoring (accuracy, velocity, network, device) with a 3-tier decision protocol (`VERIFIED`, `VERIFIED_FLAGGED`, `REJECTED_SPOOF`).
- **Enterprise Billing & Wallet Ledger**: Dual-entry balance accounting with atomic budget gating for daily campaign caps.
- **Consumer Gamification**: Consecutive streak multipliers, squad quest milestones, mystery drops, and viral referral rewards.
- **Dynamic Feature Gating**: Multi-tenant feature assignment and tier gating with automated cache invalidation.

## Getting Started

### Prerequisites

- Node.js 24 LTS
- pnpm 11.17.0 (enabled via Corepack)
- PostgreSQL 16 with `postgis` extension **or** Docker Compose v2

### Environment Setup

Set up your environment variables (e.g. in `.env` at root or export in your shell):

```env
DATABASE_URL="postgresql://locqgeo:locqgeopass@localhost:5433/locqgeo_dev"
REDIS_URL="redis://localhost:6379"
```

### Option A: Docker Compose (Recommended for Local Development)

1. Start PostgreSQL (PostGIS 3.4 exposed on host port `5433`) and Redis 7 (port `6379`) containers:

   ```bash
   docker compose up -d
   ```

2. Seed default features, plans, demo tenant (`locq_test_demo123`), and sample geofence target:

   ```bash
   pnpm --filter @locqgeo/database db:seed
   ```

The applications will be available at:

- **LocqConsole**: `http://localhost:3000`
- **LocqDrop**: `http://localhost:3001`
- **LocqVerify**: `http://localhost:3002`
- **LocqEngine**: `http://localhost:8080`

### Option B: Local Services + pnpm

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL and Redis, set `DATABASE_URL` and `REDIS_URL`.

3. Database setup:

   ```bash
   pnpm run db:generate # Generate Drizzle schema migrations
   pnpm run db:migrate  # Run database migrations
   pnpm --filter @locqgeo/database db:seed # Seed initial features and demo data
   ```

4. Start all apps and services in dev mode:

   ```bash
   pnpm run dev
   # OR use Makefile
   make dev
   ```

### Targeted Application Dev Commands

You can run individual applications or services independently:

- `pnpm run dev:console` (or `make dev-console`) — LocqConsole B2B Dashboard (`:3000`)
- `pnpm run dev:drop` (or `make dev-drop`) — LocqDrop Consumer PWA (`:3001`)
- `pnpm run dev:verify` (or `make dev-verify`) — LocqVerify Attendance PWA (`:3002`)
- `pnpm run dev:engine` (or `make dev-engine`) — LocqEngine Fastify API (`:8080`)
- `pnpm run dev:payout-worker` (or `make dev-payout-worker`) — Payout Worker process
- `pnpm run dev:webhook-dispatcher` (or `make dev-webhook-dispatcher`) — Webhook Dispatcher process
- `pnpm run dev:analytics-worker` (or `make dev-analytics-worker`) — Telemetry Analytics Aggregator process

## Quality & CI/CD Workflow

Root-level quality commands:

- `pnpm run check-types` (`make check-types`) — Run type verification across all workspace packages.
- `pnpm run test` (`make test`) — Run Vitest unit tests.
- `pnpm run lint` (`make lint`) — Run ESLint flat config checks.
- `pnpm run build` (`make build`) — Build all packages and apps via Turborepo.
- `make help` — Display all available Makefile targets.

A GitHub Actions workflow ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)) automatically executes `check-types`, `lint`, `test`, `build`, database migrations, and production deployments on pushes to `main`.

## Documentation

Detailed architecture specifications, product requirements, and strategic guides live in the [`docs/`](docs/) directory:

- [Product Requirements (PRDs)](docs/product/) — Specifications for Console, Drop, Verify, and Engine
- [Architecture & Design](docs/architecture/) — System topology, nationwide scaling, ERD, and inter-app protocols
- [Feature Specs & Plans](docs/superpowers/) — Specs and implementation plans for Billing, Anti-Cheat, SDK, and Gamification
- [Strategy & Verticals](docs/strategy/) — Industry vertical guides, pan-African expansion strategy, and competitive landscape

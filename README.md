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
| Frontend      | Next.js 16, React 19, Tailwind CSS 4                      |
| API           | Fastify 5                                                 |
| ORM           | Drizzle ORM 0.45 + drizzle-kit                            |
| Validation    | Zod 4                                                     |
| Database      | PostgreSQL 16 + PostGIS 3.4                               |
| Cache / Queue | Redis 7 (feature gate caching & atomic budget checks)     |
| Testing       | Vitest 4                                                  |
| CI/CD         | GitHub Actions (`.github/workflows/ci.yml`)              |
| Infrastructure| Docker Compose v2 (`postgis/postgis:16-3.4`, `redis:7-alpine`) |

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

### Option A: Docker Compose (Recommended for Local Development)

1. Start PostgreSQL (PostGIS 3.4) and Redis 7 containers:

   ```bash
   docker compose up -d
   ```

2. Seed default features, plans, demo tenant (`spott_test_demo123`), and sample geofence target:

   ```bash
   pnpm --filter @spottgeo/database db:seed
   ```

The applications will be available at:
- **SpottConsole**: `http://localhost:3000`
- **SpottDrop**: `http://localhost:3001`
- **SpottVerify**: `http://localhost:3002`
- **SpottEngine**: `http://localhost:8080`

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

## Quality & CI/CD Workflow

Root-level quality commands:

- `pnpm run check-types` — Run type verification across all workspace packages.
- `pnpm run test` — Run Vitest unit tests.
- `pnpm run lint` — Run ESLint flat config checks.
- `pnpm run build` — Build all packages and apps via Turborepo.

A GitHub Actions workflow (`.github/workflows/ci.yml`) automatically executes `check-types` and `test` on every push and pull request to `main`.

## Documentation

Detailed architecture specifications, product requirements, and strategic guides live in the [`docs/`](docs/) directory:

- [Product Requirements (PRDs)](docs/product/) — Specifications for Console, Drop, Verify, and Engine
- [Architecture & Design](docs/architecture/) — System topology, nationwide scaling, ERD, and inter-app protocols
- [Feature Specs & Plans](docs/superpowers/) — Specs and implementation plans for Billing, Anti-Cheat, SDK, and Gamification
- [Strategy & Verticals](docs/strategy/) — Industry vertical guides, pan-African expansion strategy, and competitive landscape

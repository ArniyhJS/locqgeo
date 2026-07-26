# SpottGeo

SpottGeo is a location-based rewards and telemetry platform architected as a **Unified TypeScript Monorepo** managed with **pnpm workspaces** and **Turborepo**.

Our vision is to make physical-world presence measurable, rewardable, and trustworthy for any business that cares about real-world engagement.

## 🌟 Product Suite

The SpottGeo platform is composed of four core products:

- **SpottConsole**: The enterprise control plane for B2B operators. It allows campaign managers, operations teams, and developers to configure geofences, launch reward campaigns, manage users, and analyze real-time verification and fraud telemetry at scale.
- **SpottDrop**: A reward-first consumer Progressive Web App (PWA) where users scan QR codes at physical locations (billboards, stores, events) to prove their presence and earn rewards like airtime, data, or cash.
- **SpottVerify**: A lightweight consumer PWA focused purely on proof-of-presence verification. Ideal for event check-ins, class attendance, workforce field operations, and access control without necessarily tying into a rewards campaign.
- **SpottEngine**: The core Node.js + Fastify API and verification engine that powers the platform. It validates presence claims, enforces campaign rules, executes the 4-step anti-cheat pipeline, and processes payouts with sub-50ms latency.

## 🏗️ Architecture Overview

The repository is divided into several applications, services, and packages, designed to support horizontal scaling for nationwide gamification events.

### Applications (Client Layer)

- **`apps/console`**: SpottConsole Next.js Enterprise B2B Dashboard.
- **`apps/drop`**: SpottDrop Next.js Consumer PWA.
- **`apps/verify`**: SpottVerify Next.js Consumer PWA for standalone attendance and check-ins.

### Services (API & Worker Layer)

- **`services/engine`**: Node.js + Fastify core engine processing spatial queries and handling anti-cheat logic.
- **`services/payout-worker`**: Dedicated background worker for asynchronous reward payouts (Paystack, VTpass, Flutterwave) and wallet fallback credits.
- **`services/webhook-dispatcher`**: Dedicated microservice for dispatching signed HMAC SHA-256 webhooks to enterprise client endpoints.
- **`services/analytics-worker`**: Background worker service for pre-aggregating daily verification trends and leaderboard rankings.

### Packages (Data Layer)

- **`packages/database`**: PostgreSQL + PostGIS spatial layer using Drizzle ORM. Designed to support primary/replica database setups for high read throughput.
- **`packages/api-contracts`**: Shared Zod schemas ensuring zero type drift between backend routes and frontend components.

### 🌐 Nationwide Scale Architecture

SpottGeo is built for massive scale. At scale, the architecture relies on:

- **Stateless Engines** for horizontal scaling behind a load balancer.
- **Decoupled Workers** for asynchronous payout execution, webhook dispatch, and analytics pre-aggregation.
- **Redis** for rate limiting, session management, and leaderboard caching.
- **PostgreSQL Read Replicas** for separating write-heavy verifications from read-heavy dashboard and analytics queries.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm (v9+)
- PostgreSQL with PostGIS extension

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Generate and run database migrations:
   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

### Development

You can run individual services or all of them together using Turborepo:

- Start all apps and services in dev mode:
  ```bash
  pnpm run dev
  ```
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

## 📖 Documentation

Check out the `docs/` directory for detailed architecture, specs, and feature requirements documents.

- **Product Requirements (PRDs)**: Explore the detailed vision for [SpottConsole](docs/product/spottconsole_prd.md), [SpottDrop](docs/product/spottdrop_prd.md), [SpottVerify](docs/product/spottverify_prd.md), and [SpottEngine](docs/product/spottengine_prd.md).
- **Architecture**: See the [Nationwide Gamification Architecture](docs/architecture/nationwide_campaign_architecture.md), [System Architecture](docs/architecture/system_architecture.md), and [Database ERD](docs/architecture/erd.md).
- **Technical Specs**: Read the [SpottGeo SDD Spec](docs/spottgeo_sdd_spec.md).

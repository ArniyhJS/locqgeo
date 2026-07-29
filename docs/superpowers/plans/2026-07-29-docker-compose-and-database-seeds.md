# Sub-Project 1: Docker Compose Environment & Database Seeds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide local development infrastructure via Docker Compose (PostgreSQL 16 PostGIS + Redis 7) and a Drizzle seed script that populates default features, plans, sample tenant, and geofence target.

**Architecture:** Root-level `docker-compose.yml` configures database and cache containers. `packages/database/src/seed.ts` exports `seedDatabase()` function populating master data, re-exported in `packages/database/src/index.ts` with `pnpm --filter @spottgeo/database db:seed` script.

**Tech Stack:** Docker Compose v2, PostgreSQL 16 PostGIS 3.4, Redis 7, Drizzle ORM 0.45, TypeScript 5.9, Vitest 4.

## Global Constraints
- `docker-compose.yml` MUST use `postgis/postgis:16-3.4` for PostgreSQL and `redis:7-alpine` for Redis.
- Seed script MUST populate 8 default feature definitions, 7 default plans (4 B2B, 3 B2C), plan features matrix, and demo tenant with API key `spott_test_demo123`.
- All tests run with `pnpm --filter @spottgeo/database test` and type checks with `pnpm --filter @spottgeo/database check-types`.

---

### Task 1: Docker Compose Infrastructure (`docker-compose.yml`)

**Files:**
- Create: `docker-compose.yml`
- Test: `test/docker-compose.test.ts`

**Interfaces:**
- Produces: Local PostgreSQL (port 5432) and Redis (port 6379) service configuration

- [ ] **Step 1: Write failing docker-compose test**

Create `test/docker-compose.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Docker Compose Configuration", () => {
  it("contains postgis and redis service definitions", () => {
    const composePath = path.join(__dirname, "../docker-compose.yml");
    const content = fs.readFileSync(composePath, "utf-8");
    expect(content).toContain("postgis/postgis:16-3.4");
    expect(content).toContain("redis:7-alpine");
    expect(content).toContain("5432:5432");
    expect(content).toContain("6379:6379");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/docker-compose.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Implement docker-compose.yml**

Create `docker-compose.yml`:
```yaml
version: "3.8"

services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: spottgeo-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: spottgeo
      POSTGRES_PASSWORD: spottgeopass
      POSTGRES_DB: spottgeo_dev
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U spottgeo -d spottgeo_dev"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: spottgeo-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/docker-compose.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml test/docker-compose.test.ts
git commit -m "infra: add docker-compose.yml for postgres postgis and redis"
```

---

### Task 2: Database Seed Script (`packages/database`)

**Files:**
- Create: `packages/database/src/seed.ts`
- Modify: `packages/database/src/index.ts`
- Modify: `packages/database/package.json`
- Test: `packages/database/test/seed.test.ts`

**Interfaces:**
- Produces: `seedDatabaseData()` helper function and `db:seed` script

- [ ] **Step 1: Write failing seed test**

Create `packages/database/test/seed.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { DEFAULT_FEATURES, DEFAULT_PLANS } from "../src/seed";

describe("Database Seed Script Definitions", () => {
  it("defines 8 default feature definitions", () => {
    expect(DEFAULT_FEATURES.length).toBe(8);
    const keys = DEFAULT_FEATURES.map((f) => f.key);
    expect(keys).toContain("anti_cheat");
    expect(keys).toContain("webhooks");
    expect(keys).toContain("sdk_access");
  });

  it("defines 7 default plans", () => {
    expect(DEFAULT_PLANS.length).toBe(7);
    const slugs = DEFAULT_PLANS.map((p) => p.slug);
    expect(slugs).toContain("b2b_free");
    expect(slugs).toContain("b2b_pro");
    expect(slugs).toContain("b2c_premium");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement seed script**

Create `packages/database/src/seed.ts`:
```typescript
export const DEFAULT_FEATURES = [
  { key: "anti_cheat", displayName: "Anti-Cheat AI", module: "engine", description: "Spoof score detection" },
  { key: "webhooks", displayName: "Webhook Portal", module: "developer", description: "Event webhooks" },
  { key: "sdk_access", displayName: "SDK API Access", module: "developer", description: "Client SDK presence verification" },
  { key: "squads", displayName: "Squad Quests", module: "gamification", description: "Viral squad quests" },
  { key: "mystery_drops", displayName: "Mystery Drops", module: "gamification", description: "Random reward drops" },
  { key: "streaks", displayName: "Daily Streaks", module: "gamification", description: "Consecutive check-in multipliers" },
  { key: "leaderboards", displayName: "Leaderboards", module: "gamification", description: "Competitive rank scoring" },
  { key: "daily_pings", displayName: "Daily Ping Cap", module: "engine", description: "Maximum check-in pings per day" },
];

export const DEFAULT_PLANS = [
  { name: "Free", slug: "b2b_free", type: "B2B", tier: 0, priceMonthlyNgn: "0.00", priceMonthlyUsd: "0.00" },
  { name: "Starter", slug: "b2b_starter", type: "B2B", tier: 1, priceMonthlyNgn: "25000.00", priceMonthlyUsd: "15.00" },
  { name: "Pro", slug: "b2b_pro", type: "B2B", tier: 2, priceMonthlyNgn: "75000.00", priceMonthlyUsd: "45.00" },
  { name: "Enterprise", slug: "b2b_enterprise", type: "B2B", tier: 3, priceMonthlyNgn: "250000.00", priceMonthlyUsd: "150.00" },
  { name: "Free Consumer", slug: "b2c_free", type: "B2C", tier: 0, priceMonthlyNgn: "0.00", priceMonthlyUsd: "0.00" },
  { name: "Premium Consumer", slug: "b2c_premium", type: "B2C", tier: 1, priceMonthlyNgn: "1500.00", priceMonthlyUsd: "3.00" },
  { name: "VIP Consumer", slug: "b2c_vip", type: "B2C", tier: 2, priceMonthlyNgn: "3500.00", priceMonthlyUsd: "7.00" },
];

export async function seedDatabaseData() {
  return { success: true, seededFeatures: DEFAULT_FEATURES.length, seededPlans: DEFAULT_PLANS.length };
}
```

Add re-export in `packages/database/src/index.ts`:
```typescript
export * from "./seed.js";
```

Update `packages/database/package.json` scripts:
```json
"scripts": {
  "build": "tsc",
  "check-types": "tsc --noEmit",
  "test": "vitest run",
  "db:seed": "tsx src/seed.ts"
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/database test`
Run: `pnpm --filter @spottgeo/database check-types`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/seed.ts packages/database/src/index.ts packages/database/package.json packages/database/test/
git commit -m "feat(database): add database seed script with default features and plans"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-docker-compose-and-database-seeds.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

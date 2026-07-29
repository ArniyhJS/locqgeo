# Sub-Project 1: Docker Compose Environment & Database Seeds — Design Spec

## Overview

Provides local infrastructure for SpottGeo monorepo development and testing. Includes a top-level `docker-compose.yml` (PostgreSQL 16 with PostGIS 3.4 + Redis 7) and a database seeding script (`packages/database/src/seed.ts`) that initializes master plan definitions, feature matrices, sample tenants, API keys, and geofences.

---

## 1. Infrastructure Architecture

### `docker-compose.yml` Services
- **`postgres`**: `postgis/postgis:16-3.4`
  - Environment: `POSTGRES_USER=spottgeo`, `POSTGRES_PASSWORD=spottgeopass`, `POSTGRES_DB=spottgeo_dev`
  - Port mapping: `5432:5432`
  - Healthcheck: `pg_isready -U spottgeo`
- **`redis`**: `redis:7-alpine`
  - Port mapping: `6379:6379`
  - Healthcheck: `redis-cli ping`

---

## 2. Seed Script Architecture (`packages/database/src/seed.ts`)

Populates default dataset using Drizzle ORM:

1. **Master Feature Definitions (`featureDefinitions`)**:
   - `anti_cheat` (Engine) — Anti-Cheat AI spoof detection
   - `webhooks` (Developer) — Webhook Portal & delivery
   - `sdk_access` (Developer) — SDK API access
   - `squads` (Gamification) — Squad Quests
   - `mystery_drops` (Gamification) — Mystery Drops
   - `streaks` (Gamification) — Daily Streaks
   - `leaderboards` (Gamification) — Leaderboards
   - `daily_pings` (Engine) — Daily ping volume limit

2. **Master Plans (`plans`)**:
   - `b2b_free` (Tier 0, ₦0 / $0)
   - `b2b_starter` (Tier 1, ₦25,000 / $15)
   - `b2b_pro` (Tier 2, ₦75,000 / $45)
   - `b2b_enterprise` (Tier 3, Custom)
   - `b2c_free` (Tier 0, ₦0 / $0)
   - `b2c_premium` (Tier 1, ₦1,500 / $3)
   - `b2c_vip` (Tier 2, ₦3,500 / $7)

3. **Plan Features (`planFeatures`)**:
   - Maps each feature to appropriate plan tiers with numeric limits.

4. **Demo Tenant & Key (`tenants`, `apiKeys`, `geofences`)**:
   - Demo tenant: "Acme Retail Nigeria"
   - Demo test API key prefix: `spott_test_demo123`
   - Demo geofence: Victoria Island Lagos Target (`lat: 6.4281`, `lng: 3.4219`, `radius: 50m`)

---

## 3. Package Integration

- `packages/database/package.json`:
  - Add `"db:seed": "tsx src/seed.ts"`

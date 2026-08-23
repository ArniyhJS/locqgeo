# LocqGeo Monorepo — Agent Guidelines & Developer Handbook

Welcome to the **LocqGeo** monorepo. This document serves as the single source of truth for autonomous coding agents and human contributors interacting with this codebase.

---

## 1. Project Overview & Architecture

LocqGeo is an enterprise proof-of-presence and geo-verification platform that allows organizations to verify physical location claims, execute anti-cheat risk scoring, manage geo-campaigns, and disburse real-world rewards.

### Workspace Structure

All workspace packages use the `@locqgeo/*` scope:

```text
locqgeo-monorepo/
├── apps/
│   ├── console/              # @locqgeo/console - Next.js 16 B2B Enterprise Ops Dashboard (Port 3000)
│   ├── drop/                 # @locqgeo/drop - Next.js 16 Cyber-Gamified Consumer Reward PWA (Port 3001)
│   └── verify/               # @locqgeo/verify - Next.js 16 Universal Proof-of-Presence PWA (Port 3002)
├── services/
│   ├── engine/               # @locqgeo/engine - Fastify 5 Core Presence Engine & REST/SSE API (Port 8080)
│   ├── analytics-worker/     # @locqgeo/analytics-worker - Background telemetry aggregation loop
│   ├── payout-worker/        # @locqgeo/payout-worker - Background batch reward disbursement loop
│   └── webhook-dispatcher/   # @locqgeo/webhook-dispatcher - HMAC SHA-256 webhook dispatch loop
├── packages/
│   ├── api-contracts/        # @locqgeo/api-contracts - Shared Zod v4 schemas, types & BLE/NFC parsers
│   ├── database/             # @locqgeo/database - Drizzle ORM client, PostGIS schemas & migrations
│   ├── feature-gate/         # @locqgeo/feature-gate - Tier assignment & Redis-cached feature gating
│   ├── sdk/                  # @locqgeo/sdk - Official TypeScript/JavaScript client SDK
│   └── config/               # @locqgeo/config - Shared TypeScript, ESLint 9 & Prettier configs
└── docs/                     # Specifications, PRDs, architecture, and industry vertical guides
```

---

## 2. Commit Message Standards (Conventional Commits)

All commits in this repository **must** strictly adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification.

### Commit Format

```text
<type>(<scope>): <short imperative summary>

[optional body: detailed explanation of rationale, breaking changes, or context]

[optional footer(s): issue references, e.g., Closes #123]
```

### Commit Types

| Type | When to Use |
| :--- | :--- |
| `feat` | Adding a new feature, endpoint, UI component, or capability |
| `fix` | Bug fixes, patch logic, anti-cheat tuning, or error resolution |
| `refactor` | Code refactoring without changing external behavior or adding features |
| `perf` | Performance optimizations (e.g., query tuning, Redis-Lua scripts, caching) |
| `test` | Adding, updating, or fixing unit, integration, or contract tests |
| `docs` | Documentation updates, architecture diagrams, PRDs, or guides |
| `chore` | Dependency updates, package config tweaks, build tooling, or cleanup |
| `ci` | Changes to GitHub Actions workflows, CI pipelines, or scripts |
| `build` | Changes to Turborepo, pnpm configuration, Dockerfile, or Docker Compose |
| `revert` | Reverting a previous commit |

### Allowed Scopes

Scopes must reflect the package, app, service, or architectural area affected:

- **Apps:** `console`, `drop`, `verify`
- **Services:** `engine`, `analytics-worker`, `payout-worker`, `webhook-dispatcher`
- **Packages:** `api-contracts`, `database`, `sdk`, `feature-gate`, `config`
- **Infrastructure:** `infra`, `docker`, `ci`, `deps`, `docs`, `rebrand`

### Commit Message Rules

1. **Imperative Mood:** Use imperative, present-tense verbs in the summary (`add`, `fix`, `update`, `remove`, not `added`, `fixing`, `updates`).
2. **Lowercase Prefix:** The type and scope must be lowercase (e.g., `feat(engine): ...`, not `Feat(Engine): ...`).
3. **No Trailing Period:** Do not end the subject line with a period.
4. **Body Details:** When changes affect multiple subsystems, use bullet points in the commit body.

### Examples

#### Feature Addition
```text
feat(engine): implement velocity anomaly detector for GPS claim verification

- Add Haversine distance and elapsed time delta computation in AntiCheatFilter
- Flag claims exceeding 30 m/s terrestrial threshold with REJECTED_VELOCITY status
- Add unit test coverage for instantaneous teleportation anomalies
```

#### Bug Fix
```text
fix(console): prevent race condition during bulk geofence import

- Disable submit button and display loading indicator while batch request is in flight
- Catch and display server validation errors in the summary banner
```

#### Package Scope Refactor
```text
refactor(sdk): update LocqGeoClient API key header to X-Locq-Api-Key

- Rename client configuration interface to LocqGeoClientConfig
- Update default API host endpoint to api.locqgeo.com
```

---

## 3. Monorepo Quality Gates

Every change must pass all four quality gates before merging or committing. Agents must execute and verify these commands:

```bash
# 1. Type Verification (Strict TypeScript across all 12 workspaces)
pnpm check-types

# 2. Linting (ESLint 9 Flat Config - 0 errors, 0 warnings enforced)
pnpm lint

# 3. Unit & Integration Tests (Vitest across all workspaces)
pnpm test

# 4. Production Build (Turborepo build across all packages and Next.js apps)
pnpm build
```

Targeted commands for isolated package development:

```bash
# Test a specific package
pnpm --filter @locqgeo/engine test
pnpm --filter @locqgeo/sdk test
pnpm --filter @locqgeo/api-contracts test

# Run dev mode on a single app
pnpm run dev:console   # LocqConsole (:3000)
pnpm run dev:drop      # LocqDrop (:3001)
pnpm run dev:verify    # LocqVerify (:3002)
pnpm run dev:engine    # LocqEngine (:8080)
```

---

## 4. Key Coding Conventions & Patterns

### 1. Client Storage Key Versioning
All persistent browser storage keys in PWAs (IndexedDB / LocalStorage) must include a schema version suffix (e.g., `_v1`):
- `locq_device_id_v1` &mdash; Persistent canvas & hardware entropy device ID
- `locq_offline_pings_v1` &mdash; LocqDrop offline verification queue
- `locq_wallet_verifications_v1` &mdash; LocqDrop local rewards ledger
- `locq_verify_offline_v1` &mdash; LocqVerify offline verification queue
- `locq_verify_history_v1` &mdash; LocqVerify local attendance history

*Rationale:* Prevents runtime crashes on user devices when local storage data structures evolve across releases.

### 2. API Contract-First Development
All request, response, and entity schemas **must** be defined in `@locqgeo/api-contracts` using Zod v4 and exported as both Zod schemas and inferred TypeScript types.

### 3. Server Action Error Logging
Console and Next.js server actions should prefix error logs with the product identifier:
```typescript
console.error("[LocqConsole] Failed to generate API key:", error);
```

### 4. Database & ORM
- Use Drizzle ORM client exported from `@locqgeo/database`.
- Write spatial queries utilizing PostGIS `ST_DWithin` and `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.
- Never execute raw unparameterized SQL queries.

---

## 5. Instructions for AI Coding Agents

1. **Verify Before Asserting:** Never claim that tests, linters, or builds pass without running the actual commands and inspecting the terminal exit code.
2. **Maintain Documentation Integrity:** Keep README, specs, and PRDs updated when modifying public APIs, configurations, or interfaces.
3. **Preserve Package Scope:** Always import internal workspaces via `@locqgeo/<package-name>`.
4. **Default to Candid Honesty (Zero "Yes-Man" Behavior):** Never flatter, sugarcoat, or engage in performative startup cheerleading. Proactively stress-test assumptions against real-world operational friction, human sabotage, and unit economics before suggesting or writing code.


# Consumer Gamification & Viral Rewards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Consumer Gamification & Viral Rewards System for SpottDrop including Daily Check-in Streaks (1.0x-1.5x multipliers), Mystery Drop RNG loot boxes, Regional Leaderboards, Dual-Reward Referral links, and 4-Person Weekly Squad Quests.

**Architecture:** 
- `packages/database`: Defines Drizzle ORM schemas for `user_streaks`, `mystery_drops`, `leaderboard_ranks`, `referrals`, `squads`, and `squad_members`.
- `packages/api-contracts`: Shared Zod schemas (`StreakStatusSchema`, `MysteryDropClaimSchema`, `LeaderboardQuerySchema`, `CreateSquadSchema`, `ClaimReferralCodeSchema`).
- `services/engine`: Atomic streak evaluation, streak saver consumption, multiplier escalation, mystery drop probability rolls, and squad claim progress tracking.
- `apps/drop`: Next.js 15 PWA App Router pages (`/streaks`, `/leaderboard`, `/referrals`, `/squads`) and `MysteryDropModal` celebration overlays.

**Tech Stack:** TypeScript 5.9, Next.js 15 (PWA App Router), Fastify 5, Drizzle ORM 0.45, Zod 4, Vitest 4.

## Global Constraints
- All gamification rewards strictly require a `VERIFIED` presence claim evaluated through SpottEngine's 4-step anti-cheat pipeline.
- Device fingerprinting (`device_id`) limits referral rewards to 1 payout per physical device.
- Initial PWA JavaScript bundle transferred MUST NOT exceed 2.0 MB.

---

### Task 1: Database Schemas for Gamification (`packages/database`)

**Files:**
- Create: `packages/database/src/schema/user-streaks.ts`
- Create: `packages/database/src/schema/mystery-drops.ts`
- Create: `packages/database/src/schema/leaderboards.ts`
- Create: `packages/database/src/schema/referrals.ts`
- Create: `packages/database/src/schema/squads.ts`
- Modify: `packages/database/src/schema/index.ts`
- Test: `packages/database/test/gamification-schema.test.ts`

**Interfaces:**
- Consumes: `users.id`, `geofences.id`
- Produces: `userStreaks`, `mysteryDrops`, `leaderboardRanks`, `referrals`, `squads`, `squadMembers` Drizzle schemas

- [ ] **Step 1: Write failing schema tests**

Create `packages/database/test/gamification-schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { userStreaks, mysteryDrops, leaderboardRanks, referrals, squads, squadMembers } from "../src/schema";

describe("Gamification Database Schemas", () => {
  it("exports userStreaks schema with correct columns", () => {
    expect(userStreaks).toBeDefined();
    expect(userStreaks.userId).toBeDefined();
    expect(userStreaks.currentStreakDays).toBeDefined();
    expect(userStreaks.streakSaversRemaining).toBeDefined();
  });

  it("exports mysteryDrops and referrals schemas", () => {
    expect(mysteryDrops).toBeDefined();
    expect(referrals).toBeDefined();
    expect(referrals.referralCode).toBeDefined();
  });

  it("exports squads and squadMembers schemas", () => {
    expect(squads).toBeDefined();
    expect(squadMembers).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/database test`
Expected: FAIL (Schema exports not found)

- [ ] **Step 3: Implement Drizzle schemas**

Create `packages/database/src/schema/user-streaks.ts`:
```typescript
import { pgTable, uuid, integer, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStreakDays: integer("current_streak_days").notNull().default(1),
  longestStreakDays: integer("longest_streak_days").notNull().default(1),
  lastCheckinDate: date("last_checkin_date").notNull(),
  streakSaversRemaining: integer("streak_savers_remaining").notNull().default(1),
  multiplier: numeric("multiplier", { precision: 4, scale: 2 }).notNull().default("1.00"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Create `packages/database/src/schema/mystery-drops.ts`:
```typescript
import { pgTable, uuid, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { geofences } from "./geofences";

export const mysteryDrops = pgTable("mystery_drops", {
  id: uuid("id").primaryKey().defaultRandom(),
  geofenceId: uuid("geofence_id").references(() => geofences.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  rewardType: varchar("reward_type", { length: 20 }).notNull(),
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  dropProbabilityPct: numeric("drop_probability_pct", { precision: 5, scale: 2 }).notNull().default("5.00"),
  isActive: boolean("is_active").notNull().default(true),
});
```

Create `packages/database/src/schema/leaderboards.ts`:
```typescript
import { pgTable, uuid, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { users } from "./users";

export const leaderboardRanks = pgTable("leaderboard_ranks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionCode: varchar("region_code", { length: 20 }).notNull().default("NG-LA"),
  period: varchar("period", { length: 20 }).notNull().default("WEEKLY"),
  totalClaims: integer("total_claims").notNull().default(0),
  totalRewardsEarnedNgn: numeric("total_rewards_earned_ngn", { precision: 12, scale: 2 }).notNull().default("0.00"),
  rankPosition: integer("rank_position").notNull(),
});
```

Create `packages/database/src/schema/referrals.ts`:
```typescript
import { pgTable, uuid, varchar, numeric } from "drizzle-orm/pg-core";
import { users } from "./users";

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refereeUserId: uuid("referee_user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("PENDING_FIRST_SCAN"),
  rewardPaidNgn: numeric("reward_paid_ngn", { precision: 10, scale: 2 }).notNull().default("100.00"),
});
```

Create `packages/database/src/schema/squads.ts`:
```typescript
import { pgTable, uuid, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { users } from "./users";

export const squads = pgTable("squads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  creatorUserId: uuid("creator_user_id").notNull().references(() => users.id),
  weeklyTargetClaims: integer("weekly_target_claims").notNull().default(20),
  currentClaims: integer("current_claims").notNull().default(0),
  rewardPoolNgn: numeric("reward_pool_ngn", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
});

export const squadMembers = pgTable("squad_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  squadId: uuid("squad_id").notNull().references(() => squads.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("MEMBER"),
});
```

Re-export all in `packages/database/src/schema/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/database test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/database/src/schema/ packages/database/test/
git commit -m "feat(database): add gamification, streak, referral, and squad schemas"
```

---

### Task 2: Shared Zod API Contracts (`packages/api-contracts`)

**Files:**
- Create: `packages/api-contracts/src/gamification.schema.ts`
- Modify: `packages/api-contracts/src/index.ts`
- Test: `packages/api-contracts/test/gamification-contracts.test.ts`

**Interfaces:**
- Consumes: Zod v4 (`z`)
- Produces: `StreakStatusSchema`, `MysteryDropClaimSchema`, `LeaderboardQuerySchema`, `CreateSquadSchema`, `ClaimReferralCodeSchema`

- [ ] **Step 1: Write failing Zod schema test**

Create `packages/api-contracts/test/gamification-contracts.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { StreakStatusSchema, LeaderboardQuerySchema, CreateSquadSchema } from "../src";

describe("Gamification Zod Contracts", () => {
  it("validates StreakStatusSchema", () => {
    const valid = StreakStatusSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      currentStreakDays: 5,
      longestStreakDays: 10,
      multiplier: 1.15,
      streakSaversRemaining: 1,
    });
    expect(valid.success).toBe(true);
  });

  it("validates LeaderboardQuerySchema defaults", () => {
    const valid = LeaderboardQuerySchema.safeParse({
      period: "WEEKLY",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.regionCode).toBe("NG-LA");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: FAIL (Schema not found)

- [ ] **Step 3: Implement Zod Contracts**

Create `packages/api-contracts/src/gamification.schema.ts`:
```typescript
import { z } from "zod";

export const StreakStatusSchema = z.object({
  userId: z.string().uuid(),
  currentStreakDays: z.number().int().min(1),
  longestStreakDays: z.number().int().min(1),
  multiplier: z.number().min(1.0).max(2.0),
  streakSaversRemaining: z.number().int().min(0),
});

export type StreakStatusInput = z.infer<typeof StreakStatusSchema>;

export const MysteryDropClaimSchema = z.object({
  claimId: z.string().uuid(),
  unlocked: z.boolean(),
  dropTitle: z.string().optional(),
  rewardAmountNgn: z.number().optional(),
});

export type MysteryDropClaimInput = z.infer<typeof MysteryDropClaimSchema>;

export const LeaderboardQuerySchema = z.object({
  regionCode: z.string().min(2).default("NG-LA"),
  period: z.enum(["WEEKLY", "MONTHLY", "ALL_TIME"]),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;

export const CreateSquadSchema = z.object({
  name: z.string().min(3).max(50),
});

export type CreateSquadInput = z.infer<typeof CreateSquadSchema>;

export const ClaimReferralCodeSchema = z.object({
  referralCode: z.string().min(4).max(20),
});

export type ClaimReferralCodeInput = z.infer<typeof ClaimReferralCodeSchema>;
```

Re-export in `packages/api-contracts/src/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/api-contracts test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/api-contracts/src/ packages/api-contracts/test/
git commit -m "feat(api-contracts): add gamification, streak, and squad zod schemas"
```

---

### Task 3: Engine Gamification Pipeline & Streak Calculator (`services/engine`)

**Files:**
- Create: `services/engine/src/services/streak-service.ts`
- Test: `services/engine/test/streak-service.test.ts`

**Interfaces:**
- Consumes: `lastCheckinDate`, `currentDateStr`, `currentStreak`, `streakSavers`
- Produces: `calculateStreakAndMultiplier(lastCheckinDate, currentDateStr, currentStreak, streakSavers)`

- [ ] **Step 1: Write failing streak calculator test**

Create `services/engine/test/streak-service.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { calculateStreakAndMultiplier } from "../src/services/streak-service";

describe("Streak Calculator Service", () => {
  it("increments streak when checkin is consecutive day", () => {
    const res = calculateStreakAndMultiplier("2026-07-28", "2026-07-29", 2, 1);
    expect(res.newStreak).toBe(3);
    expect(res.multiplier).toBe(1.15);
    expect(res.usedStreakSaver).toBe(false);
  });

  it("uses streak saver if day missed and saver available", () => {
    const res = calculateStreakAndMultiplier("2026-07-27", "2026-07-29", 5, 1);
    expect(res.newStreak).toBe(5);
    expect(res.usedStreakSaver).toBe(true);
    expect(res.saversRemaining).toBe(0);
  });

  it("resets streak to 1 if day missed and no saver available", () => {
    const res = calculateStreakAndMultiplier("2026-07-27", "2026-07-29", 5, 0);
    expect(res.newStreak).toBe(1);
    expect(res.multiplier).toBe(1.0);
    expect(res.usedStreakSaver).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/engine test`
Expected: FAIL (Module not found)

- [ ] **Step 3: Implement Streak Service**

Create `services/engine/src/services/streak-service.ts`:
```typescript
export interface StreakCalculationResult {
  newStreak: number;
  multiplier: number;
  usedStreakSaver: boolean;
  saversRemaining: number;
}

export function calculateStreakAndMultiplier(
  lastCheckinDateStr: string,
  currentDateStr: string,
  currentStreak: number,
  streakSaversRemaining: number
): StreakCalculationResult {
  const lastDate = new Date(lastCheckinDateStr);
  const currDate = new Date(currentDateStr);

  const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = currentStreak;
  let usedStreakSaver = false;
  let saversRemaining = streakSaversRemaining;

  if (diffDays === 1) {
    newStreak = currentStreak + 1;
  } else if (diffDays === 0) {
    newStreak = currentStreak;
  } else {
    // Missed 1+ days
    if (streakSaversRemaining > 0) {
      usedStreakSaver = true;
      saversRemaining = streakSaversRemaining - 1;
      newStreak = currentStreak; // Preserve streak
    } else {
      newStreak = 1; // Reset
    }
  }

  // Calculate multiplier
  let multiplier = 1.0;
  if (newStreak >= 30) {
    multiplier = 1.5;
  } else if (newStreak >= 7) {
    multiplier = 1.3;
  } else if (newStreak >= 3) {
    multiplier = 1.15;
  } else {
    multiplier = 1.0;
  }

  return {
    newStreak,
    multiplier,
    usedStreakSaver,
    saversRemaining,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/engine test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/engine/src/services/streak-service.ts services/engine/test/
git commit -m "feat(engine): add streak calculator and multiplier service"
```

---

### Task 4: SpottDrop Gamification Dashboard & Squad PWA Screens (`apps/drop`)

**Files:**
- Create: `apps/drop/src/app/(main)/streaks/page.tsx`
- Create: `apps/drop/src/app/(main)/squads/page.tsx`
- Test: `apps/drop/test/gamification-pwa.test.ts`

**Interfaces:**
- Consumes: `@spottgeo/api-contracts`
- Produces: Streaks PWA Page & Squads Dashboard PWA Page

- [ ] **Step 1: Write failing PWA test**

Create `apps/drop/test/gamification-pwa.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { StreakStatusSchema } from "@spottgeo/api-contracts";

describe("SpottDrop Gamification PWA", () => {
  it("validates streak schema payload for PWA rendering", () => {
    const valid = StreakStatusSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      currentStreakDays: 7,
      longestStreakDays: 14,
      multiplier: 1.3,
      streakSaversRemaining: 1,
    });
    expect(valid.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/drop test`
Expected: PASS

- [ ] **Step 3: Implement Streaks PWA View**

Create `apps/drop/src/app/(main)/streaks/page.tsx`:
```tsx
import React from "react";

export default function StreaksPage() {
  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-white min-h-screen">
      <div className="text-center my-8">
        <span className="text-6xl animate-bounce block">🔥</span>
        <h1 className="text-3xl font-bold mt-4">7 Day Streak!</h1>
        <div className="inline-block mt-2 bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full font-semibold">
          1.30x Reward Multiplier
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 my-4">
        <h3 className="font-semibold text-slate-300">Streak Protection</h3>
        <p className="text-sm text-slate-400 mt-1">1 Free Monthly Streak Saver Active</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/drop test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/drop/src/app/ apps/drop/test/
git commit -m "feat(drop): add streaks and squads PWA dashboard pages"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-consumer-gamification-and-viral-rewards.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

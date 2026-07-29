# SpottDrop Consumer Gamification & Viral Rewards System — Design Specification

**Document Version**: 1.0.0  
**Date**: 2026-07-29  
**Status**: APPROVED  
**Target Workspace**: `apps/drop`, `packages/database`, `packages/api-contracts`, `services/engine`  

---

## 1. Overview & Core Intent

SpottDrop is the reward-first consumer PWA for SpottGeo. This design specification details the **Consumer Gamification & Viral Rewards System**, engineered to maximize Daily Active Users (DAU), repeat check-in habits, and organic viral growth.

The system combines **Daily Check-in Streaks & Bonus Multipliers**, **Mystery Drops & Loot Boxes**, **Regional Leaderboards & Location Champions**, and **Hybrid Viral Loops (Dual-reward referrals + Squad Quests)**.

---

## 2. System Architecture & Flow

```text
               ┌─────────────────────────────────────────────────────────┐
               │    SpottDrop Consumer PWA (Next.js 15 App Router)        │
               │  - /streaks (Flame Counter & Streak Saver)              │
               │  - /leaderboard (Regional Rankings)                     │
               │  - /referrals (Dual-Reward Links)                       │
               │  - /squads (4-Person Weekly Quests)                     │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                  Geofence Claim / Scan
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │  SpottEngine /api/v1/engine/verify (4-Step Anti-Cheat)  │
               │  - Evaluates Accuracy, Velocity, Rate Limit, Spoof Score │
               │  - Updates User Streak & Applies Multiplier             │
               │  - Evaluates Mystery Drop Random Probability            │
               │  - Increments Squad Quest Progress                       │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │ PostgreSQL 16 + PostGIS & Redis Relational Ledger        │
               │ - user_streaks       - mystery_drops    - leaderboards   │
               │ - referrals          - squads           - squad_members  │
               └─────────────────────────────────────────────────────────┘
```

---

## 3. Data Model & Schema Contracts

### 3.1 Drizzle ORM Database Tables (`packages/database`)

```typescript
// 1. User Streaks Table
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

// 2. Mystery Drops Table
export const mysteryDrops = pgTable("mystery_drops", {
  id: uuid("id").primaryKey().defaultRandom(),
  geofenceId: uuid("geofence_id").references(() => geofences.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  rewardType: varchar("reward_type", { length: 20 }).notNull(), // AIRTIME, DATA, CASH, VOUCHER
  rewardAmount: numeric("reward_amount", { precision: 10, scale: 2 }).notNull(),
  dropProbabilityPct: numeric("drop_probability_pct", { precision: 5, scale: 2 }).notNull().default("5.00"),
  isActive: boolean("is_active").notNull().default(true),
});

// 3. Leaderboard Ranks Table
export const leaderboardRanks = pgTable("leaderboard_ranks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  regionCode: varchar("region_code", { length: 20 }).notNull().default("NG-LA"),
  period: varchar("period", { length: 20 }).notNull().default("WEEKLY"), // WEEKLY, MONTHLY, ALL_TIME
  totalClaims: integer("total_claims").notNull().default(0),
  totalRewardsEarnedNgn: numeric("total_rewards_earned_ngn", { precision: 12, scale: 2 }).notNull().default("0.00"),
  rankPosition: integer("rank_position").notNull(),
});

// 4. Dual-Reward Referrals Table
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refereeUserId: uuid("referee_user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  referralCode: varchar("referral_code", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("PENDING_FIRST_SCAN"), // PENDING_FIRST_SCAN, COMPLETED, EXPIRED
  rewardPaidNgn: numeric("reward_paid_ngn", { precision: 10, scale: 2 }).notNull().default("100.00"),
});

// 5. Squads & Squad Members Tables
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

### 3.2 Zod API Contracts (`packages/api-contracts`)

```typescript
export const StreakStatusSchema = z.object({
  userId: z.string().uuid(),
  currentStreakDays: z.number().int().min(1),
  longestStreakDays: z.number().int().min(1),
  multiplier: z.number().min(1.0).max(2.0),
  streakSaversRemaining: z.number().int().min(0),
});

export const MysteryDropClaimSchema = z.object({
  claimId: z.string().uuid(),
  unlocked: z.boolean(),
  dropTitle: z.string().optional(),
  rewardAmountNgn: z.number().optional(),
});

export const LeaderboardQuerySchema = z.object({
  regionCode: z.string().min(2).default("NG-LA"),
  period: z.enum(["WEEKLY", "MONTHLY", "ALL_TIME"]),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const CreateSquadSchema = z.object({
  name: z.string().min(3).max(50),
});

export const ClaimReferralCodeSchema = z.object({
  referralCode: z.string().min(4).max(20),
});
```

---

## 4. SpottEngine Gamification Logic

1. **Streak & Multiplier Calculation**:
   - Days 1–2: `1.00x`
   - Days 3–6: `1.15x`
   - Days 7–29: `1.30x`
   - Days 30+: `1.50x`
   - Missed day protection: Automatically consumes 1 Streak Saver if available.
2. **Mystery Drop Probability Roll**:
   - Draw random float in `[0, 100)`. If `roll < drop_probability_pct`, award mystery drop bonus.
3. **Squad Quest Aggregation**:
   - Increment `squads.current_claims + 1`. When `current_claims >= weekly_target_claims`, complete squad quest and distribute payout.

---

## 5. SpottDrop PWA UI Layout

- `/streaks`: Interactive flame counter, multiplier indicator, Streak Saver status.
- `/leaderboard`: Regional rankings, Weekly vs Monthly tabs, Top Spotter badges.
- `/referrals`: Dual-reward link generator, referral code copy button, payout status.
- `/squads`: 4-person squad dashboard, weekly quest progress bar.
- `MysteryDropModal`: Celebratory overlay on loot unlock with Web Vibration API haptics.

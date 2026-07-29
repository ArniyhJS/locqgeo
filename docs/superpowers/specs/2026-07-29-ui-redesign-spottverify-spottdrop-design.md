# UI Redesign Design Specification — SpottVerify & SpottDrop PWAs

## Overview

A comprehensive UI redesign for **SpottVerify** (`apps/verify`) and **SpottDrop** (`apps/drop`) PWAs using a **Cyber-Gamified Dark Mode** design system. Features deep obsidian slate backgrounds, glowing electric cyan and neon amber gradients, glassmorphism backdrop-blur containers, smooth micro-animations, and responsive mobile-first layouts.

---

## 1. Design System & CSS Tokens

### Palette
- Background Obsidian: `#0A0D14`
- Surface Glass: `rgba(18, 24, 38, 0.7)` with `backdrop-filter: blur(16px)` & `border: 1px solid rgba(255, 255, 255, 0.08)`
- Electric Cyan (Primary / Radar): `#00F2FE` → `#4FACFE`
- Neon Amber (Gamification / Streaks): `#FF9F43` → `#FF5252`
- Emerald Green (Verified / Success): `#00E676`
- Crimson Red (Rejection / Warning): `#FF1744`

### Typography & Motion
- Fonts: **Outfit** (display headers & metric numbers) and **Inter** (UI body copy)
- Keyframe animations: `radar-ping`, `flame-flicker`, `card-glow-hover`, `shimmer-progress`

---

## 2. SpottVerify UI Components (`apps/verify`)

### Components & Routes
1. **`app/scan/page.tsx` & `components/RadarScanner.tsx`**:
   - 3D circular radar grid with concentric animated scan waves (`radar-ping`).
   - Dynamic user GPS location pin with accuracy radius indicator scaling to `accuracyMeters`.
   - Floating glassmorphic telemetry header displaying accuracy `±X.Xm`, 4-bar GPS signal strength indicator, and residential IP status.
   - Primary glassmorphic CTA button `"VERIFY PRESENCE AT LOCATION"`.
2. **`components/VerificationFeedbackDrawer.tsx`**:
   - Slide-up glass drawer displaying verification results.
   - Green emerald checkmark badge + reward amount for `VERIFIED` check-ins.
   - Red warning card with telemetry breakdown for `REJECTED_SPOOF` or `REJECTED_OUT_OF_BOUNDS`.
3. **`app/history/page.tsx` & `components/VerificationHistory.tsx`**:
   - Interactive history timeline with status badges (`VERIFIED`, `VERIFIED_FLAGGED`, `REJECTED_SPOOF`), PostGIS distance deltas, and timestamp cards.

---

## 3. SpottDrop UI Components (`apps/drop`)

### Components & Routes
1. **`src/app/(main)/streaks/page.tsx` & `components/StreakHero.tsx`**:
   - Hero flame counter card with `flame-flicker` animation (`🔥 14-Day Streak`).
   - Radial multiplier gauge (`1.3x Multiplier`) with active Streak Saver shield pill (`🛡️ 1 Streak Saver Active`).
   - Rolling 7-day calendar history grid with status badges.
2. **`src/app/(main)/squads/page.tsx` & `components/SquadQuestCard.tsx`**:
   - Cyber-glass squad banner with member avatars stack.
   - Animated squad milestone progress bar with `shimmer-progress` fill animation (`85/100 Geofence Check-ins`).
   - Ranked squad contribution leaderboard.
3. **`components/MysteryDropModal.tsx`**:
   - 3D glass gift box card trigger with interactive card flip reveal modal (`🎁 ₦500 Wallet Credit + 2x Multiplier Boost`).

---

## 4. Testing & Quality Standards

- All components must pass TypeScript strict check (`pnpm --filter @spottgeo/verify check-types`, `pnpm --filter @spottgeo/drop check-types`).
- Component unit tests in `apps/verify/test/` and `apps/drop/test/` verifying render structure and props.
- Full monorepo validation via `pnpm run test` and `pnpm run check-types`.

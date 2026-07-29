# SpottVerify & SpottDrop UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a state-of-the-art Cyber-Gamified Dark Mode redesign across `apps/verify` (Location Verification PWA) and `apps/drop` (Gamification Rewards PWA), including live 3D GPS radar scan animations, telemetry signal gauges, feedback drawers, dynamic flame streak counters, squad quest progress cards, and 3D mystery drop unboxing modals.

**Architecture:**
- `apps/verify`: Next.js 15 PWA with `RadarScanner.tsx`, `VerificationFeedbackDrawer.tsx`, `VerificationHistory.tsx`, and `/scan` & `/history` routes.
- `apps/drop`: Next.js 15 PWA with `StreakHero.tsx`, `SquadQuestCard.tsx`, `MysteryDropModal.tsx`, and `/streaks` & `/squads` routes.
- Design System: Custom Tailwind/Vanilla CSS tokens, frosted glassmorphism utilities (`backdrop-filter: blur(16px)`), electric cyan `#00F2FE` & neon amber `#FF9F43` gradient accents, and keyframe animations (`radar-ping`, `flame-flicker`, `shimmer-progress`).

**Tech Stack:** TypeScript 5.9, Next.js 15, React 19, Tailwind CSS / Vanilla CSS, Vitest 4.

## Global Constraints
- Background color MUST be Obsidian Dark (`#0A0D14`).
- All glass cards MUST use `backdrop-filter: blur(16px)` with subtle 1px border (`rgba(255, 255, 255, 0.08)`).
- All tests run with `pnpm --filter @spottgeo/verify test` and `pnpm --filter @spottgeo/drop test`.
- All type checks run with `pnpm --filter @spottgeo/verify check-types` and `pnpm --filter @spottgeo/drop check-types`.

---

### Task 1: Cyber-Gamified CSS Design System & Global Styles (`apps/verify`, `apps/drop`)

**Files:**
- Modify: `apps/verify/app/globals.css`
- Modify: `apps/drop/src/app/globals.css`
- Test: `apps/verify/test/design-system.test.ts`
- Test: `apps/drop/test/design-system.test.ts`

**Interfaces:**
- Produces: CSS utility classes (`.glass-card`, `.gradient-text-cyan`, `.gradient-text-amber`, `.radar-ping`, `.flame-flicker`, `.shimmer-progress`)

- [ ] **Step 1: Write failing design system test for verify**

Create `apps/verify/test/design-system.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Verify App Design System", () => {
  it("contains cyber-gamified CSS variables and keyframes", () => {
    const cssPath = path.join(__dirname, "../app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("#0A0D14");
    expect(cssContent).toContain("radar-ping");
    expect(cssContent).toContain("glass-card");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/verify test`
Expected: FAIL (missing CSS tokens)

- [ ] **Step 3: Implement CSS Design System in apps/verify**

Update `apps/verify/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --bg-obsidian: #0A0D14;
  --cyan-primary: #00F2FE;
  --cyan-secondary: #4FACFE;
  --amber-primary: #FF9F43;
  --amber-secondary: #FF5252;
  --emerald-success: #00E676;
  --crimson-alert: #FF1744;
}

body {
  background-color: var(--bg-obsidian);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

.glass-card {
  background: rgba(18, 24, 38, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}

.gradient-text-cyan {
  background: linear-gradient(135deg, var(--cyan-primary), var(--cyan-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-amber {
  background: linear-gradient(135deg, var(--amber-primary), var(--amber-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes radar-ping {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.animate-radar-ping {
  animation: radar-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes flame-flicker {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(255, 159, 67, 0.6)); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 16px rgba(255, 82, 82, 0.9)); }
}

.animate-flame-flicker {
  animation: flame-flicker 1.8s ease-in-out infinite;
}

@keyframes shimmer-progress {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, #FF9F43 0%, #FF5252 50%, #FF9F43 100%);
  background-size: 200% 100%;
  animation: shimmer-progress 2s linear infinite;
}
```

- [ ] **Step 4: Copy & apply design system in apps/drop**

Create `apps/drop/src/app/globals.css` with matching CSS variables and keyframes.
Create `apps/drop/test/design-system.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Drop App Design System", () => {
  it("contains cyber-gamified CSS variables and keyframes", () => {
    const cssPath = path.join(__dirname, "../src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    expect(cssContent).toContain("#0A0D14");
    expect(cssContent).toContain("flame-flicker");
    expect(cssContent).toContain("glass-card");
  });
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @spottgeo/verify test`
Run: `pnpm --filter @spottgeo/drop test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/verify/app/globals.css apps/verify/test/ apps/drop/src/app/globals.css apps/drop/test/
git commit -m "style: add cyber-gamified dark mode design system and keyframe animations to verify and drop"
```

---

### Task 2: SpottVerify GPS Radar Scanner & Telemetry UI (`apps/verify`)

**Files:**
- Create: `apps/verify/components/RadarScanner.tsx`
- Create: `apps/verify/components/VerificationFeedbackDrawer.tsx`
- Create: `apps/verify/components/VerificationHistory.tsx`
- Modify: `apps/verify/app/page.tsx`
- Modify: `apps/verify/app/scan/page.tsx`
- Modify: `apps/verify/app/history/page.tsx`
- Test: `apps/verify/test/ui-verify.test.ts`

**Interfaces:**
- Consumes: `@spottgeo/api-contracts` verification schemas
- Produces: `RadarScanner`, `VerificationFeedbackDrawer`, `VerificationHistory` React components

- [ ] **Step 1: Write failing UI test for verify components**

Create `apps/verify/test/ui-verify.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { RadarScanner } from "../components/RadarScanner";
import { VerificationFeedbackDrawer } from "../components/VerificationFeedbackDrawer";
import { VerificationHistory } from "../components/VerificationHistory";

describe("SpottVerify UI Components", () => {
  it("exports valid RadarScanner React component", () => {
    expect(RadarScanner).toBeDefined();
  });

  it("exports valid VerificationFeedbackDrawer React component", () => {
    expect(VerificationFeedbackDrawer).toBeDefined();
  });

  it("exports valid VerificationHistory React component", () => {
    expect(VerificationHistory).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/verify test`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement RadarScanner component**

Create `apps/verify/components/RadarScanner.tsx`:
```tsx
"use client";

import React, { useState } from "react";

interface RadarScannerProps {
  accuracyMeters?: number;
  ipStatus?: string;
  onVerify?: () => void;
  isVerifying?: boolean;
}

export function RadarScanner({
  accuracyMeters = 4.2,
  ipStatus = "Residential Clean",
  onVerify,
  isVerifying = false,
}: RadarScannerProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[80vh] p-6 text-white">
      {/* Top Floating Telemetry Pill */}
      <div className="glass-card px-4 py-2 flex items-center gap-4 text-xs font-medium tracking-wide">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
          <span className="text-gray-300">GPS:</span>
          <span className="font-mono text-[#00F2FE]">±{accuracyMeters.toFixed(1)}m</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1">
          <span className="text-gray-300">IP:</span>
          <span className="text-gray-200">{ipStatus}</span>
        </div>
      </div>

      {/* Center 3D Pulsing Radar Grid */}
      <div className="relative w-72 h-72 flex items-center justify-center my-8">
        <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20" />
        <div className="absolute inset-8 rounded-full border border-[#00F2FE]/30" />
        <div className="absolute inset-16 rounded-full border border-[#00F2FE]/40" />
        
        {/* Radar Animated Waves */}
        <div className="absolute inset-0 rounded-full border border-[#00F2FE] animate-radar-ping pointer-events-none" />
        
        {/* Center User Location Pin */}
        <div className="relative z-10 w-6 h-6 rounded-full bg-[#00F2FE] shadow-[0_0_20px_#00F2FE] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
        </div>
      </div>

      {/* Bottom CTA Button */}
      <button
        onClick={onVerify}
        disabled={isVerifying}
        className="w-full max-w-sm py-4 px-6 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all duration-300 glass-card border-[#00F2FE]/40 hover:border-[#00F2FE] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] text-[#00F2FE] active:scale-95 disabled:opacity-50"
      >
        {isVerifying ? "Verifying Presence..." : "Verify Presence at Location"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement Feedback Drawer and History components**

Create `apps/verify/components/VerificationFeedbackDrawer.tsx`:
```tsx
"use client";

import React from "react";

interface VerificationFeedbackDrawerProps {
  isOpen: boolean;
  status: "VERIFIED" | "REJECTED_SPOOF" | "REJECTED_OUT_OF_BOUNDS";
  rewardAmount?: string;
  onClose: () => void;
}

export function VerificationFeedbackDrawer({
  isOpen,
  status,
  rewardAmount = "₦150",
  onClose,
}: VerificationFeedbackDrawerProps) {
  if (!isOpen) return null;

  const isSuccess = status === "VERIFIED";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-6 glass-card border-t border-white/20 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isSuccess ? "bg-[#00E676]/20 text-[#00E676] shadow-[0_0_20px_#00E676]" : "bg-[#FF1744]/20 text-[#FF1744] shadow-[0_0_20px_#FF1744]"}`}>
          {isSuccess ? "✓" : "✕"}
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {isSuccess ? "Presence Verified!" : "Verification Failed"}
        </h3>
        <p className="text-xs text-gray-400">
          {isSuccess
            ? `Successfully checked into geofence target. Reward credited: ${rewardAmount}`
            : "Location telemetry flagged high risk score or out-of-bounds position."}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl glass-card text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

Create `apps/verify/components/VerificationHistory.tsx`:
```tsx
"use client";

import React from "react";

export interface VerificationItem {
  id: string;
  status: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF";
  distanceMeters: number;
  timestamp: string;
}

export function VerificationHistory({ items }: { items: VerificationItem[] }) {
  return (
    <div className="space-y-3 p-4">
      {items.map((item) => (
        <div key={item.id} className="glass-card p-4 flex items-center justify-between text-sm">
          <div>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${item.status === "VERIFIED" ? "bg-[#00E676]/20 text-[#00E676]" : item.status === "VERIFIED_FLAGGED" ? "bg-[#FF9F43]/20 text-[#FF9F43]" : "bg-[#FF1744]/20 text-[#FF1744]"}`}>
              {item.status}
            </span>
            <div className="text-xs text-gray-400 mt-1">{item.timestamp}</div>
          </div>
          <div className="text-xs font-mono text-gray-300">
            {item.distanceMeters.toFixed(1)}m delta
          </div>
        </div>
      ))}
    </div>
  );
}
```

Update `/app/scan/page.tsx` and `/app/history/page.tsx` to render these components.

- [ ] **Step 5: Run tests & type checks to verify pass**

Run: `pnpm --filter @spottgeo/verify test`
Run: `pnpm --filter @spottgeo/verify check-types`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/verify/components/ apps/verify/app/ apps/verify/test/
git commit -m "feat(verify): add 3D radar scanner, feedback drawer, and history timeline components"
```

---

### Task 3: SpottDrop Cyber-Gamification & Mystery Drop Modal (`apps/drop`)

**Files:**
- Create: `apps/drop/components/StreakHero.tsx`
- Create: `apps/drop/components/SquadQuestCard.tsx`
- Create: `apps/drop/components/MysteryDropModal.tsx`
- Modify: `apps/drop/src/app/(main)/streaks/page.tsx`
- Modify: `apps/drop/src/app/(main)/squads/page.tsx`
- Test: `apps/drop/test/ui-drop.test.ts`

**Interfaces:**
- Consumes: `@spottgeo/api-contracts` gamification schemas
- Produces: `StreakHero`, `SquadQuestCard`, `MysteryDropModal` React components

- [ ] **Step 1: Write failing UI test for drop components**

Create `apps/drop/test/ui-drop.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { StreakHero } from "../components/StreakHero";
import { SquadQuestCard } from "../components/SquadQuestCard";
import { MysteryDropModal } from "../components/MysteryDropModal";

describe("SpottDrop UI Components", () => {
  it("exports valid StreakHero React component", () => {
    expect(StreakHero).toBeDefined();
  });

  it("exports valid SquadQuestCard React component", () => {
    expect(SquadQuestCard).toBeDefined();
  });

  it("exports valid MysteryDropModal React component", () => {
    expect(MysteryDropModal).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/drop test`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement StreakHero component**

Create `apps/drop/components/StreakHero.tsx`:
```tsx
"use client";

import React from "react";

interface StreakHeroProps {
  currentStreak: number;
  multiplier: number;
  streakSavers: number;
}

export function StreakHero({
  currentStreak = 14,
  multiplier = 1.3,
  streakSavers = 1,
}: StreakHeroProps) {
  return (
    <div className="glass-card p-6 space-y-6 text-white text-center">
      {/* Flame Counter Header */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-5xl animate-flame-flicker">🔥</div>
        <div className="text-4xl font-extrabold font-mono gradient-text-amber">
          {currentStreak}-Day Streak
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-widest">
          Check-in daily to escalate multiplier
        </div>
      </div>

      {/* Multiplier & Shield Status Badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="glass-card px-4 py-2 border-[#FF9F43]/40 flex items-center gap-2 text-xs">
          <span className="text-[#FF9F43] font-bold">{multiplier.toFixed(1)}x</span>
          <span className="text-gray-400">Multiplier Tier</span>
        </div>
        <div className="glass-card px-4 py-2 border-[#00F2FE]/40 flex items-center gap-2 text-xs">
          <span>🛡️</span>
          <span className="text-[#00F2FE] font-bold">{streakSavers}</span>
          <span className="text-gray-400">Saver Active</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement SquadQuestCard and MysteryDropModal components**

Create `apps/drop/components/SquadQuestCard.tsx`:
```tsx
"use client";

import React from "react";

interface SquadQuestCardProps {
  squadName: string;
  currentPings: number;
  targetPings: number;
}

export function SquadQuestCard({
  squadName = "GeoHunters Lagos",
  currentPings = 85,
  targetPings = 100,
}: SquadQuestCardProps) {
  const percentage = Math.min(100, Math.round((currentPings / targetPings) * 100));

  return (
    <div className="glass-card p-6 space-y-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{squadName}</h3>
          <p className="text-xs text-gray-400">Weekly Geofence Quest</p>
        </div>
        <span className="text-xs font-mono font-bold text-[#FF9F43]">
          {currentPings}/{targetPings} Pings
        </span>
      </div>

      {/* Animated Shimmer Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full animate-shimmer transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

Create `apps/drop/components/MysteryDropModal.tsx`:
```tsx
"use client";

import React, { useState } from "react";

export function MysteryDropModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isUnboxed, setIsUnboxed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card p-8 max-w-sm w-full text-center space-y-6 border-[#FF9F43]/40 shadow-[0_0_30px_rgba(255,159,67,0.3)]">
        <div className="text-6xl cursor-pointer hover:scale-110 transition-transform duration-300" onClick={() => setIsUnboxed(true)}>
          {isUnboxed ? "🎁" : "📦"}
        </div>
        <h3 className="text-xl font-bold gradient-text-amber">
          {isUnboxed ? "Unboxed Reward!" : "Mystery Drop Ready"}
        </h3>
        <p className="text-xs text-gray-300">
          {isUnboxed
            ? "Congratulations! You won ₦500 Wallet Credit + 2x Multiplier Boost."
            : "Tap the drop box to reveal your instant gamified check-in reward."}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl glass-card text-xs font-bold uppercase tracking-wider text-[#FF9F43] hover:bg-white/10"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

Update `/src/app/(main)/streaks/page.tsx` and `/src/app/(main)/squads/page.tsx` to render these components.

- [ ] **Step 5: Run tests & type checks to verify pass**

Run: `pnpm --filter @spottgeo/drop test`
Run: `pnpm --filter @spottgeo/drop check-types`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/drop/components/ apps/drop/src/app/ apps/drop/test/
git commit -m "feat(drop): add streak hero, squad quest progress card, and mystery drop modal components"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-ui-redesign-spottverify-spottdrop.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

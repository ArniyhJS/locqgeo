# LocqGeo UI/UX Design System Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified modern design system with full Light & Dark mode support, WCAG 2.2 AA accessibility, and tactile UI/UX affordance across LocqConsole, LocqDrop, and LocqVerify.

**Architecture:** A semantic CSS design token layer (Tailwind CSS custom variables) managed by `next-themes` with zero-flash SSR hydration, paired with accessible UI primitives (Button, Card, Badge, Skeleton, EmptyState, ThemeToggle) and application-level layout & page overhauls.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, `next-themes`, `lucide-react`, React 19, Vitest.

## Global Constraints
- Every interactive element must have a visible 2px focus ring on keyboard navigation (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- Every button must include a tactile active state (`active:scale-[0.98]`).
- Minimum touch target size of 48x48px on mobile views for LocqDrop and LocqVerify.
- Full Light and Dark mode parity with WCAG 2.2 AA contrast ratios (minimum 4.5:1 for normal text).
- 0 TypeScript errors (`pnpm check-types`), 0 lint warnings (`pnpm lint`), 100% test pass rate (`pnpm test`), and clean compilation (`pnpm build`).

---

### Task 1: Theme Engine Foundation & Semantic CSS Tokens

**Files:**
- Create: `apps/console/components/theme/ThemeProvider.tsx`
- Create: `apps/console/components/theme/ThemeToggle.tsx`
- Create: `apps/drop/components/theme/ThemeProvider.tsx`
- Create: `apps/drop/components/theme/ThemeToggle.tsx`
- Create: `apps/verify/components/theme/ThemeProvider.tsx`
- Create: `apps/verify/components/theme/ThemeToggle.tsx`
- Modify: `apps/console/package.json`
- Modify: `apps/drop/package.json`
- Modify: `apps/verify/package.json`
- Modify: `apps/console/app/globals.css`
- Modify: `apps/drop/app/globals.css`
- Modify: `apps/verify/app/globals.css`
- Modify: `apps/console/app/layout.tsx`
- Modify: `apps/drop/app/layout.tsx`
- Modify: `apps/verify/app/layout.tsx`
- Test: `apps/console/test/theme-toggle.test.ts`
- Test: `apps/drop/test/theme-toggle.test.ts`
- Test: `apps/verify/test/theme-toggle.test.ts`

**Interfaces:**
- Produces: `ThemeProvider({ children }: { children: React.ReactNode })`
- Produces: `ThemeToggle()` &mdash; renders interactive Sun / Moon / Monitor toggle button with accessible aria labels.

- [ ] **Step 1: Install `next-themes` and `lucide-react` across apps**

Run: `pnpm --filter @locqgeo/console add next-themes lucide-react && pnpm --filter @locqgeo/drop add next-themes lucide-react && pnpm --filter @locqgeo/verify add next-themes lucide-react`

- [ ] **Step 2: Write failing unit test for ThemeToggle**

```typescript
// apps/console/test/theme-toggle.test.ts
import { describe, expect, it } from "vitest";
import { ThemeToggle } from "../components/theme/ThemeToggle";

describe("ThemeToggle Component", () => {
  it("exports a valid React component function", () => {
    expect(ThemeToggle).toBeDefined();
    expect(typeof ThemeToggle).toBe("function");
  });
});
```

- [ ] **Step 3: Define semantic CSS tokens in `globals.css`**

Add light and dark CSS custom properties (`--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-subtle`, `--border-strong`, `--brand-primary`, `--status-success`, `--status-warning`, `--status-danger`, `--status-info`) with `@variant dark (&:where(.dark, .dark *));`.

- [ ] **Step 4: Create ThemeProvider and ThemeToggle components**

Implement `ThemeProvider` wrapping `next-themes/ThemeProvider` with `suppressHydrationWarning` and `ThemeToggle` with dropdown / cycle button.

- [ ] **Step 5: Run tests and verify they pass**

Run: `pnpm --filter @locqgeo/console test && pnpm --filter @locqgeo/drop test && pnpm --filter @locqgeo/verify test`

- [ ] **Step 6: Commit**

```bash
git add apps/ packages/ pnpm-lock.yaml
git commit -m "feat(theme): establish next-themes engine and semantic CSS tokens across apps"
```

---

### Task 2: Core Accessible UI Primitives

**Files:**
- Create: `apps/console/components/ui/Button.tsx`
- Create: `apps/console/components/ui/Card.tsx`
- Create: `apps/console/components/ui/Badge.tsx`
- Create: `apps/console/components/ui/Skeleton.tsx`
- Create: `apps/console/components/ui/EmptyState.tsx`
- Create: `apps/drop/components/ui/Button.tsx`
- Create: `apps/drop/components/ui/Badge.tsx`
- Create: `apps/verify/components/ui/Button.tsx`
- Create: `apps/verify/components/ui/Badge.tsx`
- Test: `apps/console/test/ui-primitives.test.ts`
- Test: `apps/drop/test/ui-primitives.test.ts`
- Test: `apps/verify/test/ui-primitives.test.ts`

**Interfaces:**
- Produces: `Button`: `{ variant?: 'primary'|'secondary'|'outline'|'ghost'|'danger', size?: 'sm'|'md'|'lg', loading?: boolean, icon?: React.ReactNode }`
- Produces: `Card`: `{ elevated?: boolean, interactive?: boolean, children: React.ReactNode }`
- Produces: `Badge`: `{ variant?: 'success'|'warning'|'danger'|'info'|'neutral', children: React.ReactNode }`
- Produces: `Skeleton`: `{ className?: string }`
- Produces: `EmptyState`: `{ icon?: React.ReactNode, title: string, description: string, action?: { label: string, onClick?: () => void, href?: string } }`

- [ ] **Step 1: Write failing test for UI primitives**

```typescript
// apps/console/test/ui-primitives.test.ts
import { describe, expect, it } from "vitest";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

describe("Console UI Primitives", () => {
  it("exports all core components", () => {
    expect(Button).toBeDefined();
    expect(Card).toBeDefined();
    expect(Badge).toBeDefined();
    expect(Skeleton).toBeDefined();
    expect(EmptyState).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement UI Primitives**

Create `Button.tsx` (with focus rings, active scale, loading spinner), `Card.tsx`, `Badge.tsx`, `Skeleton.tsx`, and `EmptyState.tsx`.

- [ ] **Step 3: Run tests and verify passes**

Run: `pnpm --filter @locqgeo/console test && pnpm --filter @locqgeo/drop test && pnpm --filter @locqgeo/verify test`

- [ ] **Step 4: Commit**

```bash
git add apps/
git commit -m "feat(ui): add accessible UI primitives with light/dark affordances"
```

---

### Task 3: LocqConsole Complete UI/UX Overhaul

**Files:**
- Modify: `apps/console/app/(dashboard)/layout.tsx`
- Modify: `apps/console/components/layout/ConsoleSidebar.tsx`
- Modify: `apps/console/app/(dashboard)/page.tsx` (KPI Dashboard)
- Modify: `apps/console/app/(dashboard)/nodes/page.tsx`
- Modify: `apps/console/app/(dashboard)/nodes/new/page.tsx`
- Modify: `apps/console/app/(dashboard)/nodes/bulk/page.tsx`
- Modify: `apps/console/app/(dashboard)/campaigns/page.tsx`
- Modify: `apps/console/app/(dashboard)/campaigns/new/page.tsx`
- Modify: `apps/console/app/(dashboard)/campaigns/[id]/page.tsx`
- Modify: `apps/console/components/campaigns/CampaignForm.tsx`
- Modify: `apps/console/app/(dashboard)/fraud/page.tsx`
- Modify: `apps/console/components/fraud/FraudClient.tsx`
- Modify: `apps/console/app/(dashboard)/telemetry/page.tsx`
- Modify: `apps/console/components/telemetry/TelemetryMap.tsx`
- Modify: `apps/console/components/telemetry/LiveStreamFeed.tsx`
- Modify: `apps/console/app/(dashboard)/billing/page.tsx`
- Modify: `apps/console/components/billing/BillingClient.tsx`
- Modify: `apps/console/app/(dashboard)/settings/api-keys/page.tsx`
- Modify: `apps/console/app/(dashboard)/settings/team/page.tsx`
- Modify: `apps/console/app/(dashboard)/users/page.tsx`
- Test: `apps/console/test/console-pages.test.ts`

- [ ] **Step 1: Write test for Console layout and page exports**
- [ ] **Step 2: Update Layout, Header, and ConsoleSidebar with ThemeToggle & active route styling**
- [ ] **Step 3: Update KPI Overview, Geofences (Nodes), and Campaigns with accessible tables & forms**
- [ ] **Step 4: Update Fraud Center, Live Telemetry Stream, Billing, and API Keys pages**
- [ ] **Step 5: Run tests and verify passes**

Run: `pnpm --filter @locqgeo/console test`

- [ ] **Step 6: Commit**

```bash
git add apps/console/
git commit -m "feat(console): overhaul LocqConsole UI with light/dark theme and high affordance"
```

---

### Task 4: LocqDrop Complete UI/UX Overhaul

**Files:**
- Modify: `apps/drop/app/page.tsx`
- Modify: `apps/drop/app/scan/page.tsx`
- Modify: `apps/drop/app/wallet/page.tsx`
- Modify: `apps/drop/components/RadarScanner.tsx`
- Modify: `apps/drop/components/StreakCounter.tsx`
- Modify: `apps/drop/components/MysteryDropModal.tsx`
- Modify: `apps/drop/components/wallet/VerificationCard.tsx`
- Create: `apps/drop/components/layout/BottomNav.tsx`
- Test: `apps/drop/test/gamification-pwa.test.ts`
- Test: `apps/drop/test/ui-drop.test.ts`

- [ ] **Step 1: Write updated tests for LocqDrop components**
- [ ] **Step 2: Update RadarScanner with daylight/night pulse contrast and GPS accuracy badge**
- [ ] **Step 3: Update StreakCounter, MysteryDropModal, and VerificationCard with light/dark surfaces**
- [ ] **Step 4: Add BottomNav with 48px touch targets and theme toggle**
- [ ] **Step 5: Run tests and verify passes**

Run: `pnpm --filter @locqgeo/drop test`

- [ ] **Step 6: Commit**

```bash
git add apps/drop/
git commit -m "feat(drop): overhaul LocqDrop PWA with light/dark radar and mobile affordance"
```

---

### Task 5: LocqVerify Complete UI/UX Overhaul

**Files:**
- Modify: `apps/verify/app/page.tsx`
- Modify: `apps/verify/app/scan/page.tsx`
- Modify: `apps/verify/app/history/page.tsx`
- Modify: `apps/verify/components/RadarScanner.tsx`
- Modify: `apps/verify/components/VerificationFeedbackDrawer.tsx`
- Modify: `apps/verify/components/VerificationHistory.tsx`
- Modify: `apps/verify/components/verification/VerificationResult.tsx`
- Create: `apps/verify/components/layout/BottomNav.tsx`
- Create: `apps/verify/components/OfflineSyncBanner.tsx`
- Test: `apps/verify/test/ui-verify.test.ts`

- [ ] **Step 1: Write updated tests for LocqVerify components**
- [ ] **Step 2: Update Verifier RadarScanner with tactile hold-to-verify state and sensor indicators**
- [ ] **Step 3: Update VerificationFeedbackDrawer and VerificationResult with clear animated status**
- [ ] **Step 4: Update VerificationHistory and add OfflineSyncBanner**
- [ ] **Step 5: Add BottomNav with 48px touch targets and theme toggle**
- [ ] **Step 6: Run tests and verify passes**

Run: `pnpm --filter @locqgeo/verify test`

- [ ] **Step 7: Commit**

```bash
git add apps/verify/
git commit -m "feat(verify): overhaul LocqVerify PWA with tactile verifier and feedback drawer"
```

---

### Task 6: Monorepo Quality Gates Verification

**Files:**
- None (Verification step across all workspaces)

- [ ] **Step 1: Run TypeScript type check across all 12 packages**
  Run: `pnpm check-types`
- [ ] **Step 2: Run ESLint across all 12 packages**
  Run: `pnpm lint`
- [ ] **Step 3: Run Vitest unit & integration test suites**
  Run: `pnpm test`
- [ ] **Step 4: Run production build across all Next.js apps and packages**
  Run: `pnpm build`

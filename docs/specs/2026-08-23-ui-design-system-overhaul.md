# LocqGeo Design System & UI/UX Overhaul Specification

**Date:** 2026-08-23  
**Status:** Approved  
**Scope:** `apps/console`, `apps/drop`, `apps/verify`, `packages/config`

---

## 1. Executive Summary

This specification establishes a modern, simplistic, accessible, and unified design system for the **LocqGeo** ecosystem. It introduces full **Light and Dark mode** support with zero-flash rendering across all three Next.js applications (**LocqConsole**, **LocqDrop**, and **LocqVerify**), enforces strict **WCAG 2.2 AA accessibility** standards, and upgrades UI/UX affordances across all interactive components.

---

## 2. Design Tokens & Color Architecture

### 2.1 Theme Palette: *Modern Precision Slate & Electric Indigo*

All surfaces, text colors, borders, and interactive accents are driven by semantic CSS custom properties defined in Tailwind CSS layers.

| Semantic Token | Light Mode Value | Dark Mode Value | Usage Rationale |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` (Slate-50) | `#090D16` (Deep Obsidian) | Main application background canvas |
| `--bg-surface` | `#FFFFFF` (Pure White) | `#111726` (Dark Slate) | Base card, container, and table background |
| `--bg-surface-elevated` | `#F1F5F9` (Slate-100) | `#1A2238` (Elevated Slate) | Hover states, modals, popovers, dropdowns |
| `--bg-surface-glass` | `rgba(255,255,255,0.85)`| `rgba(17,23,38,0.75)` | Glassmorphic floating bars, headers, drawers |
| `--border-subtle` | `#E2E8F0` (Slate-200) | `rgba(255,255,255,0.08)` | Hairline dividers, card outlines |
| `--border-strong` | `#CBD5E1` (Slate-300) | `rgba(255,255,255,0.18)` | Form input borders, active borders |
| `--brand-primary` | `#4F46E5` (Indigo-600) | `#6366F1` (Indigo-500) | Primary buttons, active nav, primary CTAs |
| `--brand-primary-hover` | `#4338CA` (Indigo-700) | `#4F46E5` (Indigo-600) | Hover state for primary actions |
| `--brand-primary-glow` | `rgba(79,70,229,0.2)` | `rgba(99,102,241,0.35)` | Radar glow, focused rings, ambient shadows |
| `--text-primary` | `#0F172A` (Slate-900) | `#F8FAFC` (Slate-50) | High-contrast headers, titles, primary labels |
| `--text-secondary` | `#475569` (Slate-600) | `#94A3B8` (Slate-400) | Subtitles, table body text, descriptions |
| `--text-muted` | `#94A3B8` (Slate-400) | `#64748B` (Slate-500) | Placeholders, timestamps, subtle meta |
| `--status-success` | `#059669` (Emerald-600) | `#10B981` (Emerald-500) | Verified presence, active status, reward claimed |
| `--status-warning` | `#D97706` (Amber-600) | `#F59E0B` (Amber-500) | Near boundary, budget threshold, warning |
| `--status-danger` | `#DC2626` (Rose-600) | `#F43F5E` (Rose-500) | Spoof detected, rejected verification, error |
| `--status-info` | `#0284C7` (Sky-600) | `#38BDF8` (Sky-400) | Informational tags, pending state, telemetry |

---

## 3. UI/UX Affordance Rules & Accessibility Standards

### 3.1 Affordance Hierarchy
1. **Interactive vs Non-Interactive Disambiguation**:
   - Non-interactive cards have a flat surface with hairline border (`1px solid var(--border-subtle)`).
   - Interactive cards include explicit hover lift (`translate-y-[-1px] shadow-md border-brand-primary/40 cursor-pointer`).
   - Clickable table rows feature clear hover background transitions (`hover:bg-slate-100/60 dark:hover:bg-slate-800/40`).

2. **Tactile Feedback & Press States**:
   - Buttons: `active:scale-[0.98] transition-transform duration-100 ease-out`.
   - Loading State: Disabled button with spinner animation, preserving exact button width to eliminate content jumping.
   - Disabled State: `opacity-50 cursor-not-allowed pointer-events-none aria-disabled="true"`.

3. **Focus & Keyboard Navigation (WCAG 2.2 AA)**:
   - All interactive controls feature visible focus rings on keyboard tab: `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none`.

4. **Forms & Input Affordances**:
   - Clear field labels with high contrast.
   - Distinct normal, hover, focused, and errored input borders.
   - Inline field error messages rendered in crimson with an icon and `aria-invalid="true"`.
   - Helper text rendered in secondary muted typography below inputs.

5. **Asynchronous Feedback & Empty States**:
   - Data loading: Pulsing skeleton placeholders with matching aspect ratio instead of raw blank screens.
   - Empty lists: Illustrated empty state component containing an informative title, description, and primary CTA button.

---

## 4. Theme Engine Architecture

### 4.1 `next-themes` Integration
- Add `next-themes` to `apps/console`, `apps/drop`, and `apps/verify`.
- Configure `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` in root layout of each app.
- Provide a unified `ThemeToggle` component supporting:
  - **Light Mode** (Sun Icon)
  - **Dark Mode** (Moon Icon)
  - **System Preference** (Monitor Icon)

---

## 5. Application-Specific Overhauls

### 5.1 LocqConsole (`apps/console`)
- **Top Header Bar**: Integrated `ThemeToggle`, real-time network status pill, tenant organization selector, and user avatar.
- **Sidebar Navigation**:
  - High-clarity active indicator with electric indigo background tint and crisp icon highlight.
  - Collapsible on smaller viewports with full mobile drawer support.
- **KPI Metrics Dashboard**:
  - Clean numeric displays with trend pills (`+14.2%` in green / `-3.1%` in red).
  - Micro sparkline indicators for 24h trendlines.
- **Node & Campaign Management**:
  - Filter and search bar with clear debounce and active filter count badge.
  - Interactive map view toggle (List vs Map) with high-visibility map pins and radius circles.
- **Telemetry Live Stream & Fraud Center**:
  - Color-coded risk meter (0–100 risk score: Green &lt; 30, Yellow 30–70, Red &gt; 70).
  - Clean animated event feed with pause/resume stream toggle and copyable device IDs.
- **Billing & API Keys**:
  - Float wallet balance card with instant Top-up modal.
  - Masked API key display with one-click copy and confirmation toast.

### 5.2 LocqDrop (`apps/drop`)
- **Theme-Adaptive Radar Scanner**:
  - Radar pulse animation that renders with sharp clarity in both daylight and night mode.
  - High-precision GPS accuracy badge (e.g. "GPS Accuracy: ±3m" with signal strength indicator).
- **Gamified Rewards & Streaks**:
  - Tactile streak counter badge with flame animation.
  - Mystery drop reward card with smooth flip and celebration confetti animation.
- **Redemption Wallet**:
  - Clean voucher cards with barcode/QR code expansion modal and one-tap copyable code (`LCQ-XXXXXX`).
- **Bottom Navigation**: Ergonomic thumb-friendly navigation bar with 48px touch targets.

### 5.3 LocqVerify (`apps/verify`)
- **Universal Presence Verifier View**:
  - Unambiguous "Hold to Verify" or "Tap to Verify" physical interaction button with tactile progress ring.
  - Explicit feedback on sensor availability (GPS, BLE Beacon, NFC, WiFi).
- **Verification Feedback Drawer**:
  - Instant full-screen or slide-up drawer with animated checkmark or error alert.
  - Plain-English failure explanation (e.g. "Device outside geofence boundary by 35 meters").
- **Offline Attendance Queue**:
  - Sticky banner showing number of cached verifications waiting for connection.
  - Automatic background sync when connectivity is restored.

---

## 6. Implementation Sequence

1. **Phase 1: Dependencies & Shared Theme Tokens**:
   - Install `next-themes` and `lucide-react` across `apps/console`, `apps/drop`, `apps/verify`.
   - Standardize `globals.css` with semantic CSS variables for Light and Dark modes.
   - Build reusable `ThemeProvider` and `ThemeToggle` components.

2. **Phase 2: Common UI Primitive Components**:
   - Build standard accessible primitives: `Button`, `Card`, `Badge`, `Input`, `Select`, `Skeleton`, `EmptyState`, `Modal`.

3. **Phase 3: LocqConsole Complete Overhaul**:
   - Update layout, sidebar, header, telemetry feed, KPI cards, tables, forms, and modals.

4. **Phase 4: LocqDrop Complete Overhaul**:
   - Update scan radar, streak counter, mystery drop modal, wallet vouchers, and navigation.

5. **Phase 5: LocqVerify Complete Overhaul**:
   - Update verifier trigger, feedback drawer, attendance history timeline, and offline sync banner.

6. **Phase 6: Quality Verification**:
   - Run type checks, lint checks, unit tests, and production build across all workspaces.

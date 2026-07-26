# SpottGeo Brand Marketing & UI Design System

This specification outlines the brand identity, marketing positioning, messaging hierarchy, visual design system, and UI component design tokens for the **SpottGeo Monorepo** ecosystem.

---

## 🌟 Brand Marketing Strategy & Identity

### 1. Brand Vision & Positioning
**SpottGeo** is the enterprise location-based rewards and physical presence verification infrastructure. 
Our mission is to **make physical presence measurable, rewardable, and fraud-proof** for billboards, retail stores, stadium check-ins, event attendance, and field workforce management.

- **Tagline**: *"Verifiable Physical Engagement at Scale"*
- **Core Value Proposition**: Transform physical-world advertising and attendance into cryptographic, instant-reward presence validation in sub-50ms.
- **Brand Personality**: High-Tech, Trustworthy, Precision-Engineered, Dynamic, Premium.

---

### 2. Product Brand Architecture

```
                                +-----------------------------------+
                                |            SpottGeo               |
                                |    Parent Platform Infrastructure |
                                +-----------------+-----------------+
                                                  |
              ┌───────────────────────────────────┼───────────────────────────────────┐
              │                                   │                                   │
              v                                   v                                   v
+---------------------------+       +---------------------------+       +---------------------------+
|       SpottConsole        |       |         SpottDrop         |       |        SpottVerify        |
|  Enterprise Control Plane |       |  Consumer Rewards PWA     |       | Standalone Check-In PWA   |
|                           |       |                           |       |                           |
| - Audience: B2B Operators |       | - Audience: Consumers     |       | - Audience: Attendees     |
| - Vibe: Command Center    |       | - Vibe: Gamified, Cyber   |       | - Vibe: Clean, Fast       |
| - Accent: Electric Blue   |       | - Accent: Neon Emerald    |       | - Accent: Royal Cobalt    |
+---------------------------+       +---------------------------+       +---------------------------+
```

---

## 🎨 UI Design System & Visual Tokens

The SpottGeo UI design system is built on **Dark Mode Glassmorphism**, vibrant curated gradients, and dynamic micro-animations.

### 1. Color Palette & Token System

```
                  +-------------------------------------------------------+
                  |                 GLOBAL DARK BACKGROUND                |
                  |                Deep Void: #080c14                     |
                  +-------------------------------------------------------+
```

#### Global Surface & Border Tokens
- **Background Void**: `#080c14`
- **Surface Elevation 1 (Card BG)**: `rgba(13, 19, 34, 0.75)`
- **Surface Elevation 2 (Hover BG)**: `rgba(24, 34, 56, 0.85)`
- **Glass Border**: `rgba(255, 255, 255, 0.08)`
- **Glass Border Hover**: `rgba(255, 255, 255, 0.20)`
- **Text Primary**: `#f9fafb` (Gray 50)
- **Text Secondary**: `#9ca3af` (Gray 400)
- **Text Muted**: `#6b7280` (Gray 500)

#### Product Brand Accent Palette

| Product Brand | Primary Accent | Secondary Accent | Glow / Drop Shadow | Gradient |
| :--- | :--- | :--- | :--- | :--- |
| **SpottGeo Core** | `#3b82f6` (Blue 500) | `#6366f1` (Indigo 500) | `rgba(59, 130, 246, 0.35)` | `linear-gradient(135deg, #3b82f6, #6366f1)` |
| **SpottConsole (B2B)** | `#2563eb` (Blue 600) | `#06b6d4` (Cyan 500) | `rgba(6, 182, 212, 0.30)` | `linear-gradient(135deg, #2563eb, #06b6d4)` |
| **SpottDrop (Consumer)** | `#10b981` (Emerald 500) | `#14b8a6` (Teal 500) | `rgba(16, 185, 129, 0.35)` | `linear-gradient(135deg, #10b981, #14b8a6)` |
| **SpottVerify (Field)** | `#3b82f6` (Blue 500) | `#0284c7` (Sky 600) | `rgba(59, 130, 246, 0.30)` | `linear-gradient(135deg, #3b82f6, #0284c7)` |

#### Status & Anti-Cheat Feedback Colors
- **Verified / Success**: `#10b981` (Emerald 500)
- **Queued / Processing**: `#f59e0b` (Amber 500)
- **Rejected / Fraud Flagged**: `#f43f5e` (Rose 500)
- **Suspicious / Warning**: `#fbbf24` (Amber 400)

---

### 2. Typography Hierarchy

SpottGeo utilizes modern system sans-serif font stacks (`Inter`, `system-ui`, `-apple-system`, `Roboto`).

```
Display Large   | 32px / 2.25rem | Bold (700)     | Tracking -0.025em | Main Headings
H1 Page Title   | 24px / 1.50rem | Bold (700)     | Tracking -0.020em | Section Headers
H2 Card Header  | 18px / 1.125rem| Semibold (600) | Tracking -0.015em | Module Titles
Body Standard   | 14px / 0.875rem| Regular (400)  | Line Height 1.5   | Content Body
Caption / Label | 12px / 0.75rem | Medium (500)   | Tracking +0.050em | Badges & Tables
Code / Coordinates| 13px / 0.812rem| Monospace      | Subpixel Antialiased| Lat/Lng & Hashes
```

---

### 3. Glassmorphic Component Library & Patterns

#### A. Glassmorphic Card (`.glass-card`)
```css
.glass-card {
  background: rgba(13, 19, 34, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.18);
}
```

#### B. Primary CTA Button (`.glass-button`)
```css
.glass-button {
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-radius: 14px;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.30);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.glass-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 28px rgba(16, 185, 129, 0.45);
}

.glass-button:active {
  transform: translateY(0);
}
```

#### C. Geolocation Radar Pulse Ring (`.pulse-ring`)
```css
.pulse-ring {
  position: relative;
}

.pulse-ring::before {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.6);
  animation: radar-sweep 2s infinite cubic-bezier(0, 0.2, 0.8, 1);
}

@keyframes radar-sweep {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
```

---

### 4. Accessibility & Micro-Interactions

1. **Focus States**: High-contrast focus rings (`focus:outline-none focus:ring-2 focus:ring-blue-500/50`).
2. **Contrast Ratios**: Minimum 4.5:1 text-to-background ratio on dark surfaces (WCAG 2.1 AA compliant).
3. **Responsive Breakpoints**:
   - Mobile PWA: `max-w-md` (375px – 430px centered viewport).
   - Desktop Dashboard: `min-w-[1280px]` responsive grid.

# LocqGeo Brand Identity & UI Design System

This specification defines the **Electric Cyber Orange & Obsidian Black** brand identity, marketing philosophy, and UI design system for all customer-facing applications across the **LocqGeo Monorepo** (`LocqConsole`, `LocqDrop`, `LocqVerify`).

---

## 🍊 Brand Strategy & Geofencing Philosophy

### 1. Brand Vision & Positioning

**LocqGeo** is the next-generation spatial infrastructure platform powering real-world presence verification and reward campaigns.

- **Brand Tagline**: _"Proof of Spatial Presence"_
- **Core Philosophy**: **Geofence-First Architecture**. Every interaction, verification ping, reward claim, and analytics metric is anchored in verified physical radiuses. Presence is not assumed—it is cryptographically and spatially proven within geofenced boundaries.
- **Visual & Brand Vibe**: High-Contrast Cyberpunk Glow, Futuristic, Precision-Engineered, Premium Obsidian & Electric Flame.

---

### 2. Unified Brand Palette: Cyber Orange & Obsidian Black

```
  +---------------------------------------------------------------------------------+
  |                            OBSIDIAN BLACK SURFACES                              |
  |                           Deep Void Base: #0B0C0E                               |
  +---------------------------------------------------------------------------------+
                                         |
                       VIBRANT ELECTRIC ORANGE ACCENTS
                           Primary Glow: #FF6B00
```

#### Global Surface & Obsidian Base Tokens

- **Obsidian Void (Page Base BG)**: `#0B0C0E`
- **Carbon Layer 1 (Card BG)**: `rgba(18, 20, 26, 0.85)`
- **Carbon Layer 2 (Hover BG)**: `rgba(28, 31, 42, 0.90)`
- **Obsidian Border (Default Glass)**: `rgba(255, 255, 255, 0.08)`
- **Cyber Orange Glass Border (Active/Hover)**: `rgba(255, 107, 0, 0.35)`
- **Text Primary**: `#FAFAFA` (Zinc 50)
- **Text Secondary**: `#A1A1AA` (Zinc 400)
- **Text Muted**: `#71717A` (Zinc 500)

#### Primary Brand Accent Palette

| Token Name                          | Hex Code                  | Purpose & Usage                                                                           |
| :---------------------------------- | :------------------------ | :---------------------------------------------------------------------------------------- |
| **Cyber Orange (Primary)**          | `#FF6B00`                 | Primary buttons, geofence radius rings, active nav items, brand logos                     |
| **Electric Blaze (Hover/Gradient)** | `#FF5500`                 | CTA hover states, high-priority alert badges, active ring borders                         |
| **Ember Gold (Gradient Secondary)** | `#FFA800`                 | Gradient pair for primary buttons (`linear-gradient(135deg, #FF6B00, #FFA800)`)           |
| **Orange Glow Shadow**              | `rgba(255, 107, 0, 0.30)` | Drop shadows, glow effects on radar pulse indicators & active cards                       |
| **Obsidian Black (Secondary Base)** | `#0B0C0E`                 | Background void for all customer-facing apps (`apps/console`, `apps/drop`, `apps/verify`) |

---

## 🎨 UI Design System Component Tokens

### 1. Glassmorphic Obsidian Card (`.glass-card` / `.pwa-card`)

```css
.glass-card {
  background: rgba(18, 20, 26, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.glass-card:hover {
  border-color: rgba(255, 107, 0, 0.35);
  box-shadow: 0 0 25px rgba(255, 107, 0, 0.12);
}
```

### 2. Electric Cyber Orange Button (`.glass-button`)

```css
.glass-button {
  background: linear-gradient(135deg, #ff6b00 0%, #ffa800 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  color: #0b0c0e; /* Obsidian contrast text for optimal readability */
  font-weight: 700;
  box-shadow: 0 0 20px rgba(255, 107, 0, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.glass-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 30px rgba(255, 107, 0, 0.55);
}

.glass-button:active {
  transform: translateY(0);
}
```

### 3. Geofence Spatial Radar Pulse Ring (`.pulse-ring`)

```css
.pulse-ring {
  position: relative;
}

.pulse-ring::before {
  content: "";
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 107, 0, 0.7);
  animation: geofence-pulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}

@keyframes geofence-pulse {
  0% {
    transform: scale(0.85);
    opacity: 1;
    box-shadow: 0 0 15px rgba(255, 107, 0, 0.4);
  }
  100% {
    transform: scale(1.65);
    opacity: 0;
    box-shadow: 0 0 35px rgba(255, 107, 0, 0);
  }
}
```

---

## 📱 Customer-Facing Applications Alignment

All 3 customer-facing applications adhere to this Cyber Orange & Obsidian Black philosophy:

1. **`LocqConsole` (B2B Admin Control Plane - Port 3000)**:
   - Obsidian `#0B0C0E` backdrop with Cyber Orange (`#FF6B00`) navigation indicators, KPI stat card highlights, and PostGIS geofence radius visualizations.

2. **`LocqDrop` (Consumer Gamification PWA - Port 3001)**:
   - Deep Carbon mobile shell with glowing Cyber Orange (`#FF6B00`) QR scanner controls, active geofence radar sweeps, and airtime/data claim action buttons.

3. **`LocqVerify` (Check-In & Attendance PWA - Port 3002)**:
   - Clean obsidian layout with Cyber Orange (`#FF6B00`) presence verification triggers and check-in confirmation badges.

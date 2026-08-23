# Pan-African Expansion & Market Strategy

## Executive Summary

LocqGeo is being developed around a location-aware field-verification capability for Nigerian operations. The initial commercial hypothesis is Abuja-first B2B field verification; payment integrations, consumer rewards, and cross-border expansion remain dependent on customer evidence, legal review, and operational readiness.

This document outlines the market viability, regulatory catalysts, competitive moats, technical architecture modifications, and regional rollout roadmap for expanding LocqGeo from Nigeria to West Africa, East Africa, Southern Africa, and North Africa.

---

## 1. Phase 1 Launchpad: Nigeria Market Analysis

### A. Regulatory Catalyst: POS Geofencing Hypothesis
The strategy has referenced a CBN requirement involving POS geotagging or geofencing and a 70-metre radius. The primary instrument, scope, effective date, evidence standard, and applicability must be verified before this is used in sales material. See [Regulatory Assumptions](../06-regulatory-assumptions.md).

Until confirmed by the relevant source and a customer compliance function, LocqGeo must not present itself as an emergency compliance bridge or imply that a PWA record will satisfy a regulator.

### B. Market Size & Additional Sectors
* **Out-of-Home (OOH) Advertising ($170M+ Market)**: Converts static billboards along high-density corridors (Lekki-Epe, Ikeja, Abuja Central) into interactive engagement channels using QR scans and instant airtime/data rewards via [LocqDrop](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/drop).
* **Field Workforce & Off-Grid Energy**: Verifies site visits for solar distributors (SunKing, d.light) and pharmaceutical field reps using anti-cheat telemetry to eliminate transportation allowance fraud.
* **Incentive Economy**: Airtime and mobile data act as liquid micro-currency in Nigeria, driving high conversion rates for physical scan drops.

---

## 2. Competitive Landscape & LocqGeo's Moat

While niche players exist in isolated sub-verticals across Africa, **no single platform offers a unified proof-of-presence engine combining anti-cheat telemetry, consumer rewards, and operational verification**:

| Competitor Segment            | Key Players in Africa           | Core Focus                                     | Missing Capability vs LocqGeo                                                           |
| :---------------------------- | :------------------------------ | :--------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Market Research Task Apps** | GeoPoll, SagaPoll               | B2C survey panels & basic store check-ins      | Lacks B2B developer API, sub-50ms engine, and 4-step anti-cheat pipeline.               |
| **OOH Ad Verification**       | Retinaad, Seedooh, OOH TRACE    | Screen Proof-of-Play & billboard camera audits | Lacks consumer QR micro-rewards, wallet payouts, and field workforce tracking.          |
| **Workforce Attendance**      | FieldPro, Sevikr Pro, AITime    | Geofenced employee clock-in timesheets         | Lacks consumer engagement tools, multi-tenant reward floats, and API webhooks.          |
| **Payment & Telco APIs**      | Africa's Talking, Beem, Onafriq | Raw communication and payment rails            | Provides rails only; no spatial PostGIS database, geofence builder, or fraud detection. |

### LocqGeo's Core Competitive Moat
1. **Unified Infrastructure Primitive**: Single engine ([LocqEngine](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/services/engine)) powering B2C consumer drops ([LocqDrop](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/drop)), B2B field verification ([LocqVerify](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/verify)), and enterprise management ([LocqConsole](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/console)).
2. **Configurable risk signals**: Location, freshness, velocity, duplication, and device signals can help prioritize review; performance and detection quality must be benchmarked for each deployment.
3. **Closed-Loop Payout Integration**: Automated payout worker ([services/payout-worker](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/services/payout-worker)) linking spatial proof directly to instant disbursements with a 3-layer fallback cascade (Primary -> Secondary -> Internal Wallet Credit).

---

## 3. Pan-African Expansion Corridors

Following market consolidation in Nigeria, expansion will target four strategic economic corridors:

```
                          ┌───────────────────────────┐
                          │    Pan-African Strategy   │
                          └─────────────┬─────────────┘
                                        │
      ┌──────────────────┬──────────────┴──────────────┬──────────────────┐
      ▼                  ▼                             ▼                  ▼
West Africa (WAEMU)  East Africa (EAC)      Southern Africa (SADC)   North Africa
 • Senegal (XOF)      • Kenya (KES)          • South Africa (ZAR)     • Egypt (EGP)
 • Ivory Coast (XOF)  • Uganda (UGX)         • Zambia (ZMW)           • Morocco (MAD)
 • Ghana (GHS)        • Tanzania (TZS)       • Zimbabwe (ZWG)
                      • Rwanda (RWF)
```

### 1. East Africa Corridor (EAC: Kenya, Uganda, Tanzania, Rwanda)
* **Payment Environment**: Mobile Money dominant (**M-Pesa**, **MTN MoMo**, **Airtel Money**).
* **Target Verticals**: Mombasa-Nairobi-Kampala trade corridor logistics, safari & eco-tourism gamification, and PAYGO solar home systems (M-KOPA, d.light).

### 2. Francophone West Africa Corridor (WAEMU: Côte d'Ivoire, Senegal, Cameroon)
* **Payment Environment**: Mobile Money & digital wallets (**Wave**, **Orange Money**, **MTN MoMo**).
* **Target Verticals**: Cocoa/Coffee cooperative field audits, Abidjan-Dakar transport corridor checks, and retail trade promotions.

### 3. Southern Africa Corridor (SADC: South Africa, Zambia, Zimbabwe)
* **Payment Environment**: Hybrid banking & mobile money (**EFT**, **Ozow**, **PayFast**, **Kazang**, **MTN MoMo**).
* **Target Verticals**: Mining HSE safety walkthroughs, security patrol verification, and retail loyalty programs.

### 4. North Africa Corridor (Egypt, Morocco)
* **Payment Environment**: Cash-to-digital & cards (**Fawry**, **Instapay**, **Orange Money**).
* **Target Verticals**: FMCG retail foot-traffic, heritage tourism quests, and municipal logistics tracking.

---

## 4. Pan-African Technical Integration Architecture

To scale LocqGeo across African borders, the monorepo requires three key architectural extensions:

### A. Pan-African Payout Gateway Aggregators
Extend [services/engine/src/services/payout.ts](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/services/engine/src/services/payout.ts) to integrate pan-African API aggregators:
1. **Africa's Talking**: For pinless airtime and mobile data top-ups across 10+ countries (Kenya, Uganda, Tanzania, Rwanda, Nigeria, Ghana, Ivory Coast, South Africa, Zambia).
2. **Onafriq (MFS Africa)**: For cross-border mobile money disbursements (M-Pesa, Orange Money, Wave, MTN MoMo) across 40+ African nations through a single API gateway.

### B. Multi-Currency Support Schema
Update [`packages/api-contracts`](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/packages/api-contracts) to support multi-currency campaign floats:
```typescript
export const SupportedCurrenciesEnum = z.enum([
  "NGN", // Nigeria Naira
  "KES", // Kenya Shilling
  "GHS", // Ghana Cedi
  "XOF", // West African CFA Franc
  "ZAR", // South African Rand
  "UGX", // Uganda Shilling
  "TZS", // Tanzania Shilling
  "USD"  // US Dollar (Cross-border fallback)
]);
```

### C. Internationalization (i18n)
Extend [LocqDrop](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/drop) and [LocqVerify](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/apps/verify) with localization modules:
* **English**: Default for Nigeria, Ghana, Kenya, South Africa.
* **French**: For Côte d'Ivoire, Senegal, Cameroon.
* **Swahili**: For Kenya, Tanzania, Uganda, Rwanda.
* **Arabic**: For Egypt and North Africa.

---

## 5. Evidence-Gated Commercial Roadmap

| Gate                      | Evidence required                                                                                    | Decision                                                      |
| :------------------------ | :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| 1. Abuja pilot            | Paid pilot with a named operational owner and baseline data                                          | Continue only if the workflow is used and value is measurable |
| 2. Nigerian repeatability | At least three pilots, documented deployment playbook, acceptable false-positive rate                | Expand to another Nigerian region or segment                  |
| 3. Product readiness      | Security review, retention policy, support process, stable pricing, and renewal or expansion         | Invest in broader platform capabilities                       |
| 4. Country expansion      | Country-specific buyer, legal/privacy review, payment and language plan, and local operating partner | Evaluate one country at a time                                |

---

## 6. Related Documentation
* [Vertical Use Cases Overview](../verticals/index.md)
* [Competitive Landscape](./competitive_landscape.md)
* [Fraud Detection Roadmap](./fraud_detection_roadmap.md)
* [LocqGeo System Architecture](../architecture/system_architecture.md)

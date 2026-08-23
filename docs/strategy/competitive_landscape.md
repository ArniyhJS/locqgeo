# Competitive Landscape Analysis — LocqGeo

## 1. Summary

This document is a market hypothesis, not proof of an uncontested category. LocqGeo should initially target Nigerian organizations that need better evidence for recurring field visits, inspections, or agent activity.

The most credible initial positioning is:

> **Location-aware field visit evidence and exception management for distributed Nigerian operations.**

Existing products already cover parts of this problem: workforce management, GPS tracking, survey collection, OOH measurement, identity verification, and payment rails. LocqGeo must win a specific workflow and demonstrate better operational value, rather than assume that combining features creates a defensible category.

See [Product Thesis](../00-product-thesis.md), [Initial ICP and Buyer](../01-icp-and-buyer.md), and [Abuja Field Verification MVP](../02-abuja-field-verification-mvp-prd.md) for the current launch hypothesis.

---

## 2. Market Map

```text
                    Identity / Trust
                           │
        VerifyMe ──────────┼────────── YouVerify
        (KYC / address)    │            (KYC / AML)
                           │
                           │
    Advertising ───────────┼─────────── Workforce
    / MarTech              │           / Logistics
                           │
  Terragon                 │         Kobo360
  Eskimi                   │         Various field-force tools
  Twinpine                 │
                           │
                           ▼
                  ┌─────────────────────┐
                  │   VERIFIED PRESENCE │
                  │       LocqGeo      │
                  │   (whitespace)      │
                  └─────────────────────┘
                           │
          Payments ────────┼────────── Global geofencing APIs
                           │
         Paystack          │         Radar
         OPay              │         GroundTruth
         VTpass            │         Bluedot
         Quickteller       │         Foursquare
```

---

## 3. Nigeria / Africa-Based Players

### 3.1 Terragon Group

- **Headquarters:** Lagos, Nigeria
- **Category:** Marketing cloud / customer data platform (CDP)
- **Products:** Terragon Marketing Cloud (TMC), enterprise messaging, loyalty management, insights
- **Overlap:** Consumer engagement, loyalty, data-driven marketing
- **Gap:** No public product for geofence-based presence verification or QR/NFC proof-of-visit
- **Threat level:** Medium — could add location verification, but currently a partner or parallel player
- **Opportunity:** Integrate LocqGeo verification events into Terragon’s CDP and loyalty workflows

### 3.2 Eskimi / Twinpine

- **Headquarters:** Nigeria / Pan-Africa
- **Category:** Mobile advertising / programmatic ad platforms
- **Products:** Display, video, rich media, telco-data-driven targeting
- **Overlap:** Location-targeted ad delivery, audience segmentation
- **Gap:** Focus on ad impressions and clicks, not verifying physical visits or rewarding them
- **Threat level:** Low — different problem (reach vs. verification)
- **Opportunity:** Eskimi/Twinpine could become demand-side partners for LocqGeo billboard campaigns

### 3.3 VerifyMe

- **Headquarters:** Lagos, Nigeria
- **Category:** Identity verification / KYC / address verification
- **Products:** BVN/NIN verification, biometrics, address verification, fraud detection
- **Overlap:** Identity linking, fraud prevention, trust
- **Gap:** Not focused on real-time attendance, campaign gamification, or consumer rewards
- **Threat level:** Low
- **Opportunity:** Use VerifyMe to enhance progressive identity and high-value reward payouts

### 3.4 YouVerify

- **Headquarters:** Lagos, Nigeria
- **Category:** KYC / AML / identity verification
- **Products:** Identity verification, address verification, business verification
- **Overlap:** Identity linking, compliance, trust
- **Gap:** No geofence engagement or reward product
- **Threat level:** Low
- **Opportunity:** Partner for user onboarding when reward claims require verified identity

### 3.5 Seamfix

- **Headquarters:** Lagos, Nigeria
- **Category:** Identity management / KYC / data capture
- **Products:** BioRegistra, verify.ng, identity APIs
- **Overlap:** Identity capture, device registration
- **Gap:** Not a consumer engagement or presence-verification platform
- **Threat level:** Low

### 3.6 Kobo360 / Lori Systems (now part of Flexport)

- **Headquarters:** Nigeria / Kenya
- **Category:** Logistics, trucking, supply chain
- **Products:** Truck marketplace, GPS tracking, route optimization
- **Overlap:** GPS tracking, field verification
- **Gap:** B2B logistics only; no consumer presence verification or rewards
- **Threat level:** Low
- **Opportunity:** LocqGeo could extend into delivery verification for e-commerce and logistics clients

### 3.7 TradeDepot / Alerzo

- **Headquarters:** Nigeria
- **Category:** Retail-tech / B2B e-commerce for neighbourhood stores
- **Products:** Inventory ordering, delivery, retailer financing
- **Overlap:** Field teams visit retailers, store-level data
- **Gap:** Not an open geofence verification API; tied to their own retail network
- **Threat level:** Low

### 3.8 OPay / Paystack / Quickteller / VTpass

- **Category:** Payments, wallets, digital rewards, airtime/data top-ups
- **Overlap:** Reward disbursement rails
- **Gap:** No location verification or campaign management
- **Threat level:** Low
- **Opportunity:** These are reward distribution partners, not competitors

---

## 4. Global Comparables

These companies show what a mature market looks like, but none has a strong Africa-focused, reward-integrated offering.

| Company                              | Category                         | What They Do                                                     | How LocqGeo Differs                                                                                |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Radar**                            | Geofencing API                   | Developer-friendly geofencing, trip tracking, location analytics | LocqGeo adds anti-fraud, campaign management, and reward orchestration for non-developer marketers |
| **GroundTruth**                      | Location-based ads + attribution | Geo-targeted advertising, visitation attribution                 | LocqGeo is more open-platform and reward-integrated; focused on Africa use cases                   |
| **Bluedot**                          | Location SDK / geofencing        | Accurate geofencing for apps, drive-through, curbside            | LocqGeo adds QR verification, offline PWA support, and reward disbursement                         |
| **Foursquare**                       | Location intelligence            | POI data, foot-traffic analytics, ad attribution                 | LocqGeo is execution-focused: verify, reward, and prevent fraud, not just measure                  |
| **PlotProjects**                     | Geofencing SDK                   | Mobile geofencing notifications and analytics                    | LocqGeo adds campaign builder, leaderboards, and payouts                                           |
| **AdMobilize**                       | OOH analytics                    | Computer vision and analytics for billboards                     | LocqGeo uses consumer scan + GPS, not cameras; cheaper deployment for billboards                   |
| **Gimbal**                           | Location SDK + beacons           | Proximity engagement, place matching                             | LocqGeo is QR-first and works on low-end devices without SDK integration                           |
| **Swarm / Foursquare consumer apps** | Social check-in                  | Social location sharing                                          | LocqGeo is B2B / B2B2C infrastructure, not a consumer social network                               |

---

## 5. Feature Comparison Matrix

| Capability                       | LocqGeo | Terragon | VerifyMe / YouVerify | Eskimi / Twinpine | Kobo360 | Radar   |
| -------------------------------- | ------- | -------- | -------------------- | ----------------- | ------- | ------- |
| Geofence creation                | Yes     | No       | No                   | No                | Limited | Yes     |
| QR-based verification            | Yes     | No       | No                   | No                | No      | No      |
| GPS accuracy filtering           | Yes     | No       | No                   | No                | No      | Yes     |
| Anti-fraud (velocity, duplicate) | Yes     | No       | Partial              | No                | No      | Partial |
| Campaign builder                 | Yes     | Partial  | No                   | No                | No      | No      |
| Consumer rewards                 | Yes     | Partial  | No                   | No                | No      | No      |
| Progressive identity             | Yes     | No       | Partial              | No                | No      | No      |
| Payout orchestration             | Yes     | No       | No                   | No                | No      | No      |
| Workforce verification           | Yes     | No       | No                   | No                | Yes     | Partial |
| OOH attribution                  | Yes     | No       | No                   | No                | No      | Partial |
| Multi-tenant console             | Yes     | Unknown  | Unknown              | No                | No      | Partial |
| Africa-first UX                  | Yes     | Yes      | Yes                  | Yes               | Yes     | No      |

---

## 6. Competitive Positioning

### How to describe LocqGeo against the market

> “LocqGeo helps operations teams verify assigned field visits, surface exceptions, and export an audit-supporting record using existing phones and site markers.”

### Key differentiators

1. **Operational workflow**: assignments, check-ins, exception review, and exports in one flow.
2. **Low deployment burden**: works with existing Android phones and site markers for suitable workflows.
3. **Connectivity tolerance**: captures offline records with explicit pending states and later server validation.
4. **Configurable risk signals**: location, freshness, duplication, authorization, and device signals support review; they do not prove identity or eliminate fraud.
5. **Local implementation**: Abuja-based onboarding and support can matter to regional operators.

---

## 7. Threats and Risks

| Threat                                         | Likelihood | Mitigation                                                                                               |
| ---------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| Terragon or a telco adds geofence verification | Medium     | Build anti-fraud IP and land enterprise clients fast                                                     |
| Global players like Radar enter Africa         | Medium     | Local reward integrations and offline consumer apps are hard to replicate                                |
| Ad platforms add basic QR check-ins            | Medium     | LocqGeo owns the full campaign and payout workflow                                                       |
| Payment wallets add reward campaigns           | Low        | They lack geofence verification; partner with them                                                       |
| GPS spoofing and collusion                     | High       | Treat signals as risk indicators, add review and customer evidence controls, and measure false positives |

---

## 8. Strategic Opportunities

### Immediate

- Run paid Abuja pilots with one operational segment where the team has warm access.
- Measure disputed visits, reporting effort, worker friction, false positives, and renewal intent against a customer baseline.
- Position rewards and OOH campaigns as later applications of the same verification capability, not the initial product.

### Mid-term

- Integrate with **Terragon’s CDP** so marketers can use verified presence as a customer signal.
- Add **beacon and Wi-Fi augmentation** for indoor and low-GPS accuracy environments.
- Launch an **API marketplace / developer portal** for custom integrations.

### Long-term

- Build a **network effect** from accumulated verification data to improve fraud models.
- White-label the console for **agencies managing multiple clients**.
- Expand into **East and Southern Africa** using the same rails.

---

## 9. Conclusion

LocqGeo operates in a **wide whitespace** in Nigeria and Africa. No local competitor offers the full stack of geofence verification, campaign management, anti-fraud, progressive identity, and reward disbursement. The closest players are either identity/KYC tools, ad-tech platforms, or logistics trackers — all of which solve adjacent problems rather than the core Verified Presence problem.

The strategic imperative is to **move fast on lighthouse clients** and build **defensible anti-fraud intelligence** before larger global or local players decide to enter the same space.

---

## 10. Core Competitive Advantages & Moat Recommendations

To secure and expand LocqGeo's unique position in the market, the platform must build a "moat" around the areas where OOH tracking and digital loyalty currently fail. The following recommendations leverage LocqGeo's strengths:

### 10.1 Productize "Crowdsourced OOH Verification" for Agencies

Currently, billboard owners and ad agencies rely on expensive AI cameras (like Retinaad) or manual field audits for proof-of-play.

- **The Advantage:** Pitch LocqGeo to advertising agencies as a **"Zero-Hardware Verification"** tool. Brands attach a LocqGeo QR code to their billboards, promising consumers micro-rewards (e.g., ₦100 airtime) to scan it. Consumers get rewarded, and the agency gets cryptographically secure, GPS-verified proof that the billboard is physically standing, visible, and engaging real humans.

### 10.2 Double Down on Anti-Fraud (The "African Trust Layer")

The biggest threat to reward platforms in Africa is organized fraud (e.g., GPS spoofing, script bots).

- **The Advantage:** Make configurable risk signals and exception review part of the B2B value proposition. Demonstrate measured reductions in disputed visits and reporting effort; do not promise that a specific percentage of events came from real humans or that fraud is eliminated.

### 10.3 Hyper-Optimize for the "Sachet Economy"

Nigeria operates heavily on micro-transactions. People value small, instant, and highly liquid rewards over long-term point accumulation.

- **The Advantage:** Keep payouts **instant and micro**. Avoid high withdrawal thresholds. Deep partnerships with VTpass and Paystack ensure that a QR scan delivers a ₦50 airtime top-up within seconds. This instant gratification generates virality and drastically lowers user acquisition costs.

### 10.4 Lean into "Offline-First" as a Core Feature

Many prime OOH locations (highways, deep markets, indoor event centers) suffer from locqy mobile networks.

- **The Advantage:** Ensure the offline queuing mechanism is flawless. Allowing a user or field worker to scan a code without the internet, and having the PWA seamlessly sync and trigger the reward once connectivity is restored, provides a massive edge over web-only platforms that fail in low-connectivity areas.

### 10.5 Push "Progressive Identity" to Lower Friction

Intense KYC processes or mandatory BVN requests upfront destroy conversion rates for casual scans.

- **The Advantage:** Allow users to scan and earn completely anonymously (using device fingerprints). Only request a phone number or email when they are ready to _withdraw_ rewards. This lowers the barrier to entry for impulse scans while still eventually capturing first-party data.

### 10.6 Introduce "Treasure Hunt" Gamification APIs

Go beyond single-scan verifications by productizing multi-location journeys.

- **The Advantage:** Brands seek sustained engagement. By providing campaign templates for "City-Wide Scavenger Hunts" (e.g., scan a code at a mall, a bus stop, and a store to unlock a prize), LocqGeo offers a turnkey, location-aware engagement solution that traditional AdTech platforms cannot match.

---

_This analysis is based on publicly available product positioning as of the document date. Competitive products evolve, so this should be reviewed quarterly._

# Competitive Landscape Analysis — SpottGeo

## 1. Summary

There is **no dominant Nigerian or Africa-focused company** offering a full-stack Verified Presence Platform that combines geofence verification, anti-fraud, campaign management, progressive identity, and reward disbursement. SpottGeo is positioned in a whitespace between identity/KYC providers, ad-tech platforms, loyalty tools, and logistics tracking solutions.

Most existing players solve **one piece** of the value chain. SpottGeo’s opportunity is to own the connective layer: **prove a real person was at a real place, then trigger the right business action.**

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
                  │       SpottGeo      │
                  │   (whitespace)      │
                  └─────────────────────┘
                           │
          Payments ────────┼────────── Global geofencing APIs
                           │
         Paystack          │         Radar
         OPay               │         GroundTruth
         VTpass             │         Bluedot
         Quickteller        │         Foursquare
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
- **Opportunity:** Integrate SpottGeo verification events into Terragon’s CDP and loyalty workflows

### 3.2 Eskimi / Twinpine

- **Headquarters:** Nigeria / Pan-Africa
- **Category:** Mobile advertising / programmatic ad platforms
- **Products:** Display, video, rich media, telco-data-driven targeting
- **Overlap:** Location-targeted ad delivery, audience segmentation
- **Gap:** Focus on ad impressions and clicks, not verifying physical visits or rewarding them
- **Threat level:** Low — different problem (reach vs. verification)
- **Opportunity:** Eskimi/Twinpine could become demand-side partners for SpottGeo billboard campaigns

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
- **Opportunity:** SpottGeo could extend into delivery verification for e-commerce and logistics clients

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

| Company | Category | What They Do | How SpottGeo Differs |
|---|---|---|---|
| **Radar** | Geofencing API | Developer-friendly geofencing, trip tracking, location analytics | SpottGeo adds anti-fraud, campaign management, and reward orchestration for non-developer marketers |
| **GroundTruth** | Location-based ads + attribution | Geo-targeted advertising, visitation attribution | SpottGeo is more open-platform and reward-integrated; focused on Africa use cases |
| **Bluedot** | Location SDK / geofencing | Accurate geofencing for apps, drive-through, curbside | SpottGeo adds QR verification, offline PWA support, and reward disbursement |
| **Foursquare** | Location intelligence | POI data, foot-traffic analytics, ad attribution | SpottGeo is execution-focused: verify, reward, and prevent fraud, not just measure |
| **PlotProjects** | Geofencing SDK | Mobile geofencing notifications and analytics | SpottGeo adds campaign builder, leaderboards, and payouts |
| **AdMobilize** | OOH analytics | Computer vision and analytics for billboards | SpottGeo uses consumer scan + GPS, not cameras; cheaper deployment for billboards |
| **Gimbal** | Location SDK + beacons | Proximity engagement, place matching | SpottGeo is QR-first and works on low-end devices without SDK integration |
| **Swarm / Foursquare consumer apps** | Social check-in | Social location sharing | SpottGeo is B2B / B2B2C infrastructure, not a consumer social network |

---

## 5. Feature Comparison Matrix

| Capability | SpottGeo | Terragon | VerifyMe / YouVerify | Eskimi / Twinpine | Kobo360 | Radar |
|---|---|---|---|---|---|---|
| Geofence creation | Yes | No | No | No | Limited | Yes |
| QR-based verification | Yes | No | No | No | No | No |
| GPS accuracy filtering | Yes | No | No | No | No | Yes |
| Anti-fraud (velocity, duplicate) | Yes | No | Partial | No | No | Partial |
| Campaign builder | Yes | Partial | No | No | No | No |
| Consumer rewards | Yes | Partial | No | No | No | No |
| Progressive identity | Yes | No | Partial | No | No | No |
| Payout orchestration | Yes | No | No | No | No | No |
| Workforce verification | Yes | No | No | No | Yes | Partial |
| OOH attribution | Yes | No | No | No | No | Partial |
| Multi-tenant console | Yes | Unknown | Unknown | No | No | Partial |
| Africa-first UX | Yes | Yes | Yes | Yes | Yes | No |

---

## 6. Competitive Positioning

### How to describe SpottGeo against the market

> “There are companies that verify identity, companies that deliver ads, companies that track trucks, and companies that send rewards. SpottGeo is the layer in the middle: it proves a real person was physically present, then triggers the right action — attribution, reward, or access.”

### Key differentiators

1. **Anti-fraud by design** — device fingerprint, velocity checks, GPS accuracy, duplicate prevention.
2. **Reward-integrated** — not just verification; it can trigger airtime, data, cash, or voucher rewards.
3. **Progressive identity** — users stay anonymous until they claim a reward, reducing friction.
4. **Offline-first consumer apps** — critical for African connectivity conditions.
5. **Open API + console** — usable by developers and non-technical campaign managers.
6. **Local reward rails** — built for VTpass, Paystack, telco APIs, and local wallets.

---

## 7. Threats and Risks

| Threat | Likelihood | Mitigation |
|---|---|---|
| Terragon or a telco adds geofence verification | Medium | Build anti-fraud IP and land enterprise clients fast |
| Global players like Radar enter Africa | Medium | Local reward integrations and offline consumer apps are hard to replicate |
| Ad platforms add basic QR check-ins | Medium | SpottGeo owns the full campaign and payout workflow |
| Payment wallets add reward campaigns | Low | They lack geofence verification; partner with them |
| GPS spoofing arms race | High | Continuous investment in spoofing detection and device reputation |

---

## 8. Strategic Opportunities

### Immediate
- Position as the **default verification layer** for Nigerian OOH agencies and billboard owners.
- Partner with **VTpass / Paystack** for reward disbursement.
- Run **city-level pilots** with telcos or FMCG brands.

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

SpottGeo operates in a **wide whitespace** in Nigeria and Africa. No local competitor offers the full stack of geofence verification, campaign management, anti-fraud, progressive identity, and reward disbursement. The closest players are either identity/KYC tools, ad-tech platforms, or logistics trackers — all of which solve adjacent problems rather than the core Verified Presence problem.

The strategic imperative is to **move fast on lighthouse clients** and build **defensible anti-fraud intelligence** before larger global or local players decide to enter the same space.

---

*This analysis is based on publicly available product positioning as of the document date. Competitive products evolve, so this should be reviewed quarterly.*

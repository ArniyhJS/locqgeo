# SpottDrop Product Requirements Document (PRD)

## 1. Overview

**SpottDrop** is the consumer **Rewards & Gamification Portal** Progressive Web App (PWA) for the SpottGeo Verified Presence Platform. It powers consumer engagement through advertising campaigns, billboard drops, loyalty punch cards, and instant rewards (airtime, mobile data, cash, or vouchers). Users scan QR codes at physical locations — billboards, retail stores, transit stops, and campaign nodes — to prove their presence and earn rewards.

SpottDrop serves as the **consumer-facing distribution channel** that makes physical-world marketing and brand engagement measurable and rewardable.

> **Ecosystem Positioning:** While **SpottVerify** is strictly dedicated to utility check-ins, workforce verification, and credential attendance, **SpottDrop** focuses exclusively on consumer rewards, gamified loyalty campaigns, ad monetization, and instant payouts.

### 1.1 Product Vision

> Turn every physical location into a rewarding moment.

### 1.2 Goals

1. Make scanning, verifying, and claiming rewards as fast as possible.
2. Support offline-first usage for users with unstable connectivity.
3. Incentivize repeat visits, loyalty streaks, and campaign completion.
4. Provide transparent wallet history and flexible withdrawal options.
5. Minimize fraud while keeping the experience frictionless.

### 1.3 Target Users

| Persona                         | Description                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| **Everyday Consumer**           | Wants free airtime, data, or cashback for scanning billboards.            |
| **Bargain Hunter**              | Actively seeks rewards, discounts, and vouchers.                          |
| **Loyalty Participant**         | Engages in multi-visit campaigns (e.g., visit 5 stores to win a voucher). |
| **Unbanked / Underbanked User** | Prefers airtime/data rewards over bank transfers.                         |

---

## 2. User Journeys

### Journey A: First-Time Reward Scan

1. User sees a billboard or store poster with a SpottDrop QR code.
2. Opens SpottDrop or scans with the phone camera.
3. App requests location permission.
4. User scans the QR code.
5. Engine verifies GPS accuracy, distance, and fraud signals.
6. On success, app shows reward summary and adds it to the wallet.
7. User links a phone number later to withdraw or redeem.

### Journey B: Multi-Visit Loyalty Campaign

1. User discovers a “Visit 5 billboards, win ₦500 airtime” campaign.
2. Scans each billboard over several days.
3. App shows progress (3/5, 4/5) and streak status.
4. On the 5th verified visit, app automatically unlocks the reward.

### Journey C: Offline Scan and Sync

1. User scans at a location with poor network.
2. App stores the scan locally in a queue.
3. When network returns, app syncs verification attempts in the background.
4. User receives a notification of successful reward once processed.

---

## 3. Current MVP Features

### 3.1 Home / Discovery Screen

- Display active campaigns and nearby reward opportunities.
- Show wallet balance and quick action buttons.
- Highlight featured or high-reward locations.

### 3.2 QR Scanner

- Camera-based QR code scanning.
- Decode geofence_id and campaign_id from QR payload.
- Manual fallback button for testing or degraded camera access.
- GPS accuracy display during scan.

### 3.3 Verification Result

- Success screen showing reward type, amount, and campaign points.
- Failure screen with reason (accuracy too low, out of bounds, duplicate, etc.).
- Haptic feedback on success.

### 3.4 Wallet

- List of all verified rewards.
- Status: queued, processing, completed, failed.
- Total wallet balance.
- Offline-cached records.

### 3.5 Offline Queue

- Store pending verifications in IndexedDB.
- Background sync when connection returns.
- Retry with backoff.

---

## 4. Target-State Features (Roadmap)

### 4.1 Discovery & Campaign Browsing

| Feature            | Description                                                | Priority |
| ------------------ | ---------------------------------------------------------- | -------- |
| Campaign cards     | Show active campaigns with image, title, reward, distance. | High     |
| Map view           | Browse nearby reward locations on a map.                   | High     |
| Category filters   | Filter by reward type: airtime, data, cash, voucher.       | Medium   |
| Favorites          | Save campaigns for quick access.                           | Low      |
| Push notifications | Alert users about new campaigns or expiring rewards.       | Medium   |

### 4.2 Scanner Enhancements

| Feature                             | Description                                                                               | Priority |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Low-light mode                      | Improve scan success in dark environments.                                                | Medium   |
| Auto-zoom                           | Focus on small or distant QR codes.                                                       | Low      |
| Manual alias input                  | Type a short location code (e.g., `LAGOS-IKEJA-01`) when camera access is unavailable.   | High     |
| Barcode / Data Matrix / PDF417      | Decode 1D/2D barcodes on tickets, posters, and packaging that resolve to a `geofence_id`. | Medium   |
| NFC support                         | Allow tap-to-verify at NFC-enabled locations.                                             | Low      |
| Bluetooth beacon support            | Verify presence via BLE signal at indoor venues.                                          | Low      |
| Deep-link / URL scheme verification | Open the app from SMS, email, or social links carrying `geofence_id` and `campaign_id`.   | High     |
| Audio / ultrasonic beacon           | Listen for inaudible audio signatures broadcast at TV/radio ads or kiosks.                | Low      |
| Wi-Fi / magnetic fingerprint        | Use known Wi-Fi signatures or geomagnetic patterns as an indoor presence hint.            | Low      |
| Organizer reverse scan              | Allow authorized staff to scan the user’s personal app QR code at a partner POS/booth.    | Low      |

### 4.3 Wallet & Redemptions

| Feature                         | Description                                                                                          | Priority |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- |
| Airtime / data top-up           | Convert wallet balance to airtime or mobile data via VTpass (Minimum ₦50 threshold).                | High     |
| Bank transfer / cash withdrawal | Withdraw cash balance to bank account via Paystack (Minimum ₦500 threshold).                        | High     |
| Voucher codes                   | Display redeemable voucher codes from partners.                                                      | Medium   |
| Transaction history             | Detailed list of credits, debits, and statuses.                                                      | High     |
| Minimum withdrawal thresholds   | Explicit policy enforcement: ₦50 for airtime/data top-ups, ₦500 for bank transfers.                 | High     |
| Fee disclosures                 | Upfront transparency for cash withdrawal fees to offset payment gateway transaction costs.           | High     |

#### Withdrawal & Fee Rules
- **Airtime & Data Top-ups (VTpass):** Minimum redemption threshold of **₦50**. No processing fees charged to the consumer.
- **Bank Transfers (Paystack):** Minimum withdrawal threshold of **₦500**. Transparent fee disclosures are shown prior to confirmation to offset gateway transaction fees.

### 4.4 User Identity & Account

| Feature                     | Description                                                                                       | Priority |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| Anonymous mode              | Scan and earn without registration.                                                               | Current  |
| Phone number linking        | Link account to phone for withdrawals.                                                            | High     |
| Email linking               | Alternative identity anchor.                                                                      | Medium   |
| Multiple device sync        | Same account across phone and tablet.                                                             | Medium   |
| Profile management          | Name, avatar, preferred reward type.                                                              | Low      |
| Offline streak preservation | Scans captured offline maintain daily loyalty streaks if synced within 24 hours of `scanned_at`.  | High     |

### 4.5 Engagement & Gamification

| Feature            | Description                                        | Priority |
| ------------------ | -------------------------------------------------- | -------- |
| Streak tracking    | Bonus rewards for consecutive daily visits.        | Medium   |
| Leaderboards       | See top earners per campaign or city.              | Medium   |
| Referral program   | Invite friends and earn when they verify.          | Medium   |
| Achievement badges | “First 10 scans,” “City Explorer,” etc.            | Low      |
| Share to social    | Share reward wins to WhatsApp, Twitter, Instagram. | Low      |

### 4.6 Trust & Safety

| Feature          | Description                                    | Priority |
| ---------------- | ---------------------------------------------- | -------- |
| Fraud warnings   | Notify users if behavior looks suspicious.     | Medium   |
| Appeal flow      | Allow users to contest a flagged verification. | Low      |
| Educational tips | Teach users how to improve GPS accuracy.       | Medium   |

---

## 5. Technical Considerations

- **PWA**: installable, service worker for offline support, responsive design.
- **Camera access**: use `getUserMedia` with graceful fallbacks.
- **Location**: high-accuracy GPS; handle permission denial.
- **IndexedDB**: for offline queue and wallet cache.
- **Secure storage**: device_id stored in a way that is hard to reset intentionally.
- **Background sync**: use service worker background sync where supported.
- **Push notifications**: optional, for campaign alerts and reward confirmations.
- **Offline Streak Preservation**: Offline verifications store client `scanned_at` timestamps alongside monotonic clock deltas. Scans synced within 24 hours of `scanned_at` preserve daily loyalty streaks and reward progress once validated by SpottEngine.
- **Cross-PWA Deep-Link & Payload Handling**: When a user scans a QR payload from SpottVerify within SpottDrop, SpottDrop parses the payload signature. It seamlessly extracts the underlying `geofence_id` to process the scan locally or executes a smooth deep-link redirect to SpottVerify without displaying syntax or execution errors.

---

## 6. Monetization Model

SpottDrop is primarily a **B2B2C product**. Revenue comes from the business side, not user fees.

| Revenue Source      | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| **Campaign fees**   | Brands/agencies pay SpottGeo to run reward campaigns.         |
| **Reward margin**   | SpottGeo may take a percentage of reward spend.               |
| **SaaS seat**       | Console subscriptions paid by advertisers.                    |
| **Withdrawal fees** | Optional small fee on cash withdrawals (offset payout costs). |

Users should never pay to scan or earn.

---

## 7. Success Metrics

| Metric                                 | Target / Meaning                             |
| -------------------------------------- | -------------------------------------------- |
| Scan-to-verify conversion              | ≥ 80% of scans result in verified presence   |
| Reward claim rate                      | ≥ 70% of verified users claim or use rewards |
| 7-day retention                        | ≥ 25% of new users return within a week      |
| Offline sync success rate              | ≥ 95% of queued scans eventually sync        |
| Average scans per active user per week | Growth indicator of habit formation          |
| Fraud rate                             | < 5% of verified rewards later flagged       |
| NPS                                    | Measure user satisfaction quarterly          |

---

## 8. Design Principles

1. **Fast**: scanning and verification should feel instant.
2. **Reward-forward**: every screen should reinforce the value being earned.
3. **Trustworthy**: clearly explain why a scan failed and how to retry.
4. **Inclusive**: work on low-end Android devices and poor networks.
5. **Transparent**: users always see wallet balance, reward status, and history.

---

## 9. Roadmap

### Phase 1 — MVP (Current)

- QR scanner with GPS verification
- Wallet with reward status
- Offline queue and sync
- Basic campaign awareness

### Phase 2 — Habit Formation

- Campaign discovery feed
- Push notifications
- Airtime/data redemption
- Streak tracking

### Phase 3 — Loyalty & Cash

- Bank transfer withdrawals
- Referral program
- Leaderboards
- Achievement badges

### Phase 4 — Ecosystem

- NFC / beacon verification
- Partner voucher marketplace
- Advanced fraud education
- Social sharing

---

## 10. Related Documents

- `docs/product/spottconsole_prd.md`
- `docs/product/spottverify_prd.md`
- `docs/strategy/fraud_detection_roadmap.md`
- `docs/strategy/competitive_landscape.md`

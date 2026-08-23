# LocqVerify Product Requirements Document (PRD)

## 1. Overview

**LocqVerify** is the **Utility Check-in & Credential Verifier** Progressive Web App (PWA) for the LocqGeo platform. It allows users to scan QR codes at physical locations to prove attendance, workforce check-in, CPE credits, site inspections, audit completion, or access authorization — with or without an associated reward campaign.

LocqVerify is designed for contexts where **verification itself is the primary value**: high-throughput event attendance, enterprise workforce check-ins, compliance inspections, continuing education (CPE/CEU) credit issuance, and secure access control.

> **Ecosystem Positioning & Sister App Relationship**  
> While **LocqDrop** serves as the *Consumer Rewards & Gamification Portal* (billboard drops, ad campaigns, loyalty punch cards, instant cash/airtime payouts), **LocqVerify** is strictly optimized as the *Utility Check-in & Credential Verifier*.  
> **Cross-PWA Deep-Linking:** If a LocqVerify QR code is scanned inside LocqDrop (or vice-versa), the PWA intelligently parses the payload header/format and offers a seamless deep-link redirect to LocqVerify or processes the underlying `geofence_id` directly without throwing format errors.

### 1.1 Product Vision

> The fastest way to prove you were really there.

### 1.2 Goals

1. Provide a lightweight way to collect location-aware evidence associated with a check-in.
2. Support both campaign-based gamification and standalone verification use cases.
3. Work reliably offline and in low-connectivity environments.
4. Keep user identity optional until a functional need requires linking.
5. Deliver clear verification proof that can be shared with organizers, employers, or systems.

### 1.3 Target Users

| Persona                     | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| **Event Attendee**          | Checks in at a conference, concert, or meetup.            |
| **Student / Trainee**       | Verifies class or session attendance.                     |
| **Field Worker**            | Confirms presence at a job site or inspection point.      |
| **Security / Patrol Guard** | Scans checkpoints during a patrol route.                  |
| **Conference Organizer**    | Uses the app to validate attendees via backend dashboard. |

---

## 2. User Journeys

### Journey A: Campaign-Based Verification

1. User sees a campaign poster with a LocqVerify QR code.
2. Opens LocqVerify or scans with camera.
3. QR payload contains `geofence_id` and `campaign_id`.
4. App captures GPS and scans the code.
5. Engine verifies location, campaign eligibility, and fraud signals.
6. App shows verification result, points earned, and leaderboard rank.
7. Verification is recorded in campaign progress and user history.

### Journey B: Standalone Event Check-In

1. User receives an event ticket or invitation with a QR code.
2. At the venue, user scans the QR at the entrance.
3. QR payload contains only `geofence_id`.
4. Engine verifies presence within the event geofence.
5. App shows a verified check-in badge and timestamp.
6. Organizer sees the verified attendee in LocqConsole.

### Journey C: Progressive Identity Linking

1. User scans anonymously for several events.
2. Organizer requires a verified identity for certificates or CPE credits.
3. User links phone number / email via LocqVerify.
4. App sends link request to LocqEngine.
5. Past anonymous verifications are backfilled to the linked user profile.
6. Certificates and credentials are now tied to the real user.

### Journey D: Offline Inspection

1. A field worker arrives at a remote site with no network.
2. Scans the QR code at the inspection point.
3. App stores the verification attempt locally.
4. When network returns, the app syncs and confirms verification.
5. Supervisor sees the verified check-in from the console.

---

## 3. Current MVP Features

### 3.1 Home Screen

- Explain the app’s purpose: “Verify your presence at locations and events.”
- Call-to-action to open the scanner.
- Link to verification history.

### 3.2 QR Scanner

- Camera-based scanning.
- Support for JSON payloads (`geofence_id`, `campaign_id`, `user_id`) and raw UUIDs.
- Manual fallback button.
- Display current GPS accuracy.

### 3.3 Verification Result

- Success screen with verification ID, campaign context, points earned, leaderboard rank.
- Reward display if campaign action type is REWARD.
- Failure screen with rejection reason.

### 3.4 Verification History

- List of offline-cached verification records.
- Show action type, timestamp, payout status, and campaign context.

### 3.5 Offline Support

- Store scans locally when network is unavailable.
- Sync in background.
- Retry failed submissions.

---

## 4. Target-State Features (Roadmap)

### 4.1 Verification Modes

| Feature                         | Description                                                      | Priority |
| ------------------------------- | ---------------------------------------------------------------- | -------- |
| Campaign verification           | Scan to participate in a campaign and earn points/rewards.       | Current  |
| Standalone check-in             | Scan to verify presence without a campaign (events, attendance). | High     |
| Ordered checkpoint verification | Visit geofences in a required sequence.                          | Medium   |
| Attendance mode                 | One-time verified check-in per session.                          | High     |
| Audit mode                      | Attach optional notes or photos to a verification.               | Medium   |
| Access mode                     | Unlock a gate, door, or restricted area after verification.      | Low      |

### 4.2 Identity & Credentials

| Feature                       | Description                                                   | Priority |
| ----------------------------- | ------------------------------------------------------------- | -------- |
| Anonymous scanning            | No account required by default.                               | Current  |
| Phone/email linking           | Link identity for certificates or rewards.                    | High     |
| Digital badges / certificates | Generate proof of attendance for events.                      | Medium   |
| CPE/CEU credits               | Issue continuing-education credits after verified attendance. | Medium   |
| Export verification proof     | Share a verification link or PDF.                             | Medium   |

### 4.3 Engagement

| Feature                 | Description                                        | Priority |
| ----------------------- | -------------------------------------------------- | -------- |
| Points and leaderboards | Show rank within a campaign.                       | Current  |
| Streaks                 | Consecutive verified days.                         | Low      |
| Milestone badges        | “10 events attended,” “All checkpoints completed.” | Low      |
| Social share            | Share verified attendance on social media.         | Low      |

### 4.4 Organizer-Facing Features

| Feature             | Description                                                            | Priority |
| ------------------- | ---------------------------------------------------------------------- | -------- |
| Organizer scanner   | Allow authorized staff to scan attendee QR codes instead of self-scan. | High     |
| Bulk check-in       | Verify a list of registered attendees at once.                         | Low      |
| Attendee search     | Find a user by name or ticket ID.                                      | Low      |
| Real-time headcount | Live count of verified attendees.                                      | Medium   |

### 4.5 Scanner Enhancements

| Feature                             | Description                                                                             | Priority |
| ----------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Manual alias input                  | Type a short location code (e.g., `LAGOS-IKEJA-01`) when camera access is unavailable.  | High     |
| Barcode / Data Matrix / PDF417      | Decode 1D/2D barcodes on tickets, badges, and posters that resolve to a `geofence_id`.  | Medium   |
| NFC verification                    | Tap an NFC tag to verify.                                                               | Low      |
| Bluetooth beacon verification       | Indoor verification where GPS is weak.                                                  | Low      |
| Deep-link / URL scheme verification | Open the app from SMS, email, or social links carrying `geofence_id` and `campaign_id`. | High     |
| Audio / ultrasonic beacon           | Listen for inaudible audio signatures broadcast at venues, kiosks, or media placements. | Low      |
| Wi-Fi / magnetic fingerprint        | Use known Wi-Fi signatures or geomagnetic patterns as an indoor presence hint.          | Low      |
| Auto-scan toggle                    | Continuous scanning for events with high throughput.                                    | Low      |

### 4.6 Trust & Safety

| Feature                 | Description                                  | Priority |
| ----------------------- | -------------------------------------------- | -------- |
| Fraud explanation       | Clear message when verification is rejected. | Medium   |
| Retry guidance          | Tell user to move outside, enable GPS, etc.  | Medium   |
| Root/jailbreak warnings | Warn users if device looks tampered.         | Low      |

---

## 5. Technical Considerations

- **PWA**: installable, offline-capable, lightweight.
- **QR decode**: support JSON and raw UUID formats.
- **GPS**: high-accuracy mode; handle indoor/weak signal gracefully.
- **IndexedDB**: offline queue and history cache.
- **Deep linking**: allow QR scanning from external camera app via URL scheme.
- **Push notifications**: optional alerts for verification success or identity required.
- **Accessibility**: simple, high-contrast UI for diverse users.
- **Offline Sync & Clock Integrity**: Offline check-ins record client `scanned_at` timestamps alongside monotonic clock deltas, validated by LocqEngine against server `received_at` within 24-hour standard (or 15-minute Flash Drop) sync windows.

---

## 6. Verification Payloads

LocqVerify supports multiple QR payload formats depending on physical deployment medium (static posters vs. dynamic digital screens):

### 6.1 Static Poster Payload (Recommended for physical print / campaigns)

Used for printed posters, billboards, and permanent physical markers. Relies on client-side GPS geofence checks and server-side verification to prevent remote spoofing.

```json
{
  "geofence_id": "uuid",
  "campaign_id": "uuid",
  "user_id": "uuid"
}
```

### 6.2 Dynamic HMAC Signed QR Payload (Recommended for digital displays & kiosks)

Used for dynamic screens, digital signage, TV monitors, or organizer tablets at check-in gates. To eliminate photo re-sharing and remote scanning fraud, dynamic screens refresh their displayed QR code periodically with an HMAC signature.

```json
{
  "geofence_id": "uuid",
  "timestamp": 1785500000,
  "nonce": "a8fbc302",
  "hmac": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

- **HMAC Signature:** Generated using `HMAC-SHA256(geofence_id + ":" + timestamp + ":" + nonce, tenant_secret)`.
- **Anti-Replay Expiration Window:** Dynamic payloads carry a strict **60-second expiration window**. If `timestamp` is older than 60 seconds relative to server time upon receipt, LocqEngine rejects the check-in attempt with `REJECTED_EXPIRED_PAYLOAD`.

### 6.3 Raw Geofence UUID (For standalone events)

```text
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

### 6.4 URL Payload (For marketing / deep links / cross-PWA routing)

```text
https://verify.locqgeo.app/scan?geofence_id=uuid&campaign_id=uuid
```

---

## 7. Success Metrics

| Metric                      | Target / Meaning                                       |
| --------------------------- | ------------------------------------------------------ |
| Scan-to-verify success rate | ≥ 80% of scans are verified                            |
| Offline sync success rate   | ≥ 95% of queued verifications sync successfully        |
| Identity linking rate       | ≥ 20% of active users link a phone/email when prompted |
| Campaign completion rate    | % of users who finish multi-step campaigns             |
| Organizer satisfaction      | Measured via NPS or churn on console side              |
| Verification latency        | Median < 2 seconds from scan to result                 |
| Fraud rate                  | < 3% of verified events later flagged                  |

---

## 8. Design Principles

1. **Trust-first**: every screen reinforces that the verification is official and tamper-resistant.
2. **Minimal friction**: reduce steps between scan and result.
3. **Context-aware**: show relevant info based on whether the scan is campaign-based or standalone.
4. **Offline-first**: assume poor connectivity and design for it.
5. **Inclusive**: work across device tiers and literacy levels.

---

## 9. Roadmap

### Phase 1 — MVP (Current)

- QR scanner with campaign and standalone support
- Verification result screen with points/rank
- Verification history
- Offline queue and sync

### Phase 2 — Identity & Credentials & Gate Throughput

- Phone/email linking
- Organizer Scanner Mode (primary feature for high-throughput event gate check-in)
- Verification export / share
- Digital attendance badges

### Phase 3 — Scale

- NFC and beacon support
- Real-time event headcount
- Audit notes and photo attachments
- CPE/CEU credit integration

### Phase 4 — Ecosystem

- Access-control integrations
- Advanced credential verification
- Multi-event season passes

---

## 10. Related Documents

- `docs/product/locqdrop_prd.md`
- `docs/product/locqengine_prd.md`
- `docs/product/locqconsole_prd.md`
- `docs/strategy/fraud_detection_roadmap.md`
- `docs/verticals/index.md`

# Fraud Detection Roadmap — SpottGeo

## 1. Goal

Make it significantly cheaper and harder to fake a SpottGeo verification than to complete a real one, while keeping the experience frictionless for honest users.

## 2. Why Fraud Detection Is the Core Moat

- QR codes can be shared, screenshotted, or scanned remotely.
- GPS coordinates can be spoofed with cheap apps.
- Emulators and virtual machines can imitate phones.
- Multiple accounts or devices can be used to farm rewards.

A strong fraud layer protects:
- Client budgets from being drained by fake verifications.
- Leaderboards and campaigns from manipulation.
- The integrity of SpottGeo’s verified-presence brand.

---

## 3. Fraud Detection Layers

SpottGeo should defend in multiple layers. No single signal is enough.

### Layer 1: Input Validation
Already implemented in the engine.

| Signal            | Rule                                            | Example Rejection   |
| ----------------- | ----------------------------------------------- | ------------------- |
| GPS accuracy      | Reject if accuracy > 50 meters                  | `REJECTED_ACCURACY` |
| Coordinate bounds | Latitude/longitude must be valid                | `INVALID_PAYLOAD`   |
| Device ID format  | Alphanumeric, length 16–128                     | `INVALID_PAYLOAD`   |
| UUID validity     | geofence_id and campaign_id must be valid UUIDs | `INVALID_PAYLOAD`   |

### Layer 2: Physical Plausibility
Already partially implemented.

| Signal                   | Rule                                                          | Example Rejection        |
| ------------------------ | ------------------------------------------------------------- | ------------------------ |
| Distance from geofence   | Reject if outside the geofence radius                         | `REJECTED_OUT_OF_BOUNDS` |
| Velocity / teleportation | Reject if speed between two pings is impossible               | `REJECTED_VELOCITY`      |
| Zero-time spoof          | Reject if distance changes with zero time delta               | `REJECTED_VELOCITY`      |
| Duplicate window         | Reject if device already verified at this geofence within 24h | `REJECTED_DUPLICATE`     |

### Layer 3: Device Trust
Build over time.

| Signal                           | What It Detects                                      |
| -------------------------------- | ---------------------------------------------------- |
| Device fingerprint consistency   | Same device_id sending wildly different fingerprints |
| Emulator / rooted device flags   | Fingerprint libraries, user-agent anomalies          |
| App vs. browser origin           | Web scans can be more fragile than native app scans  |
| Screen / hardware attributes     | Device model, screen size, OS version consistency    |
| VPN / proxy usage                | IP geolocation mismatch with GPS                     |
| Multiple device IDs on one phone | Clearing app storage to reset device_id              |

### Layer 4: Behavioral and Network Patterns
Build over time.

| Signal                | What It Detects                                                      |
| --------------------- | -------------------------------------------------------------------- |
| Scan-to-scan timing   | Too many scans in too little time                                    |
| Geographic clustering | Many devices verifying from the same unusual location                |
| Device farm patterns  | Hundreds of devices sharing IPs, models, or behavior sequences       |
| Stolen QR codes       | Verifications happening far from the expected geofence after QR leak |
| Reward farming        | Same user/device repeatedly hitting high-reward geofences            |
| Sleep/wake anomalies  | Scans at impossible hours for a campaign location                    |

### Layer 5: Reputation and Probabilistic Scoring
Build on top of Layers 1–4.

| Signal                  | What It Detects                                               |
| ----------------------- | ------------------------------------------------------------- |
| Device trust score      | Historical behavior of a device_id                            |
| User trust score        | Historical behavior of a linked user                          |
| Geofence risk score     | Geofences that attract abnormal verification patterns         |
| Campaign risk score     | Campaigns with unusually high rejection or reward-claim rates |
| Network / IP reputation | Known datacenter, VPN, or botnet ranges                       |

---

## 4. Proposed Roadmap

### Phase 1 — Baseline Defenses (Now)

**Already in place:**
- GPS accuracy threshold
- Geofence radius check
- Velocity / duplicate / inactive geofence checks

**Quick wins to add:**
- [ ] Basic device fingerprint (screen size, user-agent, OS, browser)
- [ ] IP geolocation check vs. GPS (warning flag, not yet blocking)
- [ ] Per-device rate limiting (e.g. max 5 verifications per minute)
- [ ] Store every verification attempt, not just successes, in a `verification_attempts` log
- [ ] Add `fraud_score` and `fraud_signals` columns to verifications and attempts

**Acceptance criteria:**
- Fraud signals are recorded for every request.
- Per-device rate limit is enforced.
- No increase in false-positive rejection of legitimate users.

---

### Phase 2 — Device Intelligence (1–2 months)

**Goals:** detect emulators, device reset fraud, and shared QR codes.

- [ ] Implement a fingerprinting library (e.g. FingerprintJS for web, native SDK signals later).
- [ ] Generate a stable `device_fingerprint` hash per device.
- [ ] Detect when multiple `device_id` values share the same fingerprint.
- [ ] Detect emulator / rooted / jailbroken flags where possible.
- [ ] Add a device trust score table: `device_reputation`.
- [ ] Block or challenge verifications from devices with low trust scores.

**Schema addition:**

```sql
CREATE TABLE device_reputation (
  device_id TEXT PRIMARY KEY,
  trust_score NUMERIC(4,3) DEFAULT 0.5 CHECK (trust_score BETWEEN 0 AND 1),
  emulator_flags JSONB DEFAULT '[]',
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_verifications INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  flags_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance criteria:**
- Emulators and repeated device resets are flagged.
- Trust score updates after every verification attempt.
- Low-trust devices are challenged or blocked without breaking real users.

---

### Phase 3 — Behavioral and Network Models (2–4 months)

**Goals:** detect farms, bots, and campaign-specific abuse.

- [ ] Build `verification_attempts` table for all accepted and rejected requests.
- [ ] Aggregate scans per IP, per geofence, per campaign in time windows.
- [ ] Detect anomalies like:
  - >N verifications from same IP in 1 hour
  - >M devices sharing one GPS coordinate
  - Scan bursts around payout thresholds
- [ ] Implement IP reputation list (datacenters, known VPNs, Tor).
- [ ] Add campaign-level rate limits and per-user caps.
- [ ] Introduce a “shadow mode” machine-learning scorer (predicts fraud but does not block yet).

**Acceptance criteria:**
- Anomaly alerts fire within 15 minutes.
- Shadow-mode model is trained on 30 days of labeled data.
- False-positive rate is measured and kept below 2%.

---

### Phase 4 — Predictive Scoring and Automated Response (4–6 months)

**Goals:** move from rule-based to risk-score-based decisions.

- [ ] Combine device, behavioral, network, and geofence signals into a single `fraud_score` (0–100).
- [ ] Risk tiers:
  - 0–30: allow
  - 31–60: allow but flag for review
  - 61–85: require challenge (e.g. phone OTP, selfie, delayed reward)
  - 86–100: block
- [ ] Add a manual review queue in SpottConsole.
- [ ] Auto-suspend devices or users crossing thresholds.
- [ ] Retrain model weekly as new fraud patterns emerge.

**Acceptance criteria:**
- Fraud score is returned in every verification response.
- Console shows a review queue with evidence for each flagged case.
- Automated blocks can be appealed and reversed by admins.

---

### Phase 5 — Ecosystem-Wide Intelligence (6–12 months)

**Goals:** leverage cross-client, cross-campaign data for a network effect.

- [ ] Cross-tenant fraud signals (anonymized) to identify repeat offenders across clients.
- [ ] Shared blocklist of known fraudulent devices, IPs, and user accounts.
- [ ] Predictive geofence risk scores based on historical abuse.
- [ ] Advanced spoofing detection:
  - GPS-coordinate clustering too perfect to be natural
  - Time-zone / locale mismatches
  - Accelerometer / motion sensor absence
- [ ] Optional native mobile SDK with stronger anti-spoof signals than the web PWA.

**Acceptance criteria:**
- Cross-tenant signals improve detection accuracy measurably.
- Native SDK detects spoofing apps and mocked locations more reliably than web.
- SpottGeo publishes a fraud transparency report to clients.

---

## 5. Data Requirements

To build all layers, the system must collect and store:

| Data Point                       | Purpose                              |
| -------------------------------- | ------------------------------------ |
| All verification attempts        | Train models and detect patterns     |
| Device fingerprint               | Recognize the same device across IDs |
| IP address + ASN                 | Detect VPNs, proxies, farms          |
| User agent                       | Detect emulators, headless browsers  |
| GPS accuracy and satellite count | Detect mocked locations              |
| Timestamp + lat/lng history      | Velocity and duplicate checks        |
| Campaign and geofence context    | Risk scoring per asset               |
| Reward outcomes                  | Correlate fraud with reward abuse    |

**Privacy note:** collect the minimum necessary, hash or rotate identifiers where possible, and comply with local data-protection laws.

---

## 6. Response Actions

Not every fraud signal should block the user. Graduated responses reduce friction.

| Risk Level      | Response                                             |
| --------------- | ---------------------------------------------------- |
| Low             | Allow normally                                       |
| Medium          | Allow, flag in console, delay reward payout          |
| High            | Require challenge (OTP, CAPTCHA, selfie)             |
| Critical        | Block verification, log incident, notify ops team    |
| Confirmed fraud | Ban device/user, claw back rewards, add to blocklist |

---

## 7. Key Metrics

| Metric                   | Target / Meaning                                        |
| ------------------------ | ------------------------------------------------------- |
| Fraud rejection rate     | 3–10% of total attempts (varies by campaign type)       |
| False positive rate      | < 2% of legitimate users blocked                        |
| Reward clawback rate     | Track how many verified rewards later proved fraudulent |
| Time-to-detect           | < 15 minutes for campaign-level anomalies               |
| Manual review queue size | Kept below manageable threshold via automation          |
| Model precision / recall | Measured weekly on labeled test set                     |

---

## 8. Organizational Enablers

- **Fraud ops analyst**: investigates flagged cases and tunes thresholds.
- **Data scientist / ML engineer**: builds behavioral models in Phase 3+.
- **Client trust report**: quarterly transparency report for enterprise tenants.
- **Bug bounty / abuse reporting channel**: let ethical hackers and users report weaknesses.

---

## 9. Conclusion

Fraud detection is not a feature — it is the foundation of trust. SpottGeo should start with simple, deterministic rules, then layer on device intelligence, behavioral models, and predictive scoring. Each phase makes the platform harder to game and more valuable to honest clients.

The earlier fraud signals are collected, the faster the system learns. Even if advanced ML comes later, every verification attempt today should be stored with as much signal data as possible.

---

## 10. Related Documents

- `docs/architecture/nationwide_campaign_architecture.md`
- `docs/strategy/competitive_landscape.md`
- `docs/product/spottconsole_prd.md`

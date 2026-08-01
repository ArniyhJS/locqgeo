# SpottEngine Product Requirements Document (PRD)

## 1. Overview

**SpottEngine** is the core API and verification engine of the SpottGeo platform. It receives presence claims from consumer apps (SpottDrop, SpottVerify), validates them against geofences, campaigns, and fraud rules, and records verified events. It also exposes APIs for campaign management, user identity linking, leaderboards, and telemetry.

SpottEngine is the **platform layer** that everything else depends on. It must be fast, reliable, fraud-resistant, and easy to integrate.

### 1.1 Product Vision

> The universal API for proving that a real person was at a real place.

### 1.2 Goals

1. Verify physical presence with high accuracy and low latency.
2. Prevent fraud through device signals, velocity checks, duplicate detection, and behavior analysis.
3. Support flexible use cases: rewards, attendance, audits, access control, and gamification.
4. Provide a clean REST API for internal apps, external developers, and enterprise integrations.
5. Scale horizontally to support millions of verifications per day.
6. Maintain a complete, auditable record of every verification attempt.

### 1.3 Users of SpottEngine

| User                             | How They Use It                                                         |
| -------------------------------- | ----------------------------------------------------------------------- |
| **SpottDrop / SpottVerify PWAs** | Submit verification requests from consumers.                            |
| **SpottConsole**                 | Configure geofences, campaigns, users, and view analytics.              |
| **External developers**          | Integrate verification into third-party apps.                           |
| **Enterprise clients**           | Use webhooks and API responses for attribution, payroll, or compliance. |
| **Payout workers**               | Consume verification events to process rewards.                         |

---

## 2. Core Concepts

| Concept          | Definition                                                                            |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Tenant**       | A business account using SpottEngine (e.g., an agency, brand, or institution).        |
| **Geofence**     | A physical boundary defined by latitude, longitude, and radius.                       |
| **Campaign**     | A set of rules, geofences, dates, budgets, and rewards for a presence initiative.     |
| **Verification** | An attempt to prove presence at a geofence, resulting in verified or rejected status. |
| **Device**       | A consumer phone or browser identified by a stable device_id.                         |
| **User**         | A progressively linked identity (phone/email) associated with one or more devices.    |
| **Reward**       | A payout triggered by a verified event: airtime, data, cash, or voucher.              |
| **Leaderboard**  | Aggregated scores per campaign/device/user.                                           |

---

## 3. API Modules

### 3.1 Verification API

**Endpoint:** `POST /api/v1/engine/verify`

The central presence-verification endpoint.

**Request body:**

```json
{
  "device_id": "abc123...",
  "user_id": "uuid (optional)",
  "campaign_id": "uuid (optional)",
  "geofence_id": "uuid (optional if alias is provided)",
  "alias": "LAGOS-IKEJA-01 (optional if geofence_id is provided)",
  "tenant_id": "uuid (optional)",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy_meters": 8.5,
  "velocity_mps": 0.0,
  "scanned_at": "2026-07-25T09:58:30Z (optional client scan time)",
  "monotonic_delta_ms": 1200
}
```

**Response — success:**

```json
{
  "success": true,
  "status": "VERIFIED",
  "data": {
    "verification_id": "uuid",
    "geofence_id": "uuid",
    "geofence_title": "Lekki Billboard A",
    "distance_meters": 4.2,
    "action_type": "REWARD",
    "verified_at": "2026-07-25T10:00:00Z",
    "payout_status": "QUEUED",
    "campaign_id": "uuid",
    "points_earned": 10,
    "leaderboard_rank": 7,
    "reward": {
      "type": "AIRTIME",
      "amount": 100,
      "currency": "NGN",
      "payout_status": "QUEUED"
    }
  }
}
```

**Response — error:**

```json
{
  "success": false,
  "status": "REJECTED_OUT_OF_BOUNDS",
  "error_code": "ERR_OUT_OF_BOUNDS",
  "message": "Distance 80.5m is outside the geofence radius of 50.0m"
}
```

**Validation rules:**

- `device_id` must be 16–128 alphanumeric characters.
- `latitude` between -90 and 90; `longitude` between -180 and 180.
- `accuracy_meters` must be non-negative.
- Exactly one of `geofence_id` or `alias` must be provided.
- `geofence_id`, `campaign_id`, `user_id`, and `tenant_id` must be valid UUIDs when supplied.
- `alias` maps case-insensitively to `geofences.creative_code` and resolves to a concrete geofence before anti-cheat checks.
- `scanned_at` (optional ISO 8601 timestamp string) must adhere to offline sync validation windows (max 24 hours for standard campaigns, max 15 minutes for Flash Drops).
- `monotonic_delta_ms` (optional integer) used to validate client clock monotonicity against server `received_at`.

**Rate Limiting Rules:**

- **Per Device ID:** Maximum 5 verification requests per 60 seconds (`REJECTED_RATE_LIMIT`).
- **Per IP Address:** Maximum 100 verification requests per 60 seconds (`REJECTED_RATE_LIMIT`).
- **Per Tenant API Key:** Throttled based on tenant tier (Default 1,000 req/sec).

**Offline Timestamp & Clock Integrity Validation:**

- Every ping records both `scanned_at` (client scan time) and `received_at` (server arrival time).
- **Standard Campaigns:** Verification pings must be synced within 24 hours of `scanned_at`.
- **Flash Drops / Time-Limited Campaigns:** Scans must be synced within **15 minutes** of `scanned_at`.
- **Clock Tampering Protection:** Client PWAs store monotonic time deltas alongside system timestamps. Server compares `received_at - scanned_at` drift against monotonic deltas; suspicious negative deltas (client clock rewind) or excessive drift trigger `REJECTED_SPOOF`.

**Anti-fraud pipeline:**

1. Input schema validation (Zod).
2. Rate limiting check (Device: max 5 req/60s, IP: max 100 req/60s, Tenant key tier limit). Reject with `REJECTED_RATE_LIMIT`.
3. Offline timestamp and clock integrity check (`scanned_at` vs `received_at` drift check, monotonic clock delta check). Reject with `REJECTED_SPOOF`.
4. Hardware attestation & dynamic QR payload check (Google Play Integrity / iOS App Attest, time-varying HMAC validation). Reject with `REJECTED_SPOOF`.
5. GPS accuracy check: reject if accuracy > 50m (`REJECTED_ACCURACY`).
6. Geofence existence and active status check (`REJECTED_INACTIVE_GEOFENCE`).
7. Campaign eligibility check (if `campaign_id` provided).
8. Velocity / teleportation check against last ping (`REJECTED_VELOCITY`).
9. Duplicate verification check: 24h rolling window per device + geofence (`REJECTED_DUPLICATE`).
10. Distance check: user must be within geofence radius (`REJECTED_OUT_OF_BOUNDS`).
11. Device reputation check (future).
12. Persist verification and trigger campaign/reward logic.

---

### 3.2 Campaign API

**Endpoints:**

- `GET /api/v1/campaigns?tenant_id=uuid`
- `POST /api/v1/campaigns`
- `GET /api/v1/campaigns/:id`
- `GET /api/v1/campaigns/:id/leaderboard?limit=50`
- `GET /api/v1/campaigns/:id/me?device_id=...`

**Use case:** list, create, and inspect campaigns; retrieve leaderboards and a device’s progress.

---

### 3.3 User Identity API

**Endpoints:**

- `POST /api/v1/users/link` — link a device to a phone/email and create/update a user.
- `GET /api/v1/users/me?device_id=...` — fetch user profile, devices, and wallet.

**Use case:** progressive identity. Users scan anonymously but can link an account later to claim rewards or receive credentials.

---

### 3.4 Telemetry / Health API

**Endpoints:**

- `GET /health` — engine health check.
- `POST /api/v1/console/telemetry` — receive telemetry summaries from SpottConsole.

---

### 3.5 Webhooks (Future)

**Events:**

- `verification.created`
- `verification.rejected`
- `reward.queued`
- `reward.completed`
- `reward.failed`
- `fraud.flagged`

---

## 4. Data Model

Key tables already defined in the SpottGeo schema:

- `tenants`
- `geofences`
- `campaigns`
- `campaign_geofences`
- `campaign_progress`
- `leaderboards`
- `verifications`
- `checkin_pings`
- `users`
- `user_devices`
- `user_wallets`
- `user_otp_codes`

**Engine writes to:**

- `checkin_pings` — every raw presence claim.
- `verifications` — every verified or rejected event.
- `campaign_progress` — per-campaign visit records.
- `leaderboards` — aggregated scores.
- `campaigns.total_budget_spent` — when campaign rewards are processed.

---

## 5. Verification States

| Status                       | Meaning                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VERIFIED`                   | Presence proved; reward/attendance processed.                                                                                                          |
| `REJECTED_ACCURACY`          | GPS accuracy too low (> 50m) or payload invalid.                                                                                                       |
| `REJECTED_DUPLICATE`         | Already verified here in the last 24 hours.                                                                                                            |
| `REJECTED_VELOCITY`          | Impossible travel speed calculated from delta.                                                                                                         |
| `REJECTED_SPOOF`             | Detected location spoofing, timing manipulation/clock drift, hardware attestation failure (rooted device), or dynamic HMAC signature validation failure. |
| `REJECTED_RATE_LIMIT`        | Exceeded rate limit threshold (max 5 req/60s per device_id, max 100 req/60s per IP, or tenant API key rate limit).                                    |
| `REJECTED_OUT_OF_BOUNDS`     | User outside geofence radius.                                                                                                                          |
| `REJECTED_INACTIVE_GEOFENCE` | Geofence missing or inactive, or campaign ineligible.                                                                                                  |

---

## 6. Fraud and Trust Requirements

Current baseline:

- GPS accuracy threshold (< 50m).
- Distance-based geofence check.
- Velocity check against previous pings.
- 24-hour duplicate window.
- Schema validation via Zod.

Planned fraud layers:

- **Hardware Attestation Layer:** Integration with Google Play Integrity API (Android) and DeviceCheck / App Attest (iOS) to reject rooted/jailbroken devices running fake GPS injectors.
- **Time-varying Dynamic HMAC Signed QR Code Validation:** Time-varying dynamic QR code validation (`expires_at`, `nonce`, `hmac`) for digital displays to eliminate screenshot sharing and remote fraud.
- Device fingerprinting and reputation scoring.
- IP geolocation comparison.
- Rate limiting per device (5 req/60s), IP (100 req/60s), and tenant API key.
- Behavioral anomaly detection (scan bursts, device farms).
- Machine-learning-based risk scoring.

See `docs/strategy/fraud_detection_roadmap.md` for the full plan.

---

## 7. Reward Orchestration

When a verified event has a reward:

1. Determine reward amount, currency, and provider from geofence or campaign.
2. **Atomic Tenant Float Reservation & Allocation Lock:** Execute an **atomic check-and-lock transaction** (`SELECT ... FOR UPDATE` on tenant float balances or Redis transaction lock) against tenant float reserves and campaign allocation caps before queuing payout jobs to prevent double-spending.
3. Queue a payout job.
4. Worker processes payout via VTpass, Paystack, bank transfer, or voucher provider.
5. Update `verifications.payout_status`, `campaigns.total_budget_spent`, and `user_wallets`.
6. Emit webhook events.

Payout statuses:

- `NOT_APPLICABLE`
- `QUEUED`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

---

## 8. Performance and Scalability Requirements

| Metric                               | Target                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Median verification latency          | < 200ms at p50                                                                                            |
| p99 verification latency             | < 1 second                                                                                                |
| Throughput                           | ≥ 1,000 verifications/second per instance                                                                 |
| Availability                         | 99.9% uptime                                                                                              |
| Database query time per verification | < 50ms                                                                                                    |
| Offline sync tolerance               | 24h window for standard campaigns, 15-minute window for Flash Drops with monotonic clock drift validation |

**Scaling strategy:**

- Stateless Fastify instances behind a load balancer.
- PostgreSQL read replicas for leaderboard and analytics queries.
- Redis for rate limiting, leaderboards, and payout queues.
- Async payout workers decoupled from verification response.

---

## 9. Security Requirements

- HTTPS only.
- API keys hashed and scoped per tenant/environment.
- Input validation via Zod on every endpoint.
- Rate limiting on `/verify` and public endpoints.
- SQL injection prevention via parameterized queries.
- No sensitive reward provider credentials in logs.
- User data minimization and consent-aware collection.

---

## 10. Observability

- Structured logging of every verification attempt.
- Metrics: throughput, latency, rejection reasons, fraud rate, payout success rate.
- Health endpoint for load balancers.
- Error tracking via Sentry or similar.
- Slow query monitoring on PostgreSQL.
- Queue depth monitoring for payouts.

---

## 11. Success Metrics

| Metric                    | Target                            |
| ------------------------- | --------------------------------- |
| Verification success rate | ≥ 80% of valid scans              |
| Fraud rejection rate      | 3–10% depending on campaign       |
| False positive rate       | < 2% of legitimate users rejected |
| Payout success rate       | ≥ 98%                             |
| API uptime                | ≥ 99.9%                           |
| Median latency            | < 200ms                           |
| Tenant integration time   | < 1 day for basic API usage       |

---

## 12. Roadmap

### Phase 1 — Core Verification (Current)

- `/api/v1/engine/verify` endpoint
- Geofence lookup and radius check
- Velocity, duplicate, and accuracy filters
- Campaign support for points and rewards
- User linking and wallet creation

### Phase 2 — Campaign & Identity APIs

- Full campaign CRUD API
- Leaderboard and progress endpoints
- User profile lookup
- Webhook support

### Phase 3 — Fraud & Scale

- Device fingerprinting and reputation scoring
- Rate limiting
- IP and behavioral anomaly detection
- Redis caching for hot reads
- Read replicas for analytics

### Phase 4 — Enterprise & Ecosystem

- Multi-tenant isolation hardening
- Audit logs API
- Advanced webhook filtering
- Public API docs and SDKs
- Optional native mobile SDK endpoints

---

## 13. Related Documents

- `docs/product/spottdrop_prd.md`
- `docs/product/spottverify_prd.md`
- `docs/product/spottconsole_prd.md`
- `docs/strategy/fraud_detection_roadmap.md`
- `docs/architecture/nationwide_campaign_architecture.md`

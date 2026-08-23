# LocqGeo Functional Requirements Document (FRD)

Document Version: 3.3.0

## 1. Functional Requirements Matrix

### 1.1 Enterprise B2B Dashboard (LocqConsole)

- **FRD-OS-01**: Campaign creation wizard allowing budget allocation, geofence radius definition, tenant float balance funding, and payout mechanism selection.
- **FRD-OS-02**: Executive dashboard analytics showing active drops, claim success rate, pre-aggregated daily telemetry summaries, and blocked fraud attempts.
- **FRD-OS-03**: Real-time telemetry log feed with anti-cheat rule violation breakdowns and spoof risk score metrics.
- **FRD-OS-04**: Webhook Dead-Letter Queue (DLQ) UI management & exponential backoff retries.
- **FRD-OS-05**: Pre-funded Tenant Float pool balance funding and allocation cap reservations with atomic check-and-lock transactions.

### 1.2 Consumer PWA (LocqDrop)

- **FRD-DROP-01**: Radar map view calculating current distance to active drops using spatial queries.
- **FRD-DROP-02**: Single-tap claim verification triggering Fastify `/api/v1/engine/verify` validation.
- **FRD-DROP-03**: Mobile wallet showing accumulated rewards with instant airtime/data top-up, Paystack bank transfer, and fallback internal `user_wallets` crediting.
- **FRD-DROP-04**: PWA manifest & service worker offline caching capabilities.
- **FRD-DROP-05**: Minimum redemption thresholds (₦50 airtime/data, ₦500 Paystack bank transfer with fee disclosures) and cross-PWA deep-link handling.

### 1.3 Consumer PWA (LocqVerify)

- **FRD-VERIFY-01**: Multi-input verification scanner (QR code, NFC tag, Bluetooth beacon, and manual location code) for standalone event attendance and check-in without gamification requirements.
- **FRD-VERIFY-02**: Offline verification queue that stores payloads and syncs with the engine upon network restoration.
- **FRD-VERIFY-03**: Progressive identity linking, allowing anonymous verifications to be later associated with a user profile.
- **FRD-VERIFY-04**: Dynamic HMAC Signed QR Code validation with 60-second anti-replay window and Organizer Scanner Mode.

### 1.4 Core Engine & Microservices (LocqEngine)

- **FRD-ENGINE-01**: Fastify HTTP server with a documented latency target measured separately for API processing and end-to-end mobile response; sub-50ms may be a benchmark target for a defined server-only path, not a general user promise.
- **FRD-ENGINE-02**: Zod v4 schema validation via `@locqgeo/api-contracts`.
- **FRD-ENGINE-03**: Versioned risk-signal evaluation emitting clear outcomes such as `REJECTED_ACCURACY`, `REJECTED_VELOCITY`, and `REJECTED_SPOOF`, with documented thresholds and false-positive monitoring; signals support review and do not guarantee fraud prevention.
- **FRD-ENGINE-04**: Decoupled `@locqgeo/payout-worker` service executing queued payouts with primary (Paystack/VTpass), secondary (Flutterwave), and internal wallet fallback cascades.
- **FRD-ENGINE-05**: Decoupled `@locqgeo/webhook-dispatcher` service dispatching HMAC SHA-256 signed event notifications to enterprise endpoints.
- **FRD-ENGINE-06**: Decoupled `@locqgeo/analytics-worker` pre-aggregating daily verification trends and active campaign stats for dashboard caching.
- **FRD-ENGINE-07**: Per-device (5 req/60s) and per-IP (100 req/60s) rate limiting, 15-min Flash Drop / 24h standard offline sync window, and monotonic clock drift validation.

## 2. Related Documents

- [LocqGeo Spec-Driven Development (SDD) Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqgeo_sdd_spec.md)
- [LocqEngine Core SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqengine_sdd_spec.md)
- [LocqConsole Enterprise Dashboard SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqconsole_sdd_spec.md)
- [LocqDrop Consumer PWA SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqdrop_sdd_spec.md)
- [LocqVerify Consumer PWA SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqverify_sdd_spec.md)
- [LocqGeo Functional Requirements Document (FRD)](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqgeo_frd.md)

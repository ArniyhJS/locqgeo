# SpottGeo Functional Requirements Document (FRD)

Document Version: 3.2.0

## 1. Functional Requirements Matrix

### 1.1 Enterprise B2B Dashboard (SpottConsole)

- **FRD-OS-01**: Campaign creation wizard allowing budget allocation, geofence radius definition, tenant float balance funding, and payout mechanism selection.
- **FRD-OS-02**: Executive dashboard analytics showing active drops, claim success rate, pre-aggregated daily telemetry summaries, and blocked fraud attempts.
- **FRD-OS-03**: Real-time telemetry log feed with anti-cheat rule violation breakdowns and spoof risk score metrics.

### 1.2 Consumer PWA (SpottDrop)

- **FRD-DROP-01**: Radar map view calculating current distance to active drops using spatial queries.
- **FRD-DROP-02**: Single-tap claim verification triggering Fastify `/api/v1/engine/verify` validation.
- **FRD-DROP-03**: Mobile wallet showing accumulated rewards with instant airtime/data top-up, Paystack bank transfer, and fallback internal `user_wallets` crediting.
- **FRD-DROP-04**: PWA manifest & service worker offline caching capabilities.

### 1.3 Consumer PWA (SpottVerify)

- **FRD-VERIFY-01**: Multi-input verification scanner (QR code, NFC tag, Bluetooth beacon, and manual location code) for standalone event attendance and check-in without gamification requirements.
- **FRD-VERIFY-02**: Offline verification queue that stores payloads and syncs with the engine upon network restoration.
- **FRD-VERIFY-03**: Progressive identity linking, allowing anonymous verifications to be later associated with a user profile.

### 1.4 Core Engine & Microservices (SpottEngine)

- **FRD-ENGINE-01**: Fastify HTTP server capable of handling sub-50ms ping responses.
- **FRD-ENGINE-02**: Zod v4 schema validation via `@spottgeo/api-contracts`.
- **FRD-ENGINE-03**: 4-Step Anti-Cheat evaluation emitting `REJECTED_ACCURACY`, `REJECTED_VELOCITY`, and `REJECTED_SPOOF` status codes with accumulated `spoof_score`.
- **FRD-ENGINE-04**: Decoupled `@spottgeo/payout-worker` service executing queued payouts with primary (Paystack/VTpass), secondary (Flutterwave), and internal wallet fallback cascades.
- **FRD-ENGINE-05**: Decoupled `@spottgeo/webhook-dispatcher` service dispatching HMAC SHA-256 signed event notifications to enterprise endpoints.
- **FRD-ENGINE-06**: Decoupled `@spottgeo/analytics-worker` pre-aggregating daily verification trends and active campaign stats for dashboard caching.

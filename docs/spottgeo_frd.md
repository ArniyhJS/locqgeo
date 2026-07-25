# SpottGeo Functional Requirements Document (FRD)

Document Version: 3.1.0

## 1. Functional Requirements Matrix

### 1.1 Enterprise B2B Dashboard (SpottConsole)
- **FRD-OS-01**: Campaign creation wizard allowing budget allocation, geofence radius definition, and payout mechanism selection.
- **FRD-OS-02**: Executive dashboard analytics showing active drops, claim success rate, and blocked fraud attempts.
- **FRD-OS-03**: Real-time telemetry log feed with anti-cheat rule violation breakdowns.

### 1.2 Consumer PWA (SpottDrop)
- **FRD-DROP-01**: Radar map view calculating current distance to active drops using spatial queries.
- **FRD-DROP-02**: Single-tap claim verification triggering Fastify `/api/v1/engine/verify` validation.
- **FRD-DROP-03**: Mobile wallet showing accumulated rewards with instant airtime/data top-up and Paystack bank transfer.
- **FRD-DROP-04**: PWA manifest & service worker offline caching capabilities.

### 1.3 Consumer PWA (SpottVerify)
- **FRD-VERIFY-01**: QR code scanner for standalone event attendance and check-in without gamification requirements.
- **FRD-VERIFY-02**: Offline verification queue that stores payloads and syncs with the engine upon network restoration.
- **FRD-VERIFY-03**: Progressive identity linking, allowing anonymous verifications to be later associated with a user profile.

### 1.4 Core Engine (SpottEngine)
- **FRD-ENGINE-01**: Fastify HTTP server capable of handling sub-50ms ping responses.
- **FRD-ENGINE-02**: Zod schema validation via `@spottgeo/api-contracts`.
- **FRD-ENGINE-03**: Asynchronous payout execution with unique idempotency keys.

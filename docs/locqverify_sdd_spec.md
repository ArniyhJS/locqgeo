# LocqVerify Attendance & Credential PWA — Spec-Driven Development (SDD) Technical Specification

Document Version: 3.3.0

Workspace Path: `apps/verify`

Tech Stack: Next.js 16+ (App Router PWA) + React 19 + TypeScript + Tailwind CSS + HTML5 Geolocation API + @zxing/library + IndexedDB / idb-keyval

Target AI Agents: Cursor, Antigravity, Windsurf, Aider, Claude Code

---

## 1. System Invariants & Mobile Guardrails

Every React component, custom hook, service worker, and API client inside `apps/verify` MUST enforce the following immutable client-side invariants:

1. **Trustless Attendance Invariant**: LocqVerify MUST guarantee single-time, non-duplicable attendance verification per session or event. A user or device scanner CANNOT register duplicate check-ins for the same geofence node within an active session window. All verification claims are cryptographically signed and stored in LocqEngine with idempotent transaction locks.
2. **Sub-1-Second Scanner Latency Invariant**: The camera scan-to-verification feedback loop MUST render feedback in $< 1.0\text{ second}$ on physical mobile devices. Upon QR payload detection, the UI MUST immediately display visual state (green pulsing badge), trigger haptic feedback (`navigator.vibrate([50, 30, 50])`), and play an audio confirmation chime before network round-trip completion to maximize event entrance throughput.
3. **Offline Queueing & Background Sync Invariant**: In event venues with poor cellular reception or congested Wi-Fi, the scanner MUST store scanned attendance records locally in IndexedDB using `idb-keyval`. Each offline record MUST capture the original scan timestamp (`scanned_at`) and monotonic clock duration delta (`monotonic_delta_ms`). When internet connectivity is restored, a Service Worker background sync process dispatches queued records in batches using exponential backoff while validating clock integrity to prevent timestamp forgery.
4. **Progressive Identity Backfill Invariant**: By default, attendance scanning is completely anonymous and frictionless, identified only by an ephemeral device fingerprint (`device_id`) or guest session token. When an attendee subsequently chooses to claim a digital badge, CPE/CEU certificate, or link their account via phone number or email, LocqVerify MUST automatically backfill all past anonymous attendance records stored locally to their unified LocqGeo user profile.
5. **Cross-PWA Handshake & Deep-Link Invariant**: If a user scans a LocqDrop reward QR code or non-attendance payload inside LocqVerify, the app MUST parse the payload, extract the embedded `geofence_id` or campaign parameter, and perform a seamless deep-link handoff to `apps/drop` (`LocqDrop`) without throwing unhandled execution errors or resetting scanner state.

---

## 2. Shared Type Contracts & Client Schemas

Located in `packages/api-contracts/src/verify.schema.ts` and consumed directly by LocqVerify client hooks and API routes:

```typescript
import { z } from "zod";

// 1. Attendance Scan Input Schema
// Accepts static QR posters and dynamic HMAC signed QR codes with GPS location & device entropy
export const VerifyScanPayloadSchema = z.object({
  geofence_id: z.string().uuid("geofence_id must be a valid UUID v4"),
  campaign_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  device_id: z.string().min(32, "device_id must be at least 32 hex characters"),
  timestamp: z.number().int().positive("timestamp must be a positive unix epoch in milliseconds"),
  nonce: z.string().min(8, "nonce must be at least 8 characters"),
  hmac: z.string().length(64, "hmac must be a 64-character SHA-256 hex string").optional(),
  latitude: z.number().min(-90.0).max(90.0),
  longitude: z.number().min(-180.0).max(180.0),
  accuracy_meters: z.number().min(0.0),
  scanned_at: z.number().int().positive(),
  monotonic_delta_ms: z.number().nonnegative(),
});

export type VerifyScanPayload = z.infer<typeof VerifyScanPayloadSchema>;

// 2. Attendee Digital Credential Schema
// Metadata for issued attendance badges, certificates, and CPE/CEU credits
export const AttendeeCredentialSchema = z.object({
  credential_id: z.string().uuid(),
  event_id: z.string().uuid(),
  event_name: z.string().min(1),
  attendee_id: z.string().uuid().optional(),
  attendee_name: z.string().optional(),
  issued_at: z.string().datetime(),
  badge_type: z.enum(["ATTENDEE", "SPEAKER", "VIP", "STAFF", "EXHIBITOR", "CERTIFICATE"]),
  cpe_credits: z.number().nonnegative().optional(),
  verification_hash: z.string().length(64),
  qr_verification_url: z.string().url(),
});

export type AttendeeCredential = z.infer<typeof AttendeeCredentialSchema>;

// 3. Organizer Gate Scanner Mode Schema
// Authentication & configuration payload for event staff conducting high-throughput gate scans
export const OrganizerScannerModeSchema = z.object({
  staff_user_id: z.string().uuid(),
  event_id: z.string().uuid(),
  gate_id: z.string().min(1, "gate_id is required"),
  mode: z.enum(["STAFF_GATE_SCANNER", "SELF_CHECKIN"]),
  device_attestation_token: z.string().min(16),
  offline_sync_batch_size: z.number().int().min(1).max(100).default(50),
  bulk_checkin_payloads: z.array(VerifyScanPayloadSchema).optional(),
});

export type OrganizerScannerMode = z.infer<typeof OrganizerScannerModeSchema>;
```

---

## 3. Dynamic HMAC QR Security & Anti-Replay Specification

To prevent ticket fraud, attendee proxy check-ins, and static screenshot sharing, venue displays (e.g., entrance screens or rotating kiosks) generate dynamic HMAC-SHA256 QR codes that cycle every 15 to 30 seconds.

### 3.1 Cryptographic Signature Calculation

The dynamic QR payload string encodes the `geofence_id`, Unix timestamp (in milliseconds), a cryptographically secure random `nonce`, and the calculated `hmac`:

$$\text{HMAC-SHA256}(\text{geofence\_id} \parallel \text{":"} \parallel \text{timestamp} \parallel \text{":"} \parallel \text{nonce}, \text{tenant\_secret})$$

```typescript
import { createHmac } from "crypto";

export function generateDynamicVerifyQrPayload(
  geofenceId: string,
  tenantSecret: string,
  expirationSeconds: number = 60
): { geofence_id: string; timestamp: number; nonce: string; hmac: string } {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const rawPayload = `${geofenceId}:${timestamp}:${nonce}`;
  
  const hmac = createHmac("sha256", tenantSecret)
    .update(rawPayload)
    .digest("hex");

  return { geofence_id: geofenceId, timestamp, nonce, hmac };
}
```

### 3.2 Server Verification & Anti-Replay Validation

When `apps/verify` submits a scan payload to LocqEngine (`POST /api/v1/engine/verify`), LocqEngine validates the signature and sliding time window:

1. **Sliding Time Window Validation**:
   $$|\text{current\_time} - \text{timestamp}| > 60\text{ seconds} \implies \text{REJECTED\_EXPIRED\_PAYLOAD}$$
2. **Replay Cache Lock**: The pair `(geofence_id, nonce)` is cached in Redis with a 120-second TTL. If the `nonce` has already been seen for the given geofence, the check-in is rejected:
   $$\text{nonce\_seen} \implies \text{REJECTED\_DUPLICATE}$$
3. **HMAC Signature Audit**:
   $$\text{computed\_hmac} \neq \text{payload\_hmac} \implies \text{REJECTED\_SPOOF}$$

---

## 4. Client & Organizer Execution Flowchart

```
                 +-------------------------------------------------------+
                 |            Select Mode: Self / Organizer              |
                 +---------------------------+---------------------------+
                                             |
                      +----------------------+----------------------+
                      |                                             |
                      v                                             v
        [ Attendee Self-Scan Mode ]                   [ Staff Gate Scanner Mode ]
                      |                                             |
                      v                                             v
     +----------------------------------+          +----------------------------------+
     | Obtain HTML5 GPS Position        |          | Load Staff Attestation Token     |
     | navigator.geolocation            |          | Set Gate ID & Sync Batch Size    |
     +----------------+-----------------+          +----------------+-----------------+
                      |                                             |
             Accuracy Guard Check                                   |
           (accuracy_meters <= 50m)                                 |
                      |                                             |
             Pass     |     Fail                                    |
        +-------------+-------------+                               |
        |                           |                               |
        v                           v                               |
+---------------+   +-------------------------------+               |
| Open ZXing    |   | Display GPS Warning Modal:    |               |
| Camera Reader |   | "Step near clear sky / venue  |               |
+-------+-------+   | entrance for accurate GPS."   |               |
        |           +-------------------------------+               |
        |                                                           |
        +---------------------------+-------------------------------+
                                    |
                             QR Code Scanned
                                    |
                                    v
            +-----------------------------------------------+
            | Sub-1s Latency UI Feedback Loop               |
            | - Pulse Green Scanner Border                  |
            | - Trigger Haptic Vibration: [50, 30, 50]ms    |
            | - Play Audio Chime: confirmation.mp3          |
            +-----------------------+-----------------------+
                                    |
            +-----------------------+-----------------------+
            | Monotonic Clock Delta & Payload Extraction    |
            | monotonic_delta_ms = performance.now() - start|
            | Is payload LocqDrop reward QR?               |
            +-----------------------+-----------------------+
                                    |
                        No          |          Yes (Cross-PWA Handshake)
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-------------------------------+               +-------------------------------+
| Check Network Connectivity    |               | Deep-Link Handshake to Drop   |
+-------+---------------+-------+               | window.location.href =        |
        |               |                       | "https://drop.locqgeo.com/.."|
    Online           Offline                    +-------------------------------+
        |               |
        v               v
+---------------+ +---------------------------------------------------+
| POST Ping to  | | Save to IndexedDB (idb-keyval) Queue              |
| LocqEngine   | | - Store scanned_at + monotonic_delta_ms           |
+-------+-------+ | - Service Worker Background Sync handles dispatch |
        |         |   when online connection resumes                   |
        |         +-------------------------+-------------------------+
        |                                   |
        |                            Connection Restored
        |                                   |
        +-----------------------------------+
        |
Response Received from Engine
        |
  +-----+-----+
  |           |
200 OK     4xx/5xx Error
  |           |
  v           v
+-------------------------------+ +-----------------------------------+
| Check-in Verified!            | | Display Specific Rejection Error: |
| - Issue Digital Badge         | | REJECTED_EXPIRED_PAYLOAD (QR >60s)|
| - Prompt Progressive Identity | | REJECTED_DUPLICATE (Already checked)|
|   Backfill (Phone/Email Link) | | REJECTED_OUT_OF_BOUNDS (Far away) |
| - Store in Local Badge Wallet | | REJECTED_SPOOF (HMAC/Clock failure|
+-------------------------------+ +-----------------------------------+
```

---

## 5. System Prompt Directive for AI Agents

> "You are building the LocqVerify attendance and credential PWA inside apps/verify following locqverify_sdd_spec.md. Enforce trustless single check-in invariants and deliver a sub-1-second scan feedback loop with immediate haptic and visual cues. Validate incoming scanner payloads using VerifyScanPayloadSchema from @locqgeo/api-contracts. Verify dynamic HMAC-SHA256 signatures and enforce the 60-second sliding expiration window (REJECTED_EXPIRED_PAYLOAD). Maintain local offline attendance queues in IndexedDB via idb-keyval with monotonic clock delta tracking (monotonic_delta_ms) to preserve event session integrity. Support Organizer Scanner Mode for staff gate scanning with bulk batching. Enable progressive identity backfill so anonymous attendees can claim badges and link their phone/email seamlessly post-event. Handle cross-PWA handshakes gracefully when LocqDrop QR payloads are scanned."

---

## 6. Related Documents

- [LocqGeo Master SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqgeo_sdd_spec.md)
- [LocqEngine Core SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqengine_sdd_spec.md)
- [LocqConsole SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqconsole_sdd_spec.md)
- [LocqDrop SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqdrop_sdd_spec.md)
- [LocqVerify SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqverify_sdd_spec.md)
- [LocqGeo Functional Requirements Document (FRD)](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/locqgeo-monorepo/docs/locqgeo_frd.md)

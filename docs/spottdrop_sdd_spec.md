# SpottDrop Consumer PWA — Spec-Driven Development (SDD) Technical Specification

Document Version: 3.3.0

Workspace Path: `apps/drop`

Tech Stack: Next.js 15+ (App Router PWA) + React 19 + TypeScript + Tailwind CSS + HTML5 Geolocation API + @zxing/library + Leaflet + IndexedDB / idb-keyval

Target AI Agents: Cursor, Antigravity, Windsurf, Aider, Claude Code

---

## 1. System Invariants & Mobile Guardrails

Every React component, custom hook, service worker, and API client inside `apps/drop` MUST enforce the following immutable client-side invariants:

1. **Strict Data Budget Invariant**: The total uncompressed JavaScript/CSS bundle transferred on initial PWA load MUST NOT exceed $2.0\text{ MB}$. Media assets and map tile vectors MUST be lazy-loaded on demand to minimize mobile data consumption for commuters.
2. **Device Hardware Identifier**: Upon first launch, the PWA MUST generate and store a deterministic, cryptographic device fingerprint (`device_id`) in `localStorage`. The string must be 32-128 hex characters long, combining WebGL context metrics, canvas hashes, user-agent details, and screen resolution:

$$\text{device\_id} = \text{SHA256}(\text{canvas\_hash} \parallel \text{webgl\_vendor} \parallel \text{screen\_res} \parallel \text{user\_agent} \parallel \text{installation\_uuid})$$

3. **Event-Driven Geolocation Polling**: Continuous background GPS polling is strictly prohibited to save battery and network data. GPS sampling MUST ONLY trigger upon explicit user interaction (e.g., clicking "Scan Node" or "Verify Proximity").
4. **Client-Side Accuracy Filter**: The client app MUST inspect the GPS position accuracy returned by the `navigator.geolocation` API. If $\text{accuracy\_meters} > 50.0\text{m}$, the scanner MUST prompt the user to step into an open area before dispatching a ping to SpottEngine:

$$\text{accuracy\_meters} \le 50.0 \implies \text{Proceed to Ping Dispatch}$$

5. **Offline Claim Queueing & Clock Integrity**: If a user scans a physical node in an area with zero cellular connectivity, the payload MUST be encrypted and stored locally in IndexedDB along with the original scan timestamp (`scanned_at`) and monotonic clock duration delta (`monotonic_delta_ms`). Offline sync MUST observe drop type time windows (15 minutes for Flash Drops, 24 hours for standard drops). A service worker background sync task MUST retry transmission using exponential backoff when connectivity is restored while preserving daily loyalty streak metrics.
6. **Minimum Withdrawal Thresholds**: To prevent micro-transaction fee drain and guarantee payment processor efficiency, payout redemptions inside SpottDrop MUST enforce minimum withdrawal thresholds: a minimum of $\text{₦}50$ for airtime/mobile data top-ups processed via VTpass, and a minimum of $\text{₦}500$ for direct bank account transfers processed via Paystack. Direct bank transfers MUST present a transparent fee disclosure UI (e.g., standard $\text{₦}10-\text{₦}25$ transfer processing fee) prior to transaction confirmation.
7. **Cross-PWA Payload Deep-Link Handling**: If a user scans a dynamic HMAC QR code generated for SpottVerify (or accesses a `verify.spottgeo.com` deep link) inside SpottDrop, the PWA MUST gracefully parse the payload, extract the underlying `geofence_id` if valid for consumer reward claims, or execute a smooth deep-link handoff to `apps/verify` (`SpottVerify`) without raising unhandled syntax or runtime execution errors.

---

## 2. Shared Type Contracts & Client Schemas

Located in `packages/api-contracts/src/drop.schema.ts` and consumed directly by SpottDrop client hooks and server route handlers:

```typescript
import { z } from "zod";

// 1. QR Payload & Scanner Input Schemas
// The PWA accepts QR codes, NFC tags, BLE beacon payloads, dynamic HMAC payloads, deep-link URLs, and manual aliases.
// All input mechanisms resolve to a geofence_id (UUID) or alias before dispatching a ping.
export const QrScanPayloadSchema = z.object({
  geofence_id: z.string().uuid("Invalid QR Code: geofence_id must be a valid UUID v4"),
  tenant_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
  checksum: z.string().min(8).optional(),
  timestamp: z.number().int().positive("timestamp must be a positive integer unix epoch").optional(),
  nonce: z.string().min(8, "nonce must be at least 8 characters").optional(),
  hmac: z.string().length(64, "hmac must be a 64-character SHA-256 hex string").optional(),
});

export type QrScanPayload = z.infer<typeof QrScanPayloadSchema>;

// 2. Client Geolocation & Device Context
export const ClientLocationStateSchema = z.object({
  latitude: z.number().min(-90.0).max(90.0),
  longitude: z.number().min(-180.0).max(180.0),
  accuracy_meters: z.number().min(0.0),
  altitude_meters: z.number().nullable().optional(),
  timestamp: z.number().int().positive(),
});

export type ClientLocationState = z.infer<typeof ClientLocationStateSchema>;

// 3. Local Wallet & Claim Storage Schema
export const LocalClaimRecordSchema = z.object({
  claim_id: z.string().uuid(),
  node_id: z.string().uuid(),
  node_title: z.string(),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z.number(),
  claimed_at: z.string().datetime(),
  payout_status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED"]),
  redemption_code: z.string().optional(),
  scanned_at: z.number().int().positive().optional(),
  monotonic_delta_ms: z.number().nonnegative().optional(),
});

export type LocalClaimRecord = z.infer<typeof LocalClaimRecordSchema>;
```

---

## 3. Client-Side Cryptographic Device Fingerprinter

Located in `apps/drop/lib/fingerprint.ts`:

```typescript
export async function getOrCreateDeviceId(): Promise<string> {
  const STORAGE_KEY = "spott_device_id_v1";
  const existingId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

  if (existingId && existingId.length >= 32) {
    return existingId;
  }

  // Generate Hardware & Browser Entropy
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let canvasHash = "";
  if (ctx) {
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("SpottGeo,PoL#1", 2, 15);
    canvasHash = canvas.toDataURL();
  }

  const screenRes = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const userAgent = navigator.userAgent;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const randomEntropy = window.crypto.randomUUID();

  const rawEntropyString = `${canvasHash}|${screenRes}|${userAgent}|${timeZone}|${hardwareConcurrency}|${randomEntropy}`;

  // SHA-256 Digest
  const encoder = new TextEncoder();
  const data = encoder.encode(rawEntropyString);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const deviceId = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}
```

---

## 4. Deterministic Client Claim Execution Flow

```
                      [ User Taps "Scan Billboard" ]
                                    |
                                    v
                     +-----------------------------+
                     | Request HTML5 GPS Location  |
                     | navigator.geolocation       |
                     +--------------+--------------+
                                    |
                          Pass      |      Fail / Timeout
                     +--------------+--------------+
                     |                             |
                     v                             v
     +-------------------------------+   +-------------------------------+
     | Accuracy Guard Check          |   | Display Error Modal:          |
     | (If accuracy_meters > 50.0m)  |   | "GPS Signal Weak. Step outside|
     +---------------+---------------+   | to verify your location."     |
                     |                   +-------------------------------+
            Pass     |     Fail
       +-------------+-------------+
       |                           |
       v                           v
+------------------------------+  +-------------------------------+
| Open Web Camera Reader       |  | Display Accuracy Warning:     |
| ZXing Browser QR Decoder     |  | "GPS Accuracy is 72m. Move to |
+--------------+---------------+  | clear sky for accurate scan." |
               |                  +-------------------------------+
      QR Parsed
               v
+-----------------------------------------------------------------+
| Calculate Client Monotonic Clock Delta                          |
| monotonic_delta_ms = window.performance.now() - scan_start_time |
| Capture scanned_at timestamp (ISO 8601 / Unix epoch ms)        |
+--------------+--------------------------------------------------+
               |
    Network Status Check
      /          \
  Online         Offline
    /              \
   v                v
+-----------------------------+   +---------------------------------------+
| Dispatch POST               |   | Check Offline Sync Window Expiration  |
| /api/v1/engine/verify       |   | - Flash Drop Node: <= 15 minutes      |
| { device_id, latitude,      |   | - Standard Node:   <= 24 hours        |
|   longitude, accuracy_m,    |   +-------------------+-------------------+
|   node_id, scanned_at,      |                       |
|   monotonic_delta_ms,       |              Valid    |    Expired (> Window)
|   hmac, nonce }             |          +------------+------------+
+--------------+--------------+          |                         |
               |                         v                         v
               |          +----------------------------+ +-----------------+
               |          | Encrypt & Save to IndexedDB| | Reject Claim    |
               |          | Service Worker retries     | | "Offline claim  |
               |          | sync with monotonic_delta  | | expired. Daily  |
               |          | to preserve loyalty streak | | streak reset."  |
               |          +-------------+--------------+ +-----------------+
               |                        |
               |                Online Restored
               |                        |
               +------------------------+
               |
      Response Received
               v
  +------------+------------+
  |                         |
200 OK                   422 / 400 Error
  |                         |
  v                         v
+----------------------+  +---------------------------------------+
| Display Success Screen| | Display Specific Fraud/System Error:  |
| - Play Haptic Bump   |  | REJECTED_SPOOF -> Clock/GPS anomaly   |
| - Show Reward Badge  |  | REJECTED_EXPIRED_PAYLOAD -> QR > 60s  |
| - Save to Local Wallet| | REJECTED_RATE_LIMIT -> Max 5 req/60s  |
| - Update Loyalty     |  | ERR_DUPLICATE_CLAIM -> Already claimed|
|   Streak             |  | ERR_OUT_OF_BOUNDS  -> Too far away    |
+----------------------+  +---------------------------------------+
```

---

## 5. System Prompt Directive for AI Agents

> "You are building the SpottDrop consumer PWA inside apps/drop following spottdrop_sdd_spec.md. Always capture GPS coordinates via HTML5 navigator.geolocation with enableHighAccuracy: true and enforce the $\le 50.0\text{m}$ accuracy filter on the client before calling SpottEngine. Read and write client device identifiers using getOrCreateDeviceId() from @/lib/fingerprint. Validate incoming QR code payloads using QrScanPayloadSchema from @spottgeo/api-contracts. Support dynamic HMAC QR payloads ({ geofence_id, timestamp, nonce, hmac }) and offline sync windows (15 minutes for Flash Drops, 24 hours for standard drops) with client monotonic clock delta tracking (monotonic_delta_ms) to preserve daily loyalty streaks. Enforce minimum withdrawal thresholds (₦50 airtime/data via VTpass, ₦500 Paystack bank transfer with fee disclosure). Ensure all user UI screens load in under 1 second on 3G network connections by deferring Leaflet map rendering until explicitly toggled."

---

## 6. Related Documents

- [SpottGeo Master SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottgeo_sdd_spec.md)
- [SpottEngine Core SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottengine_sdd_spec.md)
- [SpottConsole SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottconsole_sdd_spec.md)
- [SpottVerify SDD Specification](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottverify_sdd_spec.md)
- [SpottGeo Functional Requirements Document (FRD)](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/spottgeo_frd.md)

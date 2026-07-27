# SpottDrop Consumer PWA — Spec-Driven Development (SDD) Technical Specification

Document Version: 1.0.0

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

5. **Offline Claim Queueing**: If a user scans a physical node in an area with zero cellular connectivity, the payload MUST be encrypted and stored locally in IndexedDB. A service worker background sync task MUST retry transmission using exponential backoff when connectivity is restored.

---

## 2. Shared Type Contracts & Client Schemas

Located in `packages/api-contracts/src/drop.schema.ts` and consumed directly by SpottDrop client hooks and server route handlers:

```typescript
import { z } from "zod";

// 1. QR Payload & Scanner Input Schemas
// The PWA accepts QR codes, NFC tags, BLE beacon payloads, deep-link URLs, and manual aliases.
// All input mechanisms resolve to a geofence_id (UUID) or alias before dispatching a ping.
export const QrScanPayloadSchema = z.object({
  geofence_id: z.string().uuid("Invalid QR Code: geofence_id must be a valid UUID v4"),
  tenant_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
  checksum: z.string().min(8).optional(),
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
| Dispatch POST /api/v1/engine/verify Payload to SpottEngine            |
| { device_id, latitude, longitude, accuracy_meters, node_id }    |
+--------------+--------------------------------------------------+
               |
      Response Received
               v
  +------------+------------+
  |                         |
200 OK                   422 / 400 Error
  |                         |
  v                         v
+----------------------+  +---------------------------------------+
| Display Success Screen| | Display Specific Fraud Error:         |
| - Play Haptic Bump   |  | ERR_IMPOSSIBLE_SPEED -> Speed warning |
| - Show Reward Badge  |  | ERR_DUPLICATE_CLAIM -> Already claimed|
| - Save to Local Wallet| | ERR_OUT_OF_BOUNDS  -> Too far away    |
+----------------------+  +---------------------------------------+
```

---

## 5. System Prompt Directive for AI Agents

> "You are building the SpottDrop consumer PWA inside apps/drop following spottdrop_sdd_spec.md. Always capture GPS coordinates via HTML5 navigator.geolocation with enableHighAccuracy: true and enforce the $\le 50.0\text{m}$ accuracy filter on the client before calling SpottEngine. Read and write client device identifiers using getOrCreateDeviceId() from @/lib/fingerprint. Validate incoming QR code payloads using QrScanPayloadSchema from @spottgeo/api-contracts. Ensure all user UI screens load in under 1 second on 3G network connections by deferring Leaflet map rendering until explicitly toggled."

# Sub-Project 3: Real-Time Telemetry Event Stream — Design Spec

## Overview

Provides real-time broadcasting of presence verification telemetry events (`VERIFIED`, `VERIFIED_FLAGGED`, `REJECTED_SPOOF`) from `services/engine` via Server-Sent Events (SSE) to the SpottConsole dashboard (`apps/console`).

---

## 1. SSE Stream Route & Service (`services/engine`)

### Endpoint
- `GET /api/v1/engine/telemetry/stream`
- Headers:
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`

### `TelemetryStreamManager` (`services/engine/src/services/telemetry-stream.ts`)
- Maintains active client set `Set<FastifyReply>`.
- `addClient(reply)` / `removeClient(reply)` handles connection lifecycle.
- `broadcastEvent(payload)` formats SSE message frame:
  ```
  event: telemetry
  data: {"pingId":"...","deviceId":"...","status":"VERIFIED","spoofScore":12,"timestamp":"..."}
  ```

---

## 2. SpottConsole Live Consumer (`apps/console`)

- **`apps/console/src/hooks/useTelemetryStream.ts`**: React hook consuming `EventSource` from engine SSE endpoint.
- Returns `{ events: TelemetryEvent[], isConnected: boolean }`.

---

## 3. Testing
- `services/engine/test/telemetry-stream.test.ts`: Unit tests verifying client registration, SSE frame formatting, and broadcast dispatching.

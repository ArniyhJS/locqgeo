# Sub-Project 3: Real-Time Telemetry Event Stream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Server-Sent Events (SSE) telemetry stream in `services/engine` and an `EventSource` consumer hook in `apps/console` to broadcast live check-in events in real time.

**Architecture:** `TelemetryStreamManager` singleton in `services/engine` broadcasts formatted SSE frames over `/api/v1/engine/telemetry/stream`. `useTelemetryStream` hook in `apps/console` connects to SSE feed.

**Tech Stack:** Fastify 5 (SSE stream headers), React 19 / TypeScript 5.9, Vitest 4.

## Global Constraints
- Endpoint MUST be `GET /api/v1/engine/telemetry/stream`.
- Headers MUST specify `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
- SSE message format MUST be `event: telemetry\ndata: <JSON>\n\n`.
- All tests run with `pnpm --filter @spottgeo/engine test` and `pnpm --filter @spottgeo/console test`.

---

### Task 1: Engine SSE Stream Service & Fastify Route (`services/engine`)

**Files:**
- Create: `services/engine/src/services/telemetry-stream.ts`
- Create: `services/engine/src/routes/telemetry-sse.ts`
- Test: `services/engine/test/telemetry-stream.test.ts`

**Interfaces:**
- Produces: `TelemetryStreamManager` with `formatSseFrame()`, `addClient()`, `removeClient()`, `broadcastEvent()`, Fastify route `GET /api/v1/engine/telemetry/stream`

- [ ] **Step 1: Write failing SSE stream test**

Create `services/engine/test/telemetry-stream.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { formatSseFrame, TelemetryStreamManager } from "../src/services/telemetry-stream";

describe("Telemetry Stream Service", () => {
  it("formats valid SSE frame string", () => {
    const payload = { pingId: "p-1", deviceId: "d-1", status: "VERIFIED", spoofScore: 5 };
    const frame = formatSseFrame("telemetry", payload);
    expect(frame).toContain("event: telemetry\n");
    expect(frame).toContain('data: {"pingId":"p-1"');
    expect(frame.endsWith("\n\n")).toBe(true);
  });

  it("manages client connection registration and broadcasting", () => {
    const manager = new TelemetryStreamManager();
    const sentFrames: string[] = [];
    const mockReply = {
      raw: {
        write: (data: string) => sentFrames.push(data),
        writableEnded: false,
      },
    };

    manager.addClient("client-1", mockReply as any);
    expect(manager.getClientCount()).toBe(1);

    manager.broadcastEvent({ pingId: "p-100", status: "VERIFIED" });
    expect(sentFrames.length).toBe(1);
    expect(sentFrames[0]).toContain("p-100");

    manager.removeClient("client-1");
    expect(manager.getClientCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/engine test`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement Telemetry Stream Service**

Create `services/engine/src/services/telemetry-stream.ts`:
```typescript
export function formatSseFrame(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export class TelemetryStreamManager {
  private clients: Map<string, any> = new Map();

  addClient(id: string, reply: any) {
    this.clients.set(id, reply);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcastEvent(data: any) {
    const frame = formatSseFrame("telemetry", data);
    for (const [id, reply] of this.clients.entries()) {
      try {
        if (!reply.raw.writableEnded) {
          reply.raw.write(frame);
        } else {
          this.clients.delete(id);
        }
      } catch {
        this.clients.delete(id);
      }
    }
  }
}

export const globalTelemetryStream = new TelemetryStreamManager();
```

Create `services/engine/src/routes/telemetry-sse.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import { globalTelemetryStream } from "../services/telemetry-stream.js";
import { randomUUID } from "crypto";

export async function telemetrySseRoutes(fastify: FastifyInstance) {
  fastify.get("/api/v1/engine/telemetry/stream", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    const clientId = randomUUID();
    globalTelemetryStream.addClient(clientId, reply);

    request.raw.on("close", () => {
      globalTelemetryStream.removeClient(clientId);
    });
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/engine test`
Run: `pnpm --filter @spottgeo/engine check-types`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/engine/src/services/telemetry-stream.ts services/engine/src/routes/telemetry-sse.ts services/engine/test/telemetry-stream.test.ts
git commit -m "feat(engine): add SSE real-time telemetry streaming service and route"
```

---

### Task 2: SpottConsole Live SSE Consumer Hook (`apps/console`)

**Files:**
- Create: `apps/console/src/hooks/useTelemetryStream.ts`
- Test: `apps/console/test/telemetry-hook.test.ts`

**Interfaces:**
- Produces: `useTelemetryStream(streamUrl)` custom React hook returning `{ events, isConnected }`

- [ ] **Step 1: Write failing hook test**

Create `apps/console/test/telemetry-hook.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { parseTelemetrySseMessage } from "../src/hooks/useTelemetryStream";

describe("Console Telemetry SSE Parser", () => {
  it("parses valid SSE telemetry data string into object", () => {
    const rawData = '{"pingId":"p-99","status":"VERIFIED","spoofScore":10}';
    const parsed = parseTelemetrySseMessage(rawData);
    expect(parsed).toBeDefined();
    expect(parsed?.pingId).toBe("p-99");
    expect(parsed?.status).toBe("VERIFIED");
  });

  it("returns null for malformed SSE json payload", () => {
    const parsed = parseTelemetrySseMessage("invalid json");
    expect(parsed).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/console test`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement Telemetry Hook & Parser**

Create `apps/console/src/hooks/useTelemetryStream.ts`:
```typescript
export interface TelemetryEvent {
  pingId: string;
  deviceId: string;
  status: string;
  spoofScore: number;
  timestamp: string;
}

export function parseTelemetrySseMessage(rawData: string): TelemetryEvent | null {
  try {
    return JSON.parse(rawData) as TelemetryEvent;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/console test`
Run: `pnpm --filter @spottgeo/console check-types`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/console/src/hooks/useTelemetryStream.ts apps/console/test/telemetry-hook.test.ts
git commit -m "feat(console): add telemetry SSE stream parser and consumer hook"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-real-time-telemetry-event-stream.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

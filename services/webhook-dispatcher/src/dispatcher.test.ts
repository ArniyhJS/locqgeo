import { describe, it, expect, beforeEach, vi } from "vitest";

const mockExecute = vi.fn();

vi.mock("@spottgeo/database", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""),
}));

import { WebhookDispatcherService } from "./dispatcher.js";

describe("WebhookDispatcherService", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("generates a valid HMAC SHA-256 webhook signature", () => {
    const payload = JSON.stringify({ event: "verification.created" });
    const secret = "whsec_test123";
    const sig = WebhookDispatcherService.generateSignature(payload, secret);

    expect(sig).toBeDefined();
    expect(typeof sig).toBe("string");
    expect(sig.length).toBe(64); // Hex encoded SHA-256
  });

  it("dispatches pending webhooks for recent verifications", async () => {
    mockExecute.mockResolvedValueOnce([
      {
        id: "v-001",
        geofenceId: "g-001",
        deviceId: "d-001",
        status: "VERIFIED",
        payoutStatus: "COMPLETED",
        createdAt: new Date(),
      },
    ]);

    const result = await WebhookDispatcherService.dispatchPendingWebhooks(10);

    expect(result.sentCount).toBe(1);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(0);
  });
});

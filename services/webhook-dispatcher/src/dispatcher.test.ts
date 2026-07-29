import { describe, it, expect, beforeEach, vi } from "vitest";

const mockExecute = vi.fn();

vi.mock("@spottgeo/database", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""),
}));

import { WebhookDispatcherService, calculateNextRetryInterval } from "./dispatcher.js";

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

  it("calculates exponential backoff intervals correctly", () => {
    expect(calculateNextRetryInterval(1)).toBe(15);
    expect(calculateNextRetryInterval(2)).toBe(60);
    expect(calculateNextRetryInterval(3)).toBe(300);
    expect(calculateNextRetryInterval(4)).toBe(900);
    expect(calculateNextRetryInterval(5)).toBe(3600);
    expect(calculateNextRetryInterval(6)).toBe(3600);
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";

let mockExecute = vi.fn();

vi.mock("@spottgeo/database", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""),
}));

import { PayoutWorkerService } from "./worker.js";

describe("PayoutWorkerService", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("processes queued payout jobs successfully", async () => {
    mockExecute
      .mockResolvedValueOnce([
        {
          id: "v-001",
          geofenceId: "g-001",
          deviceId: "d-001",
          rewardType: "AIRTIME",
          rewardAmount: 100,
          rewardCurrency: "NGN",
        },
      ]) // SELECT pending jobs
      .mockResolvedValueOnce(undefined); // UPDATE status COMPLETED

    const result = await PayoutWorkerService.processQueuedPayouts(10);

    expect(result.processedCount).toBe(1);
    expect(result.successfulCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("handles empty queue gracefully", async () => {
    mockExecute.mockResolvedValueOnce([]); // no pending jobs

    const result = await PayoutWorkerService.processQueuedPayouts(10);

    expect(result.processedCount).toBe(0);
    expect(result.successfulCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });
});

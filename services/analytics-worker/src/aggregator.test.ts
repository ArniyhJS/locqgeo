import { describe, it, expect, beforeEach, vi } from "vitest";

const mockExecute = vi.fn();

vi.mock("@locqgeo/database", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""),
}));

import { AnalyticsAggregatorService } from "./aggregator.js";

describe("AnalyticsAggregatorService", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("computes daily telemetry summary from database pings and campaigns", async () => {
    mockExecute
      .mockResolvedValueOnce([
        {
          total_pings: "150",
          total_verified: "135",
          total_rejected: "15",
        },
      ]) // stats query
      .mockResolvedValueOnce([
        {
          active_count: "8",
        },
      ]); // active campaigns query

    const summary = await AnalyticsAggregatorService.computeDailyTelemetrySummary();

    expect(summary.totalVerificationsToday).toBe(150);
    expect(summary.totalVerifiedToday).toBe(135);
    expect(summary.totalRejectedToday).toBe(15);
    expect(summary.activeCampaignsCount).toBe(8);
  });
});

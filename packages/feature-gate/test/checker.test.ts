import { describe, expect, it, vi } from "vitest";
import { createFeatureChecker } from "../src/checker";
import type { DataProvider } from "../src/types";

const mockProvider: DataProvider = {
  getActiveSubscription: async () => ({ planId: "plan-pro", status: "active" }),
  getPlanFeatures: async () => [
    { featureKey: "anti_cheat", enabled: true, limitValue: null, limitUnit: null },
    { featureKey: "daily_pings", enabled: true, limitValue: 10000, limitUnit: "per_day" },
  ],
  getFeatureOverrides: async () => [],
  getFreePlanId: async () => "plan-free",
};

const mockCache = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
};

describe("createFeatureChecker", () => {
  it("hasFeature returns true for included feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.hasFeature("TENANT", "t-1", "anti_cheat");
    expect(result).toBe(true);
  });

  it("hasFeature returns false for missing feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.hasFeature("TENANT", "t-1", "webhooks");
    expect(result).toBe(false);
  });

  it("getFeatureLimit returns numeric limit", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.getFeatureLimit("TENANT", "t-1", "daily_pings");
    expect(result).toBe(10000);
  });

  it("getFeatureLimit returns null for unlimited feature", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    const result = await checker.getFeatureLimit("TENANT", "t-1", "anti_cheat");
    expect(result).toBeNull();
  });

  it("invalidateFeatureCache deletes the cache key", async () => {
    const checker = createFeatureChecker(mockProvider, mockCache);
    await checker.invalidateFeatureCache("TENANT", "t-1");
    expect(mockCache.del).toHaveBeenCalledWith("features:TENANT:t-1");
  });
});

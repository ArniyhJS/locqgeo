import { describe, expect, it } from "vitest";
import { resolveFeatures } from "../src/resolver";
import type { DataProvider } from "../src/types";

const mockProvider: DataProvider = {
  getActiveSubscription: async (_entityType, _entityId) => ({
    planId: "plan-pro",
    status: "active",
  }),
  getPlanFeatures: async (planId) => {
    if (planId === "plan-pro") {
      return [
        { featureKey: "anti_cheat", enabled: true, limitValue: null, limitUnit: null },
        { featureKey: "webhooks", enabled: true, limitValue: null, limitUnit: null },
        { featureKey: "daily_pings", enabled: true, limitValue: 10000, limitUnit: "per_day" },
      ];
    }
    return [];
  },
  getFeatureOverrides: async (_entityType, _entityId) => [],
  getFreePlanId: async (_planType) => "plan-free",
};

describe("resolveFeatures", () => {
  it("resolves plan features for an active subscription", async () => {
    const result = await resolveFeatures("TENANT", "tenant-123", mockProvider);
    expect(result.get("anti_cheat")).toEqual({ enabled: true, limit: null });
    expect(result.get("webhooks")).toEqual({ enabled: true, limit: null });
    expect(result.get("daily_pings")).toEqual({ enabled: true, limit: 10000 });
  });

  it("falls back to free plan when no subscription exists", async () => {
    const noSubProvider: DataProvider = {
      ...mockProvider,
      getActiveSubscription: async () => null,
      getPlanFeatures: async (planId) => {
        if (planId === "plan-free") {
          return [
            { featureKey: "daily_pings", enabled: true, limitValue: 100, limitUnit: "per_day" },
          ];
        }
        return [];
      },
    };
    const result = await resolveFeatures("TENANT", "tenant-456", noSubProvider);
    expect(result.get("anti_cheat")).toBeUndefined();
    expect(result.get("daily_pings")).toEqual({ enabled: true, limit: 100 });
  });

  it("applies feature overrides (grant and revoke)", async () => {
    const overrideProvider: DataProvider = {
      ...mockProvider,
      getFeatureOverrides: async () => [
        { featureKey: "webhooks", granted: false, limitOverride: null, expiresAt: null },
        { featureKey: "squads", granted: true, limitOverride: null, expiresAt: null },
      ],
    };
    const result = await resolveFeatures("TENANT", "tenant-789", overrideProvider);
    expect(result.get("webhooks")).toEqual({ enabled: false, limit: null });
    expect(result.get("squads")).toEqual({ enabled: true, limit: null });
  });

  it("skips expired overrides", async () => {
    const expiredProvider: DataProvider = {
      ...mockProvider,
      getFeatureOverrides: async () => [
        {
          featureKey: "squads",
          granted: true,
          limitOverride: null,
          expiresAt: new Date("2020-01-01T00:00:00Z"),
        },
      ],
    };
    const result = await resolveFeatures("TENANT", "tenant-expired", expiredProvider);
    expect(result.get("squads")).toBeUndefined();
  });
});

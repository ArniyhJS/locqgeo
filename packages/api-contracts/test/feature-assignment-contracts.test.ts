import { describe, expect, it } from "vitest";
import {
  CreatePlanSchema,
  CreateFeatureOverrideSchema,
  SubscriptionStatusEnum,
  PlanTypeEnum,
} from "../src";

describe("Feature Assignment Zod Contracts", () => {
  it("validates CreatePlanSchema with all required fields", () => {
    const result = CreatePlanSchema.safeParse({
      name: "Pro",
      slug: "b2b_pro",
      type: "B2B",
      tier: 2,
      priceMonthlyNgn: 75000,
      priceMonthlyUsd: 45,
    });
    expect(result.success).toBe(true);
  });

  it("rejects CreatePlanSchema with invalid type", () => {
    const result = CreatePlanSchema.safeParse({
      name: "Bad",
      slug: "bad_plan",
      type: "INVALID",
      tier: 0,
      priceMonthlyNgn: 0,
      priceMonthlyUsd: 0,
    });
    expect(result.success).toBe(false);
  });

  it("validates CreateFeatureOverrideSchema", () => {
    const result = CreateFeatureOverrideSchema.safeParse({
      entityType: "TENANT",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "webhooks",
      granted: true,
      reason: "Enterprise deal",
    });
    expect(result.success).toBe(true);
  });

  it("validates CreateFeatureOverrideSchema with optional expiry and limit", () => {
    const result = CreateFeatureOverrideSchema.safeParse({
      entityType: "USER",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "streak_savers",
      granted: true,
      limitOverride: 10,
      reason: "VIP trial",
      expiresAt: "2026-08-29T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("exports SubscriptionStatusEnum and PlanTypeEnum", () => {
    expect(SubscriptionStatusEnum).toBeDefined();
    expect(PlanTypeEnum).toBeDefined();
  });
});

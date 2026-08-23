import { describe, expect, it } from "vitest";
import { createFeatureOverrideAction } from "../src/actions/feature-overrides";

describe("Feature Override Server Actions", () => {
  it("validates and creates a feature override for a tenant", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "TENANT",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "webhooks",
      granted: true,
      reason: "Enterprise deal signed",
    });
    expect(res.success).toBe(true);
    expect(res.overrideId).toBeDefined();
  });

  it("rejects invalid input with validation errors", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "INVALID" as unknown as "TENANT",
      entityId: "not-a-uuid",
      featureKey: "",
      granted: true,
      reason: "x",
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("validates override with optional expiry date", async () => {
    const res = await createFeatureOverrideAction({
      entityType: "USER",
      entityId: "550e8400-e29b-41d4-a716-446655440000",
      featureKey: "streak_savers",
      granted: true,
      limitOverride: 10,
      reason: "VIP trial for 30 days",
      expiresAt: "2026-08-29T00:00:00Z",
    });
    expect(res.success).toBe(true);
  });
});

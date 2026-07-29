import { describe, expect, it } from "vitest";
import { calculateSpoofScore } from "../src/services/spoof-calculator";

describe("Composite Spoof Calculator Engine", () => {
  it("calculates low risk score for accurate residential ping (VERIFIED)", () => {
    const res = calculateSpoofScore({
      accuracyMeters: 5,
      velocityMps: 2,
      isVpnOrProxy: false,
      deviceTrustScore: 100,
    });
    expect(res.spoofScore).toBe(0);
    expect(res.action).toBe("VERIFIED");
    expect(res.breakdown).toEqual({
      accuracyRisk: 0,
      velocityRisk: 0,
      networkRisk: 0,
      deviceRisk: 0,
    });
  });

  it("calculates medium risk score resulting in VERIFIED_FLAGGED (30-59)", () => {
    // accuracyRisk = (30 - 10) * 2.5 = 50 (weight 0.35 => 17.5)
    // velocityRisk = (20 - 10) * 2.2 = 22 (weight 0.30 => 6.6)
    // networkRisk = 100 (weight 0.20 => 20)
    // deviceRisk = 100 - 100 = 0 (weight 0.15 => 0)
    // composite = round(17.5 + 6.6 + 20 + 0) = round(44.1) = 44
    const res = calculateSpoofScore({
      accuracyMeters: 30,
      velocityMps: 20,
      isVpnOrProxy: true,
      deviceTrustScore: 100,
    });
    expect(res.spoofScore).toBe(44);
    expect(res.action).toBe("VERIFIED_FLAGGED");
    expect(res.breakdown).toEqual({
      accuracyRisk: 50,
      velocityRisk: 22,
      networkRisk: 100,
      deviceRisk: 0,
    });
  });

  it("calculates high risk score resulting in REJECTED_SPOOF (>= 60)", () => {
    const res = calculateSpoofScore({
      accuracyMeters: 45,
      velocityMps: 60,
      isVpnOrProxy: true,
      deviceTrustScore: 30,
    });
    expect(res.spoofScore).toBeGreaterThanOrEqual(60);
    expect(res.action).toBe("REJECTED_SPOOF");
  });

  it("handles edge cases and bounds (clamping risks between 0 and 100)", () => {
    const res = calculateSpoofScore({
      accuracyMeters: 1000,
      velocityMps: 1000,
      isVpnOrProxy: true,
      deviceTrustScore: 0,
    });
    expect(res.breakdown).toEqual({
      accuracyRisk: 100,
      velocityRisk: 100,
      networkRisk: 100,
      deviceRisk: 100,
    });
    expect(res.spoofScore).toBe(100);
    expect(res.action).toBe("REJECTED_SPOOF");
  });
});

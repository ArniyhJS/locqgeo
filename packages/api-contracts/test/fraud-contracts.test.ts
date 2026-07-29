import { describe, expect, it } from "vitest";
import { SpoofScoreBreakdownSchema, UnblockDeviceSchema } from "../src";

describe("Fraud Zod Contracts", () => {
  describe("SpoofScoreBreakdownSchema", () => {
    it("validates correct spoof score breakdown payload", () => {
      const validPayload = {
        accuracyRisk: 20,
        velocityRisk: 50,
        networkRisk: 0,
        deviceRisk: 10,
        compositeSpoofScore: 24,
      };
      const result = SpoofScoreBreakdownSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects breakdown when risk scores are out of bounds (0-100)", () => {
      const invalidPayload = {
        accuracyRisk: -5,
        velocityRisk: 150,
        networkRisk: 0,
        deviceRisk: 10,
        compositeSpoofScore: 24,
      };
      const result = SpoofScoreBreakdownSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects breakdown when required fields are missing", () => {
      const invalidPayload = {
        accuracyRisk: 20,
        velocityRisk: 50,
      };
      const result = SpoofScoreBreakdownSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("UnblockDeviceSchema", () => {
    it("validates correct unblock device payload", () => {
      const validPayload = {
        targetDeviceId: "device_hardware_fingerprint_12345",
        reason: "User verified identity via support ticket",
      };
      const result = UnblockDeviceSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects unblock device payload when targetDeviceId is too short", () => {
      const invalidPayload = {
        targetDeviceId: "short_id",
        reason: "User verified identity via support ticket",
      };
      const result = UnblockDeviceSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects unblock device payload when reason is too short", () => {
      const invalidPayload = {
        targetDeviceId: "device_hardware_fingerprint_12345",
        reason: "ok",
      };
      const result = UnblockDeviceSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});

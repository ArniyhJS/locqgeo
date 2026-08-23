import { describe, expect, it } from "vitest";
import { unblockDeviceAction } from "../src/actions/fraud";

describe("Fraud Server Actions - unblockDeviceAction", () => {
  it("successfully validates input and returns targetDeviceId on valid unblock request", async () => {
    const input = {
      targetDeviceId: "device_fingerprint_valid_12345",
      reason: "Verified identity via support ticket #4920",
    };

    const result = await unblockDeviceAction(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.targetDeviceId).toBe("device_fingerprint_valid_12345");
    }
  });

  it("returns error for invalid targetDeviceId (too short)", async () => {
    const input = {
      targetDeviceId: "short_id",
      reason: "Verified identity via support ticket",
    };

    const result = await unblockDeviceAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error for invalid reason (too short)", async () => {
    const input = {
      targetDeviceId: "device_fingerprint_valid_12345",
      reason: "ok",
    };

    const result = await unblockDeviceAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error for empty or invalid payload", async () => {
    const input = {} as unknown as Parameters<typeof unblockDeviceAction>[0];

    const result = await unblockDeviceAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

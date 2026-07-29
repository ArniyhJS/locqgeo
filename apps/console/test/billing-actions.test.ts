import { describe, expect, it } from "vitest";
import { topUpWalletAction } from "../src/actions/billing";

describe("Billing Server Actions - topUpWalletAction", () => {
  it("successfully processes valid wallet top-up request", async () => {
    const input = {
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      amountNgn: 15000,
      gateway: "PAYSTACK" as const,
      reference: "ref_test_98765",
    };

    const result = await topUpWalletAction(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.transactionId).toBeDefined();
      expect(typeof result.transactionId).toBe("string");
    }
  });

  it("returns error for invalid tenantId UUID format", async () => {
    const input = {
      tenantId: "not-a-valid-uuid",
      amountNgn: 5000,
      gateway: "PAYSTACK" as const,
      reference: "ref_test_123",
    };

    const result = await topUpWalletAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error when amountNgn is below minimum 1000 NGN", async () => {
    const input = {
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      amountNgn: 500,
      gateway: "PAYSTACK" as const,
      reference: "ref_test_123",
    };

    const result = await topUpWalletAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error for unsupported gateway", async () => {
    const input = {
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      amountNgn: 5000,
      gateway: "CRYPTO" as any,
      reference: "ref_test_123",
    };

    const result = await topUpWalletAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("returns error when reference is missing or too short", async () => {
    const input = {
      tenantId: "123e4567-e89b-12d3-a456-426614174000",
      amountNgn: 5000,
      gateway: "FLUTTERWAVE" as const,
      reference: "a",
    };

    const result = await topUpWalletAction(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

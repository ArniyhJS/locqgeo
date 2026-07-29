import { describe, expect, it } from "vitest";
import {
  TopUpWalletSchema,
  CreateInvoiceRequestSchema,
  UpdateCampaignBudgetSchema,
  UpdateUserRoleSchema,
} from "../src";

describe("Billing Zod Contracts", () => {
  describe("TopUpWalletSchema", () => {
    it("validates correct top-up payload", () => {
      const validPayload = {
        tenantId: "123e4567-e89b-12d3-a456-426614174000",
        amountNgn: 5000,
        gateway: "PAYSTACK",
        reference: "ref_123456",
      };
      const result = TopUpWalletSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects top-up with invalid amount, uuid, gateway, or reference", () => {
      const invalidPayload = {
        tenantId: "not-a-uuid",
        amountNgn: 500, // less than 1000
        gateway: "INVALID_GATEWAY",
        reference: "ab", // less than 3 chars
      };
      const result = TopUpWalletSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateInvoiceRequestSchema", () => {
    it("validates correct invoice request payload", () => {
      const validPayload = {
        tenantId: "123e4567-e89b-12d3-a456-426614174000",
        poNumber: "PO-2026-001",
        amountNgn: 100000,
        dueDate: "2026-08-30T00:00:00.000Z",
      };
      const result = CreateInvoiceRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects invoice request with amount below NGN 50,000", () => {
      const invalidPayload = {
        tenantId: "123e4567-e89b-12d3-a456-426614174000",
        amountNgn: 25000,
        dueDate: "invalid-date",
      };
      const result = CreateInvoiceRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateCampaignBudgetSchema", () => {
    it("validates correct campaign budget update payload", () => {
      const validPayload = {
        campaignId: "123e4567-e89b-12d3-a456-426614174000",
        totalBudgetCapNgn: 50000,
        dailyBudgetCapNgn: 5000,
      };
      const result = UpdateCampaignBudgetSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects campaign budget update when budget caps are below limits", () => {
      const invalidPayload = {
        campaignId: "123e4567-e89b-12d3-a456-426614174000",
        totalBudgetCapNgn: 500, // min 1000
        dailyBudgetCapNgn: 100, // min 500
      };
      const result = UpdateCampaignBudgetSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateUserRoleSchema", () => {
    it("validates correct user role update payload", () => {
      const validPayload = {
        targetUserId: "123e4567-e89b-12d3-a456-426614174000",
        newRole: "FINANCIAL_AUDITOR",
      };
      const result = UpdateUserRoleSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects user role update with invalid role", () => {
      const invalidPayload = {
        targetUserId: "123e4567-e89b-12d3-a456-426614174000",
        newRole: "SUPER_ADMIN",
      };
      const result = UpdateUserRoleSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});

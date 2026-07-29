import { describe, expect, it } from "vitest";
import {
  StreakStatusSchema,
  MysteryDropClaimSchema,
  LeaderboardQuerySchema,
  CreateSquadSchema,
  ClaimReferralCodeSchema,
} from "../src";

describe("Gamification Zod Contracts", () => {
  describe("StreakStatusSchema", () => {
    it("validates valid streak status payload", () => {
      const validPayload = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        currentStreakDays: 5,
        longestStreakDays: 10,
        multiplier: 1.15,
        streakSaversRemaining: 1,
      };
      const result = StreakStatusSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects streak status with invalid userId or negative numbers", () => {
      const invalidPayload = {
        userId: "not-a-uuid",
        currentStreakDays: 0,
        longestStreakDays: -1,
        multiplier: 0.5,
        streakSaversRemaining: -1,
      };
      const result = StreakStatusSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("MysteryDropClaimSchema", () => {
    it("validates mystery drop claim payload", () => {
      const validPayload = {
        claimId: "123e4567-e89b-12d3-a456-426614174000",
        unlocked: true,
        dropTitle: "Golden Loot Box",
        rewardAmountNgn: 500,
      };
      const result = MysteryDropClaimSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects mystery drop claim with invalid claimId", () => {
      const invalidPayload = {
        claimId: "invalid-uuid",
        unlocked: false,
      };
      const result = MysteryDropClaimSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("LeaderboardQuerySchema", () => {
    it("validates LeaderboardQuerySchema defaults", () => {
      const validPayload = {
        period: "WEEKLY",
      };
      const result = LeaderboardQuerySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.regionCode).toBe("NG-LA");
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("rejects invalid period or limit out of bounds", () => {
      const invalidPayload = {
        period: "YEARLY",
        limit: 150,
      };
      const result = LeaderboardQuerySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateSquadSchema", () => {
    it("validates squad creation payload", () => {
      const validPayload = {
        name: "Lagos Hunters",
      };
      const result = CreateSquadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects squad name too short or too long", () => {
      const tooShort = { name: "AB" };
      const tooLong = { name: "A".repeat(51) };
      expect(CreateSquadSchema.safeParse(tooShort).success).toBe(false);
      expect(CreateSquadSchema.safeParse(tooLong).success).toBe(false);
    });
  });

  describe("ClaimReferralCodeSchema", () => {
    it("validates referral code claim payload", () => {
      const validPayload = {
        referralCode: "SPOTT2026",
      };
      const result = ClaimReferralCodeSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects referral code too short or too long", () => {
      const tooShort = { referralCode: "123" };
      const tooLong = { referralCode: "A".repeat(21) };
      expect(ClaimReferralCodeSchema.safeParse(tooShort).success).toBe(false);
      expect(ClaimReferralCodeSchema.safeParse(tooLong).success).toBe(false);
    });
  });
});

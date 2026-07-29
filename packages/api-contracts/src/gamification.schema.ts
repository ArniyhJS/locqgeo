import { z } from "zod";

export const StreakStatusSchema = z.object({
  userId: z.string().uuid(),
  currentStreakDays: z.number().int().min(1),
  longestStreakDays: z.number().int().min(1),
  multiplier: z.number().min(1.0).max(2.0),
  streakSaversRemaining: z.number().int().min(0),
});

export type StreakStatusInput = z.infer<typeof StreakStatusSchema>;

export const MysteryDropClaimSchema = z.object({
  claimId: z.string().uuid(),
  unlocked: z.boolean(),
  dropTitle: z.string().optional(),
  rewardAmountNgn: z.number().optional(),
});

export type MysteryDropClaimInput = z.infer<typeof MysteryDropClaimSchema>;

export const LeaderboardQuerySchema = z.object({
  regionCode: z.string().min(2).default("NG-LA"),
  period: z.enum(["WEEKLY", "MONTHLY", "ALL_TIME"]),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type LeaderboardQueryInput = z.infer<typeof LeaderboardQuerySchema>;

export const CreateSquadSchema = z.object({
  name: z.string().min(3).max(50),
});

export type CreateSquadInput = z.infer<typeof CreateSquadSchema>;

export const ClaimReferralCodeSchema = z.object({
  referralCode: z.string().min(4).max(20),
});

export type ClaimReferralCodeInput = z.infer<typeof ClaimReferralCodeSchema>;

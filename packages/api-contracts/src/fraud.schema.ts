import { z } from "zod";

export const SpoofScoreBreakdownSchema = z.object({
  accuracyRisk: z.number().min(0).max(100),
  velocityRisk: z.number().min(0).max(100),
  networkRisk: z.number().min(0).max(100),
  deviceRisk: z.number().min(0).max(100),
  compositeSpoofScore: z.number().min(0).max(100),
});

export type SpoofScoreBreakdownInput = z.infer<typeof SpoofScoreBreakdownSchema>;

export const UnblockDeviceSchema = z.object({
  targetDeviceId: z.string().min(16).max(128),
  reason: z.string().min(3),
});

export type UnblockDeviceInput = z.infer<typeof UnblockDeviceSchema>;

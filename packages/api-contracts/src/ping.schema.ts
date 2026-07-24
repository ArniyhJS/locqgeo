import { z } from "zod";
export { PingRequestSchema, type PingRequest } from "./grid.schema.js";

export const LegacyPingResponseSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED_ANTICHEAT", "OUT_OF_BOUNDS"]),
  distance_meters: z.number().optional(),
  claim_eligible: z.boolean(),
  reason: z.string().optional(),
  anticheat: z.object({
    velocity_valid: z.boolean(),
    accuracy_valid: z.boolean(),
    spoof_score: z.number(),
  }).optional(),
});

export type LegacyPingResponse = z.infer<typeof LegacyPingResponseSchema>;

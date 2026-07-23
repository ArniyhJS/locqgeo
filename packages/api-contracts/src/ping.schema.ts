import { z } from "zod";

export const PingRequestSchema = z.object({
  device_id: z.string().min(16).max(128),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy_meters: z.number().min(0),
  node_id: z.string().uuid(),
  velocity_mps: z.number().optional(),
  timestamp: z.number().optional(),
  battery_level: z.number().min(0).max(100).optional(),
});

export type PingRequest = z.infer<typeof PingRequestSchema>;

export const PingResponseSchema = z.object({
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

export type PingResponse = z.infer<typeof PingResponseSchema>;

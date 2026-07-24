import { z } from "zod";

export const PingRequestSchema = z.object({
  device_id: z
    .string()
    .min(16, "Device ID must be at least 16 characters")
    .max(128, "Device ID cannot exceed 128 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Device ID contains invalid characters"),
  latitude: z
    .number()
    .min(-90.0, "Latitude must be >= -90")
    .max(90.0, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180.0, "Longitude must be >= -180")
    .max(180.0, "Longitude must be <= 180"),
  accuracy_meters: z
    .number()
    .min(0.0, "Accuracy cannot be negative"),
  node_id: z
    .string()
    .uuid("node_id must be a valid UUID v4"),
});

export type PingRequest = z.infer<typeof PingRequestSchema>;

export const RewardTypeEnum = z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]);
export type RewardType = z.infer<typeof RewardTypeEnum>;

export const ClaimStatusEnum = z.enum([
  "SUCCESS",
  "REJECTED_ACCURACY",
  "REJECTED_DUPLICATE",
  "REJECTED_VELOCITY",
  "REJECTED_OUT_OF_BOUNDS",
  "REJECTED_INACTIVE_NODE",
]);
export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;

export const PingResponseSuccessSchema = z.object({
  success: z.literal(true),
  status: z.literal("VERIFIED"),
  data: z.object({
    claim_id: z.string().uuid(),
    distance_meters: z.number(),
    reward: z.object({
      type: RewardTypeEnum,
      amount_ngn: z.number(),
      payout_status: z.enum(["QUEUED", "PROCESSING", "COMPLETED"]),
    }),
  }),
});

export const PingResponseErrorSchema = z.object({
  success: z.literal(false),
  status: ClaimStatusEnum,
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type PingResponseSuccess = z.infer<typeof PingResponseSuccessSchema>;
export type PingResponseError = z.infer<typeof PingResponseErrorSchema>;

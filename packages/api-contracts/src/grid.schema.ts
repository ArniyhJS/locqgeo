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
  // Optional client-provided velocity hint; the engine always recomputes server-side.
  velocity_mps: z.number().optional(),
  geofence_id: z.string().uuid("geofence_id must be a valid UUID v4"),
  tenant_id: z.string().uuid("tenant_id must be a valid UUID v4").optional(),
  // Optional registered user context for progressive identity.
  user_id: z.string().uuid("user_id must be a valid UUID v4").optional(),
  // Optional campaign context for billboard gamification.
  campaign_id: z.string().uuid("campaign_id must be a valid UUID v4").optional(),
  // Optional device metadata fields for fingerprinting and fraud scoring.
  user_agent: z.string().optional(),
  ip_address: z.string().optional(),
  screen_width: z.number().optional(),
  screen_height: z.number().optional(),
  os_name: z.string().optional(),
  browser_name: z.string().optional(),
});

export type PingRequest = z.infer<typeof PingRequestSchema>;

export const RewardTypeEnum = z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]);
export type RewardType = z.infer<typeof RewardTypeEnum>;

export const ActionTypeEnum = z.enum([
  "REWARD",
  "CHECKIN",
  "ATTENDANCE",
  "AUDIT",
  "ACCESS",
]);
export type ActionType = z.infer<typeof ActionTypeEnum>;

export const VerificationStatusEnum = z.enum([
  "VERIFIED",
  "REJECTED_ACCURACY",
  "REJECTED_DUPLICATE",
  "REJECTED_VELOCITY",
  "REJECTED_OUT_OF_BOUNDS",
  "REJECTED_INACTIVE_GEOFENCE",
  "REJECTED_SPOOF",
  "REJECTED_RATE_LIMIT",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const PingResponseSuccessSchema = z.object({
  success: z.literal(true),
  status: z.literal("VERIFIED"),
  data: z.object({
    verification_id: z.string().uuid(),
    geofence_id: z.string().uuid(),
    geofence_title: z.string().optional(),
    distance_meters: z.number(),
    action_type: ActionTypeEnum,
    verified_at: z.string().datetime().optional(),
    payout_status: z.enum(["NOT_APPLICABLE", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
    campaign_id: z.string().uuid().optional(),
    points_earned: z.number().int().nonnegative().optional(),
    leaderboard_rank: z.number().int().positive().optional(),
    reward: z
      .object({
        type: RewardTypeEnum,
        amount: z.number(),
        currency: z.string().default("NGN"),
        payout_status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED"]),
      })
      .optional(),
  }),
});

export const PingResponseErrorSchema = z.object({
  success: z.literal(false),
  status: VerificationStatusEnum,
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type PingResponseSuccess = z.infer<typeof PingResponseSuccessSchema>;
export type PingResponseError = z.infer<typeof PingResponseErrorSchema>;

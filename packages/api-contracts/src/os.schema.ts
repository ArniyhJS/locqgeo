import { z } from "zod";
import { RewardTypeEnum, ActionTypeEnum } from "./grid.schema.js";

// -----------------------------------------------------------------
// 1. Geofence Builder Schemas
// -----------------------------------------------------------------
export const CreateGeofenceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters"),
  latitude: z
    .number()
    .min(-90.0, "Latitude must be >= -90")
    .max(90.0, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180.0, "Longitude must be >= -180")
    .max(180.0, "Longitude must be <= 180"),
  radius_meters: z
    .number()
    .min(10.0, "Minimum geofence radius is 10m")
    .max(500.0, "Maximum geofence radius is 500m")
    .default(50.0),
  action_type: ActionTypeEnum.default("REWARD"),
  reward_type: RewardTypeEnum.optional(),
  reward_amount: z.number().min(10.0).max(50000.0).optional(),
  reward_currency: z.string().length(3).default("NGN"),
  daily_budget_limit: z
    .number()
    .min(1000.0, "Minimum daily budget limit is 1,000")
    .default(50000.0),
});

export type CreateGeofenceInput = z.input<typeof CreateGeofenceSchema>;

export const BulkGeofenceCsvRowSchema = z.object({
  title: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().min(10).max(500).default(50),
  action_type: ActionTypeEnum.default("REWARD"),
  reward_type: RewardTypeEnum.optional(),
  reward_amount: z.coerce.number().min(10).max(50000).optional(),
  reward_currency: z.string().length(3).default("NGN"),
  daily_budget_limit: z.coerce.number().min(1000).default(50000),
});

// -----------------------------------------------------------------
// 2. Enterprise Telemetry & Analytics Schemas
// -----------------------------------------------------------------
export const TelemetryQuerySchema = z.object({
  tenant_id: z.string().uuid("tenant_id must be a valid UUID v4"),
  geofence_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type TelemetryQuery = z.infer<typeof TelemetryQuerySchema>;

export const TelemetrySummaryResponseSchema = z.object({
  tenant_id: z.string().uuid(),
  summary: z.object({
    total_pings: z.number().int().min(0),
    verified_events: z.number().int().min(0),
    fraud_blocked: z.number().int().min(0),
    conversion_rate_pct: z.number().min(0).max(100),
    total_spend: z.number().min(0),
  }),
  fraud_breakdown: z.object({
    rejected_accuracy: z.number().int().min(0),
    rejected_velocity: z.number().int().min(0),
    rejected_out_of_bounds: z.number().int().min(0),
    rejected_duplicate: z.number().int().min(0),
  }),
  time_series: z.array(
    z.object({
      timestamp_hour: z.string(),
      pings: z.number().int(),
      verified_events: z.number().int(),
      blocked_fraud: z.number().int(),
    })
  ),
});

export type TelemetrySummaryResponse = z.infer<typeof TelemetrySummaryResponseSchema>;

// -----------------------------------------------------------------
// 3. Enterprise API Key Management Schemas
// -----------------------------------------------------------------
export const CreateApiKeySchema = z.object({
  key_label: z.string().min(2).max(100),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;

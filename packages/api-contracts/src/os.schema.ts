import { z } from "zod";

// -----------------------------------------------------------------
// 1. Campaign Node Builder Schemas
// -----------------------------------------------------------------
export const CreateCampaignNodeSchema = z.object({
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
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z
    .number()
    .min(10.0, "Minimum reward amount is NGN 10")
    .max(50000.0, "Maximum reward amount is NGN 50,000"),
  daily_budget_limit_ngn: z
    .number()
    .min(1000.0, "Minimum daily budget limit is NGN 1,000")
    .default(50000.0),
});

export type CreateCampaignNodeInput = z.infer<typeof CreateCampaignNodeSchema>;

export const BulkCampaignNodeCsvRowSchema = z.object({
  title: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().min(10).max(500).default(50),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z.coerce.number().min(10).max(50000),
  daily_budget_limit_ngn: z.coerce.number().min(1000).default(50000),
});

// -----------------------------------------------------------------
// 2. Enterprise Telemetry & Analytics Schemas
// -----------------------------------------------------------------
export const TelemetryQuerySchema = z.object({
  tenant_id: z.string().uuid("tenant_id must be a valid UUID v4"),
  node_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type TelemetryQuery = z.infer<typeof TelemetryQuerySchema>;

export const TelemetrySummaryResponseSchema = z.object({
  tenant_id: z.string().uuid(),
  summary: z.object({
    total_pings: z.number().int().min(0),
    verified_claims: z.number().int().min(0),
    fraud_blocked: z.number().int().min(0),
    conversion_rate_pct: z.number().min(0).max(100),
    total_spend_ngn: z.number().min(0),
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
      verified_claims: z.number().int(),
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

import { z } from "zod";

export const TelemetryEventSchema = z.object({
  id: z.string().uuid().optional(),
  campaign_id: z.string().uuid(),
  event_type: z.enum(["GEOFENCE_ENTER", "GEOFENCE_EXIT", "CLAIM_ATTEMPT", "ANTICHEAT_TRIGGER"]),
  device_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().or(z.date()).optional(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

export const CampaignAnalyticsSchema = z.object({
  campaign_id: z.string().uuid(),
  total_pings: z.number(),
  unique_devices: z.number(),
  claims_count: z.number(),
  fraud_rejections: z.number(),
  total_payout_amount: z.number(),
});

export type CampaignAnalytics = z.infer<typeof CampaignAnalyticsSchema>;

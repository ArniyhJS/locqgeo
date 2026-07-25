import { z } from "zod";
import { ActionTypeEnum, RewardTypeEnum } from "./grid.schema.js";

export const CampaignStatusEnum = z.enum(["DRAFT", "ACTIVE", "PAUSED", "ENDED"]);

export const CampaignGeofenceSchema = z.object({
  geofence_id: z.string().uuid(),
  visit_weight: z.number().int().min(1).default(1),
  required_visit_order: z.number().int().min(1).optional(),
});

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  action_type: ActionTypeEnum,
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  daily_budget_limit: z.number().nonnegative().optional(),
  total_budget_limit: z.number().nonnegative().optional(),
  total_budget_spent: z.number().nonnegative().default(0),
  reward_type: RewardTypeEnum.optional(),
  reward_amount: z.number().positive().optional(),
  reward_currency: z.string().length(3).default("NGN"),
  is_active: z.boolean().default(true),
  geofences: z.array(CampaignGeofenceSchema).default([]),
  created_at: z.string().datetime(),
});

export const CampaignCreateRequestSchema = CampaignSchema.omit({
  id: true,
  total_budget_spent: true,
  created_at: true,
});

export const CampaignListItemSchema = CampaignSchema.omit({ geofences: true });

export const CampaignListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(CampaignListItemSchema),
});

export const CampaignDetailResponseSchema = z.object({
  success: z.literal(true),
  data: CampaignSchema,
});

export const CampaignLeaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  device_id: z.string(),
  total_points: z.number().int().nonnegative(),
  total_visits: z.number().int().nonnegative(),
  streak_count: z.number().int().nonnegative(),
  last_visit_at: z.string().datetime().optional(),
});

export const CampaignLeaderboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    campaign_id: z.string().uuid(),
    entries: z.array(CampaignLeaderboardEntrySchema),
  }),
});

export const CampaignMeResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    campaign_id: z.string().uuid(),
    device_id: z.string(),
    total_points: z.number().int().nonnegative(),
    total_visits: z.number().int().nonnegative(),
    streak_count: z.number().int().nonnegative(),
    rank: z.number().int().positive(),
    visited_geofence_ids: z.array(z.string().uuid()),
  }),
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type CampaignCreateRequest = z.infer<typeof CampaignCreateRequestSchema>;
export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;
export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
export type CampaignLeaderboardResponse = z.infer<typeof CampaignLeaderboardResponseSchema>;
export type CampaignMeResponse = z.infer<typeof CampaignMeResponseSchema>;

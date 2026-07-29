import { z } from "zod";

export const PlanTypeEnum = z.enum(["B2B", "B2C"]);
export type PlanType = z.infer<typeof PlanTypeEnum>;

export const SubscriptionStatusEnum = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9_]+$/, "Slug must be lowercase alphanumeric with underscores"),
  type: PlanTypeEnum,
  tier: z.number().int().min(0).max(10),
  priceMonthlyNgn: z.number().min(0),
  priceMonthlyUsd: z.number().min(0),
  priceYearlyNgn: z.number().min(0).optional(),
  priceYearlyUsd: z.number().min(0).optional(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export const CreateFeatureOverrideSchema = z.object({
  entityType: z.enum(["TENANT", "USER"]),
  entityId: z.string().uuid(),
  featureKey: z.string().min(1).max(50),
  granted: z.boolean(),
  limitOverride: z.number().int().min(0).optional(),
  reason: z.string().min(3),
  expiresAt: z.string().datetime().optional(),
});

export type CreateFeatureOverrideInput = z.infer<typeof CreateFeatureOverrideSchema>;

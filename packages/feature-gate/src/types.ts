export interface ResolvedFeature {
  enabled: boolean;
  limit: number | null;
}

export type FeatureMap = Map<string, ResolvedFeature>;

export type EntityType = "TENANT" | "USER";

export interface SubscriptionInfo {
  planId: string;
  status: string;
}

export interface PlanFeatureRow {
  featureKey: string;
  enabled: boolean;
  limitValue: number | null;
  limitUnit: string | null;
}

export interface FeatureOverrideRow {
  featureKey: string;
  granted: boolean;
  limitOverride: number | null;
  expiresAt: Date | null;
}

export interface DataProvider {
  getActiveSubscription(entityType: EntityType, entityId: string): Promise<SubscriptionInfo | null>;
  getPlanFeatures(planId: string): Promise<PlanFeatureRow[]>;
  getFeatureOverrides(entityType: EntityType, entityId: string): Promise<FeatureOverrideRow[]>;
  getFreePlanId(planType: "B2B" | "B2C"): Promise<string>;
}

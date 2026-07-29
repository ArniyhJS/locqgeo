import type { EntityType, FeatureMap, DataProvider } from "./types.js";

const ACTIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

export async function resolveFeatures(
  entityType: EntityType,
  entityId: string,
  provider: DataProvider,
): Promise<FeatureMap> {
  const subscription = await provider.getActiveSubscription(entityType, entityId);

  let planId: string;
  if (subscription && ACTIVE_STATUSES.has(subscription.status)) {
    planId = subscription.planId;
  } else {
    const planType = entityType === "TENANT" ? "B2B" : "B2C";
    planId = await provider.getFreePlanId(planType);
  }

  const planFeatures = await provider.getPlanFeatures(planId);
  const featureMap: FeatureMap = new Map();

  for (const pf of planFeatures) {
    if (pf.enabled) {
      featureMap.set(pf.featureKey, {
        enabled: true,
        limit: pf.limitValue,
      });
    }
  }

  const overrides = await provider.getFeatureOverrides(entityType, entityId);
  const now = new Date();

  for (const override of overrides) {
    if (override.expiresAt && override.expiresAt < now) {
      continue;
    }

    const existing = featureMap.get(override.featureKey);
    const limit = override.limitOverride ?? existing?.limit ?? null;

    featureMap.set(override.featureKey, {
      enabled: override.granted,
      limit,
    });
  }

  return featureMap;
}

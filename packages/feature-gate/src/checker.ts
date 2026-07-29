import type { EntityType, FeatureMap, DataProvider, ResolvedFeature } from "./types.js";
import { resolveFeatures } from "./resolver.js";

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

const CACHE_TTL = 300; // 5 minutes

function cacheKey(entityType: EntityType, entityId: string): string {
  return `features:${entityType}:${entityId}`;
}

function serializeMap(map: FeatureMap): string {
  return JSON.stringify(Object.fromEntries(map));
}

function deserializeMap(raw: string): FeatureMap {
  const obj = JSON.parse(raw) as Record<string, ResolvedFeature>;
  return new Map(Object.entries(obj));
}

export function createFeatureChecker(provider: DataProvider, cache: CacheClient) {
  async function getFeatureMap(entityType: EntityType, entityId: string): Promise<FeatureMap> {
    const key = cacheKey(entityType, entityId);
    const cached = await cache.get(key);
    if (cached) {
      return deserializeMap(cached);
    }
    const resolved = await resolveFeatures(entityType, entityId, provider);
    await cache.set(key, serializeMap(resolved), CACHE_TTL);
    return resolved;
  }

  return {
    async hasFeature(entityType: EntityType, entityId: string, featureKey: string): Promise<boolean> {
      const map = await getFeatureMap(entityType, entityId);
      return map.get(featureKey)?.enabled ?? false;
    },

    async getFeatureLimit(entityType: EntityType, entityId: string, featureKey: string): Promise<number | null> {
      const map = await getFeatureMap(entityType, entityId);
      return map.get(featureKey)?.limit ?? null;
    },

    async resolveAllFeatures(entityType: EntityType, entityId: string): Promise<FeatureMap> {
      return getFeatureMap(entityType, entityId);
    },

    async invalidateFeatureCache(entityType: EntityType, entityId: string): Promise<void> {
      await cache.del(cacheKey(entityType, entityId));
    },
  };
}

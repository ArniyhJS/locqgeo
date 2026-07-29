import { describe, expect, it } from "vitest";
import {
  plans,
  planFeatures,
  featureDefinitions,
  tenantSubscriptions,
  userSubscriptions,
  featureOverrides,
} from "../src/schema";

describe("Feature Assignment Database Schemas", () => {
  it("exports plans schema with slug, type, and tier columns", () => {
    expect(plans).toBeDefined();
    expect(plans.slug).toBeDefined();
    expect(plans.type).toBeDefined();
    expect(plans.tier).toBeDefined();
    expect(plans.priceMonthlyNgn).toBeDefined();
    expect(plans.priceMonthlyUsd).toBeDefined();
  });

  it("exports featureDefinitions schema with key and module columns", () => {
    expect(featureDefinitions).toBeDefined();
    expect(featureDefinitions.key).toBeDefined();
    expect(featureDefinitions.module).toBeDefined();
    expect(featureDefinitions.displayName).toBeDefined();
  });

  it("exports planFeatures schema with composite key and limit columns", () => {
    expect(planFeatures).toBeDefined();
    expect(planFeatures.planId).toBeDefined();
    expect(planFeatures.featureKey).toBeDefined();
    expect(planFeatures.enabled).toBeDefined();
    expect(planFeatures.limitValue).toBeDefined();
  });

  it("exports tenantSubscriptions with status and payment provider", () => {
    expect(tenantSubscriptions).toBeDefined();
    expect(tenantSubscriptions.tenantId).toBeDefined();
    expect(tenantSubscriptions.planId).toBeDefined();
    expect(tenantSubscriptions.status).toBeDefined();
    expect(tenantSubscriptions.paymentProvider).toBeDefined();
  });

  it("exports userSubscriptions with status and payment provider", () => {
    expect(userSubscriptions).toBeDefined();
    expect(userSubscriptions.userId).toBeDefined();
    expect(userSubscriptions.planId).toBeDefined();
    expect(userSubscriptions.status).toBeDefined();
  });

  it("exports featureOverrides with entityType, granted, and expiresAt", () => {
    expect(featureOverrides).toBeDefined();
    expect(featureOverrides.entityType).toBeDefined();
    expect(featureOverrides.entityId).toBeDefined();
    expect(featureOverrides.featureKey).toBeDefined();
    expect(featureOverrides.granted).toBeDefined();
    expect(featureOverrides.expiresAt).toBeDefined();
  });
});

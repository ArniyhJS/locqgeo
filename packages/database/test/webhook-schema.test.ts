import { describe, expect, it } from "vitest";
import { webhookSubscriptions, webhookDeliveries } from "../src/schema";

describe("Webhook Database Schemas", () => {
  it("exports webhookSubscriptions schema with targetUrl and secretKey", () => {
    expect(webhookSubscriptions).toBeDefined();
    expect(webhookSubscriptions.targetUrl).toBeDefined();
    expect(webhookSubscriptions.secretKey).toBeDefined();
  });

  it("exports webhookDeliveries schema with attemptCount and status", () => {
    expect(webhookDeliveries).toBeDefined();
    expect(webhookDeliveries.attemptCount).toBeDefined();
    expect(webhookDeliveries.status).toBeDefined();
  });
});

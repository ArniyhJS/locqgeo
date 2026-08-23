import { describe, expect, it } from "vitest";
import {
  CreateWebhookSubscriptionSchema,
  GenerateApiKeySchema,
  WebhookDeliveryQuerySchema,
} from "../src";

describe("Webhook Zod Contracts", () => {
  describe("CreateWebhookSubscriptionSchema", () => {
    it("validates correct webhook subscription payload with HTTPS URL", () => {
      const validPayload = {
        targetUrl: "https://api.merchant.com/locq-webhooks",
        subscribedEvents: ["verification.created", "reward.completed"],
        ipWhitelist: ["192.168.1.1"],
      };
      const result = CreateWebhookSubscriptionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects non-HTTPS target URL", () => {
      const invalidPayload = {
        targetUrl: "http://insecure.merchant.com/webhooks",
        subscribedEvents: ["verification.created"],
      };
      const result = CreateWebhookSubscriptionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects invalid URL format", () => {
      const invalidPayload = {
        targetUrl: "not-a-url",
        subscribedEvents: ["verification.created"],
      };
      const result = CreateWebhookSubscriptionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects empty subscribedEvents array", () => {
      const invalidPayload = {
        targetUrl: "https://api.merchant.com/webhooks",
        subscribedEvents: [],
      };
      const result = CreateWebhookSubscriptionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects invalid event types", () => {
      const invalidPayload = {
        targetUrl: "https://api.merchant.com/webhooks",
        subscribedEvents: ["invalid.event.type"],
      };
      const result = CreateWebhookSubscriptionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("GenerateApiKeySchema", () => {
    it("validates correct API key generation payload", () => {
      const validPayload = {
        keyLabel: "Mobile App Production Key",
        environment: "LIVE",
      };
      const result = GenerateApiKeySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("defaults environment to TEST if omitted", () => {
      const payloadWithoutEnv = {
        keyLabel: "Staging Key",
      };
      const result = GenerateApiKeySchema.safeParse(payloadWithoutEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.environment).toBe("TEST");
      }
    });

    it("rejects key label shorter than 2 characters", () => {
      const invalidPayload = {
        keyLabel: "A",
        environment: "TEST",
      };
      const result = GenerateApiKeySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects invalid environment value", () => {
      const invalidPayload = {
        keyLabel: "Valid Label",
        environment: "PRODUCTION",
      };
      const result = GenerateApiKeySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("WebhookDeliveryQuerySchema", () => {
    it("validates empty query payload with default values", () => {
      const result = WebhookDeliveryQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("validates full valid delivery query payload", () => {
      const validPayload = {
        subscriptionId: "123e4567-e89b-12d3-a456-426614174000",
        status: "SUCCESS",
        page: 2,
        limit: 50,
      };
      const result = WebhookDeliveryQuerySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects non-UUID subscriptionId", () => {
      const invalidPayload = {
        subscriptionId: "invalid-uuid",
      };
      const result = WebhookDeliveryQuerySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects invalid status", () => {
      const invalidPayload = {
        status: "UNKNOWN_STATUS",
      };
      const result = WebhookDeliveryQuerySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects page < 1 or limit > 100", () => {
      const invalidPage = WebhookDeliveryQuerySchema.safeParse({ page: 0 });
      expect(invalidPage.success).toBe(false);

      const invalidLimit = WebhookDeliveryQuerySchema.safeParse({ limit: 150 });
      expect(invalidLimit.success).toBe(false);
    });
  });
});

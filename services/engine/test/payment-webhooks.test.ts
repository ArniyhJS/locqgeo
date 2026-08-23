import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import {
  verifyPaystackSignature,
  verifyStripeSignature,
  handlePaymentWebhookEvent,
} from "../src/services/payment-webhook-service";

describe("Payment Webhook Ingestion Service", () => {
  it("verifies valid Paystack HMAC SHA-512 signature", () => {
    const secret = "paystack_sec_key_123";
    const body = JSON.stringify({ event: "charge.success", data: {} });
    const validSignature = crypto.createHmac("sha512", secret).update(body).digest("hex");

    expect(verifyPaystackSignature(body, validSignature, secret)).toBe(true);
    expect(verifyPaystackSignature(body, "invalid_sig", secret)).toBe(false);
  });

  it("verifies valid Stripe HMAC SHA-256 signature format", () => {
    const secret = "whsec_stripe_secret_123";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({ type: "invoice.paid" });
    const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
    const header = `t=${timestamp},v1=${signature}`;

    expect(verifyStripeSignature(payload, header, secret)).toBe(true);
    expect(verifyStripeSignature(payload, "t=123,v1=invalid", secret)).toBe(false);
  });

  it("handles payment event and returns invalidation payload", () => {
    const result = handlePaymentWebhookEvent({
      provider: "paystack",
      event: "subscription.create",
      entityType: "TENANT",
      entityId: "t-123",
      planId: "p-pro",
    });
    expect(result.success).toBe(true);
    expect(result.shouldInvalidateCache).toBe(true);
  });
});

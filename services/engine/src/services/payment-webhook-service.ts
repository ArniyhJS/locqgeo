import crypto from "crypto";

export function verifyPaystackSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac("sha512", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  if (!header || !secret) return false;
  const parts = header.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const timestamp = tPart.split("=")[1];
  const signature = v1Part.split("=")[1];
  const signedPayload = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export interface PaymentWebhookParams {
  provider: "paystack" | "stripe";
  event: string;
  entityType: "TENANT" | "USER";
  entityId: string;
  planId?: string;
}

export function handlePaymentWebhookEvent(params: PaymentWebhookParams) {
  return {
    success: true,
    shouldInvalidateCache: true,
    entityType: params.entityType,
    entityId: params.entityId,
  };
}

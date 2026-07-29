import type { FastifyInstance } from "fastify";
import {
  verifyPaystackSignature,
  verifyStripeSignature,
  handlePaymentWebhookEvent,
} from "../services/payment-webhook-service.js";

export async function paymentWebhookRoutes(fastify: FastifyInstance) {
  fastify.post("/api/v1/webhooks/paystack", async (request, reply) => {
    const signature = (request.headers["x-paystack-signature"] as string) || "";
    const bodyStr = JSON.stringify(request.body || {});
    const secret = process.env.PAYSTACK_SECRET_KEY || "paystack_secret";

    if (!verifyPaystackSignature(bodyStr, signature, secret)) {
      return reply.status(400).send({ error: "Invalid Paystack signature" });
    }

    const payload = request.body as any;
    const result = handlePaymentWebhookEvent({
      provider: "paystack",
      event: payload.event || "unknown",
      entityType: payload.data?.metadata?.entityType || "TENANT",
      entityId: payload.data?.metadata?.entityId || "demo-tenant",
    });

    return reply.status(200).send({ status: "success", data: result });
  });

  fastify.post("/api/v1/webhooks/stripe", async (request, reply) => {
    const signature = (request.headers["stripe-signature"] as string) || "";
    const bodyStr = JSON.stringify(request.body || {});
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "stripe_secret";

    if (!verifyStripeSignature(bodyStr, signature, secret)) {
      return reply.status(400).send({ error: "Invalid Stripe signature" });
    }

    const payload = request.body as any;
    const result = handlePaymentWebhookEvent({
      provider: "stripe",
      event: payload.type || "unknown",
      entityType: payload.data?.object?.metadata?.entityType || "TENANT",
      entityId: payload.data?.object?.metadata?.entityId || "demo-tenant",
    });

    return reply.status(200).send({ status: "success", data: result });
  });
}

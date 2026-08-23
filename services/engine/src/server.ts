import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { verifyRoutes } from "./routes/verify.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { userRoutes } from "./routes/users.js";
import { geofenceRoutes } from "./routes/geofences.js";
import { paymentWebhookRoutes } from "./routes/payment-webhooks.js";
import { telemetrySseRoutes } from "./routes/telemetry-sse.js";
import { swaggerDocsRoutes } from "./routes/swagger-docs.js";

const fastify = Fastify({
  logger: true,
});

// Register security & CORS middleware
await fastify.register(cors, { origin: "*" });
await fastify.register(helmet, { contentSecurityPolicy: false });

// Register Health Check Endpoint
fastify.get("/health", async () => {
  return { status: "ok", service: "locqengine-core", timestamp: new Date().toISOString() };
});

// Register Engine Verification Routes
await fastify.register(verifyRoutes);

// Register Campaign / Gamification Routes
await fastify.register(campaignRoutes);

// Register User Identity Routes
await fastify.register(userRoutes);

// Register Geofence & Bulk Import Routes
await fastify.register(geofenceRoutes);

// Register Payment Webhook Routes
await fastify.register(paymentWebhookRoutes);

// Register Telemetry SSE Stream Routes
await fastify.register(telemetrySseRoutes);

// Register Swagger OpenAPI Documentation Routes
await fastify.register(swaggerDocsRoutes);

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`LocqEngine core running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

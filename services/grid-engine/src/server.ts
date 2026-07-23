import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { pingRoutes } from "./routes/ping.js";

const fastify = Fastify({
  logger: true,
});

// Register security & CORS middleware
await fastify.register(cors, { origin: "*" });
await fastify.register(helmet, { contentSecurityPolicy: false });

// Register Health Check Endpoint
fastify.get("/health", async () => {
  return { status: "ok", service: "spottgrid-core-engine", timestamp: new Date().toISOString() };
});

// Register Grid Engine Routes
await fastify.register(pingRoutes);

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`⚡ SpottGrid Core Engine running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

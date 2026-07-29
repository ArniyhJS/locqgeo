import type { FastifyInstance } from "fastify";
import { globalTelemetryStream } from "../services/telemetry-stream.js";
import { randomUUID } from "node:crypto";

export async function telemetrySseRoutes(fastify: FastifyInstance) {
  fastify.get("/api/v1/engine/telemetry/stream", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    const clientId = randomUUID();
    globalTelemetryStream.addClient(clientId, reply);

    request.raw.on("close", () => {
      globalTelemetryStream.removeClient(clientId);
    });
  });
}

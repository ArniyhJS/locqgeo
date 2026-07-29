import type { FastifyInstance } from "fastify";
import { generateOpenApiSpecObject } from "../services/openapi-schema.js";

export async function swaggerDocsRoutes(fastify: FastifyInstance) {
  fastify.get("/docs/json", async (_request, reply) => {
    const spec = generateOpenApiSpecObject();
    return reply.status(200).send(spec);
  });
}

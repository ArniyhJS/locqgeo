import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { generateOpenApiSpecObject } from "../src/services/openapi-schema.js";
import { swaggerDocsRoutes } from "../src/routes/swagger-docs.js";

describe("OpenAPI Specification Generator & Swagger Docs Endpoint", () => {
  it("generates valid OpenAPI 3.0.3 document structure", () => {
    const spec = generateOpenApiSpecObject();
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info.title).toBe("SpottGeo Engine API");
    expect(spec.info.version).toBe("1.0.0");
    expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
    expect(spec.components.securitySchemes.ApiKeyAuth.name).toBe("X-Spott-Api-Key");
    expect(spec.paths["/api/v1/engine/verify"]).toBeDefined();
    expect(spec.paths["/api/v1/webhooks/paystack"]).toBeDefined();
    expect(spec.paths["/api/v1/webhooks/stripe"]).toBeDefined();
    expect(spec.paths["/api/v1/engine/telemetry/stream"]).toBeDefined();
  });

  it("serves OpenAPI spec json via GET /docs/json endpoint", async () => {
    const app = Fastify();
    await app.register(swaggerDocsRoutes);

    const response = await app.inject({
      method: "GET",
      url: "/docs/json",
    });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json.openapi).toBe("3.0.3");
    expect(json.info.title).toBe("SpottGeo Engine API");
  });
});

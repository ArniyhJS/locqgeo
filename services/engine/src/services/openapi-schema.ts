export function generateOpenApiSpecObject() {
  return {
    openapi: "3.0.3",
    info: {
      title: "SpottGeo Engine API",
      version: "1.0.0",
      description: "High-concurrency PostGIS presence verification, anti-cheat AI scoring, and developer webhooks API.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Local engine service" },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Spott-Api-Key",
        },
      },
    },
    paths: {
      "/api/v1/engine/verify": {
        post: {
          summary: "Verify location presence",
          security: [{ ApiKeyAuth: [] }],
          responses: {
            "200": { description: "Verification complete" },
          },
        },
      },
      "/api/v1/webhooks/paystack": {
        post: { summary: "Paystack subscription webhook" },
      },
      "/api/v1/webhooks/stripe": {
        post: { summary: "Stripe subscription webhook" },
      },
      "/api/v1/engine/telemetry/stream": {
        get: { summary: "Real-time SSE telemetry feed" },
      },
    },
  };
}

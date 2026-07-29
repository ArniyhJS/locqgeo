# Sub-Project 4: OpenAPI / Swagger API Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement OpenAPI 3.0 specification generator and `/docs/json` endpoint in `services/engine` for developer API documentation.

**Architecture:** `openapi-schema.ts` exports `generateOpenApiSpecObject()`. Fastify route `GET /docs/json` in `swagger-docs.ts` serves OpenAPI 3.0 spec.

**Tech Stack:** Fastify 5, OpenAPI 3.0, TypeScript 5.9, Vitest 4.

## Global Constraints
- OpenAPI version MUST be `3.0.3`.
- API title MUST be `SpottGeo Engine API`.
- Security scheme MUST define `X-Spott-Api-Key` header.
- Endpoint `/docs/json` MUST return valid OpenAPI object.
- All tests run with `pnpm --filter @spottgeo/engine test`.

---

### Task 1: Engine OpenAPI Generator & Docs Route (`services/engine`)

**Files:**
- Create: `services/engine/src/services/openapi-schema.ts`
- Create: `services/engine/src/routes/swagger-docs.ts`
- Test: `services/engine/test/swagger-docs.test.ts`

**Interfaces:**
- Produces: `generateOpenApiSpecObject()`, Fastify route `GET /docs/json`

- [ ] **Step 1: Write failing OpenAPI test**

Create `services/engine/test/swagger-docs.test.ts`:
```typescript
import { describe, expect, it } from "vitest";
import { generateOpenApiSpecObject } from "../src/services/openapi-schema";

describe("OpenAPI Specification Generator", () => {
  it("generates valid OpenAPI 3.0.3 document structure", () => {
    const spec = generateOpenApiSpecObject();
    expect(spec.openapi).toBe("3.0.3");
    expect(spec.info.title).toBe("SpottGeo Engine API");
    expect(spec.info.version).toBe("1.0.0");
    expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
    expect(spec.paths["/api/v1/engine/verify"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @spottgeo/engine test`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement OpenAPI Generator & Route**

Create `services/engine/src/services/openapi-schema.ts`:
```typescript
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
```

Create `services/engine/src/routes/swagger-docs.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import { generateOpenApiSpecObject } from "../services/openapi-schema.js";

export async function swaggerDocsRoutes(fastify: FastifyInstance) {
  fastify.get("/docs/json", async (_request, reply) => {
    const spec = generateOpenApiSpecObject();
    return reply.status(200).send(spec);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @spottgeo/engine test`
Run: `pnpm --filter @spottgeo/engine check-types`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add services/engine/src/services/openapi-schema.ts services/engine/src/routes/swagger-docs.ts services/engine/test/swagger-docs.test.ts
git commit -m "feat(engine): add openapi specification generator and docs json endpoint"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-openapi-swagger-api-documentation.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

Which approach would you like to take?

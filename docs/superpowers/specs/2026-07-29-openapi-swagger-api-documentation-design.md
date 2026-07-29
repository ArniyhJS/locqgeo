# Sub-Project 4: OpenAPI / Swagger API Documentation — Design Spec

## Overview

Configures automated OpenAPI 3.0 specification generation and interactive Swagger UI documentation for `services/engine` to empower 3rd-party developers integrating `@spottgeo/sdk`.

---

## 1. OpenAPI Specification Architecture

### Metadata
- Title: `SpottGeo Engine API`
- Version: `1.0.0`
- Description: `High-concurrency PostGIS presence verification, anti-cheat AI scoring, and developer webhooks API.`

### Security Schemes
- Header: `X-Spott-Api-Key` (`type: apiKey`, `in: header`, `name: X-Spott-Api-Key`)

### Exposed Endpoints
- `GET /docs`: Interactive Swagger UI
- `GET /docs/json`: Raw OpenAPI 3.0 JSON specification
- `POST /api/v1/engine/verify`: Presence verification endpoint
- `POST /api/v1/webhooks/paystack`: Paystack subscription webhook
- `POST /api/v1/webhooks/stripe`: Stripe subscription webhook
- `GET /api/v1/engine/telemetry/stream`: SSE real-time telemetry feed

---

## 2. Package Implementation

- **`services/engine/src/services/openapi-schema.ts`**: `generateOpenApiSpecObject()` helper creating valid OpenAPI 3.0 definition object.
- **`services/engine/src/routes/swagger-docs.ts`**: Fastify route handling `/docs/json` and returning OpenAPI JSON structure.
- **`services/engine/test/swagger-docs.test.ts`**: Unit test asserting valid OpenAPI 3.0 schema version, title, endpoints, and security schemes.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { pingRoutes } from "./ping.js";

describe("SpottGrid Core Engine - POST /api/v1/grid/ping Spec v3.1.0", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    await app.register(pingRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Step 1: Should reject pings with accuracy > 50.0m", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: "test_device_001",
        latitude: 6.5244,
        longitude: 3.3792,
        accuracy_meters: 65.0, // > 50.0m threshold cap
        node_id: "00000000-0000-0000-0000-000000000001",
      },
    });

    expect(res.statusCode).toBe(400); // Rejected by Zod Accuracy Invariant cap
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe("INVALID_PAYLOAD");
  });

  it("Step 3: Should reject pings exceeding 55.56 m/s (200 km/h) velocity threshold with REJECTED_VELOCITY", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: "test_device_speedster",
        latitude: 9.0765,
        longitude: 7.3986,
        accuracy_meters: 5.0,
        velocity_mps: 75.0, // > 55.56 m/s threshold
        node_id: "00000000-0000-0000-0000-000000000002",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.claim_eligible).toBe(false);
    expect(body.status).toBe("REJECTED_VELOCITY");
    expect(body.anticheat.velocity_valid).toBe(false);
  });

  it("Step 4: Should return SUCCESS status for pings within geofence and valid parameters", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: "test_device_valid_user",
        latitude: 6.5244,
        longitude: 3.3792,
        accuracy_meters: 10.0,
        node_id: "00000000-0000-0000-0000-000000000001",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.status).toBe("SUCCESS");
    expect(body.claim_eligible).toBe(true);
    expect(body.payout).toBeDefined();
  });
});

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

  it("Step 1: Should reject pings with accuracy > 50.0m with ERR_LOW_GPS_ACCURACY", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: "test_device_00001_node_id",
        latitude: 6.5244,
        longitude: 3.3792,
        accuracy_meters: 65.0, // Exceeds 50.0m threshold
        node_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.status).toBe("REJECTED_ACCURACY");
    expect(body.error_code).toBe("ERR_LOW_GPS_ACCURACY");
  });

  it("Step 3: Should reject pings exceeding 55.56 m/s (200 km/h) velocity threshold with ERR_IMPOSSIBLE_SPEED", async () => {
    const deviceId = "speed_device_test_12345";
    const nodeId1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
    const nodeId2 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23";

    // 1st Ping
    await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: deviceId,
        latitude: 6.5244,
        longitude: 3.3792,
        accuracy_meters: 5.0,
        node_id: nodeId1,
      },
    });

    // 2nd Ping immediately teleporting 50 km away (velocity > 55.56 m/s) to nodeId2
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: deviceId,
        latitude: 7.0000,
        longitude: 3.8000,
        accuracy_meters: 5.0,
        node_id: nodeId2,
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.status).toBe("REJECTED_VELOCITY");
    expect(body.error_code).toBe("ERR_IMPOSSIBLE_SPEED");
  });

  it("Step 4: Should return VERIFIED status for pings within geofence and valid parameters", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/grid/ping",
      payload: {
        device_id: "valid_device_id_12345678",
        latitude: 6.5244,
        longitude: 3.3792,
        accuracy_meters: 8.0,
        node_id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.status).toBe("VERIFIED");
    expect(body.data.reward.payout_status).toBe("QUEUED");
  });
});

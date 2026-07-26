import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";

const mockExecute = vi.fn();

vi.mock("@spottgeo/database", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  sql: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), ""),
}));

import { verifyRoutes } from "./verify.js";

describe("SpottEngine Generic Presence Engine - POST /api/v1/engine/verify", () => {
  let app: FastifyInstance;
  const validGeofenceId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  beforeAll(async () => {
    app = Fastify();
    await app.register(verifyRoutes);
    await app.ready();
  });

  beforeEach(() => {
    mockExecute.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  const basePayload = {
    device_id: "test_device_0001",
    latitude: 6.5244,
    longitude: 3.3792,
    accuracy_meters: 5.0,
    geofence_id: validGeofenceId,
  };

  it("rejects pings with accuracy > 50.0m", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]); // recent 60s pings

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: { ...basePayload, accuracy_meters: 65.0 },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.status).toBe("REJECTED_ACCURACY");
    expect(body.error_code).toBe("ERR_LOW_GPS_ACCURACY");
    expect(body.details.spoof_score).toBeGreaterThanOrEqual(40);
    expect(body.details.fraud_score).toBeDefined();
  });

  it("rejects when per-device rate limit is exceeded (>5 in 60s)", async () => {
    const now = Date.now();
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([
        { created_ms: now - 1000 },
        { created_ms: now - 2000 },
        { created_ms: now - 3000 },
        { created_ms: now - 4000 },
        { created_ms: now - 5000 },
      ]); // 5 recent pings within 60s

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.status).toBe("REJECTED_RATE_LIMIT");
    expect(body.error_code).toBe("ERR_RATE_LIMIT_EXCEEDED");
    expect(body.details.fraud_signals).toContain("RATE_LIMIT_EXCEEDED");
  });

  it("rejects when the geofence does not exist", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([]); // geofence query

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.status).toBe("REJECTED_INACTIVE_GEOFENCE");
  });

  it("rejects when the geofence is inactive", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Test Zone",
          radius_meters: 50,
          action_type: "REWARD",
          reward_type: "AIRTIME",
          reward_amount: "500",
          reward_currency: "NGN",
          daily_budget_limit: "50000",
          daily_budget_spent: "0",
          is_active: false,
          distance_meters: 10,
        },
      ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("REJECTED_INACTIVE_GEOFENCE");
  });

  it("rejects duplicate verified events within 24 hours", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Test Zone",
          radius_meters: 50,
          action_type: "CHECKIN",
          reward_type: null,
          reward_amount: null,
          reward_currency: null,
          daily_budget_limit: null,
          daily_budget_spent: null,
          is_active: true,
          distance_meters: 5,
        },
      ])
      .mockResolvedValueOnce([{ id: "prior-verification" }]); // duplicate found

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("REJECTED_DUPLICATE");
  });

  it("rejects out-of-bounds pings using the geofence's own radius", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Test Zone",
          radius_meters: 25,
          action_type: "CHECKIN",
          reward_type: null,
          reward_amount: null,
          reward_currency: null,
          daily_budget_limit: null,
          daily_budget_spent: null,
          is_active: true,
          distance_meters: 80,
        },
      ])
      .mockResolvedValueOnce([]); // no duplicate

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("REJECTED_OUT_OF_BOUNDS");
    expect(body.message).toContain("25.0m");
  });

  it("rejects excessive computed velocity via AntiCheatFilter", async () => {
    mockExecute
      .mockResolvedValueOnce([
        {
          latitude: 6.5244,
          longitude: 3.3792,
          created_at: new Date(Date.now() - 1000),
          distance_delta_meters: 2000,
          time_delta_seconds: 1,
        },
      ]) // prior ping with impossible velocity
      .mockResolvedValueOnce([]); // recent 60s pings

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("REJECTED_VELOCITY");
    expect(body.details.spoof_score).toBeGreaterThanOrEqual(50);
  });

  it("returns a verified non-reward event for a generic check-in", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Test Zone",
          radius_meters: 100,
          action_type: "CHECKIN",
          reward_type: null,
          reward_amount: null,
          reward_currency: null,
          daily_budget_limit: null,
          daily_budget_spent: null,
          is_active: true,
          distance_meters: 12.5,
        },
      ])
      .mockResolvedValueOnce([]) // duplicate query
      .mockResolvedValueOnce(undefined) // ping insert
      .mockResolvedValueOnce(undefined); // verification insert

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.status).toBe("VERIFIED");
    expect(body.data.action_type).toBe("CHECKIN");
    expect(body.data.reward).toBeUndefined();
  });

  it("returns a verified reward event and triggers a payout", async () => {
    mockExecute
      .mockResolvedValueOnce([]) // prior ping query
      .mockResolvedValueOnce([]) // recent 60s pings
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Reward Zone",
          radius_meters: 50,
          action_type: "REWARD",
          reward_type: "AIRTIME",
          reward_amount: "500",
          reward_currency: "NGN",
          daily_budget_limit: "50000",
          daily_budget_spent: "0",
          is_active: true,
          distance_meters: 8.0,
        },
      ])
      .mockResolvedValueOnce([]) // duplicate query
      .mockResolvedValueOnce(undefined) // checkin_pings insert
      .mockResolvedValueOnce([{ reward_float_balance: "100000.00" }]) // tenant float query
      .mockResolvedValueOnce(undefined) // tenant float update
      .mockResolvedValueOnce(undefined); // verifications insert

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.action_type).toBe("REWARD");
    expect(body.data.reward).toBeDefined();
    expect(body.data.reward.amount).toBe(500);
  });
});

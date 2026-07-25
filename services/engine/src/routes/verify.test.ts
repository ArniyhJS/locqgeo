import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import Fastify, { FastifyInstance } from "fastify";

let mockExecute = vi.fn();

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
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("rejects when the geofence does not exist", async () => {
    mockExecute.mockResolvedValue([]);

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
    mockExecute.mockResolvedValue([
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
      .mockResolvedValueOnce([]) // no prior ping
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
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

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

  it("rejects excessive computed velocity", async () => {
    mockExecute
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
          distance_meters: 10,
        },
      ])
      .mockResolvedValueOnce([
        {
          latitude: 6.5244,
          longitude: 3.3792,
          created_at: new Date(Date.now() - 1000),
          distance_delta_meters: 2000,
          time_delta_seconds: 1,
        },
      ])
      .mockResolvedValueOnce([]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: basePayload,
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("REJECTED_VELOCITY");
  });

  it("returns a verified non-reward event for a generic check-in", async () => {
    mockExecute
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
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
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
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

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

  it("returns a verified event with campaign progress when campaign_id is provided", async () => {
    const campaignId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

    mockExecute
      .mockResolvedValueOnce([
        {
          id: validGeofenceId,
          tenant_id: "tenant-1",
          title: "Campaign Board",
          radius_meters: 100,
          action_type: "CHECKIN",
          reward_type: null,
          reward_amount: null,
          reward_currency: null,
          daily_budget_limit: null,
          daily_budget_spent: null,
          is_active: true,
          distance_meters: 8.0,
        },
      ])
      .mockResolvedValueOnce([
        {
          action_type: "CHECKIN",
          starts_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
          ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
          is_active: true,
          total_budget_limit: null,
          total_budget_spent: "0",
          reward_type: null,
          reward_amount: null,
          reward_currency: "NGN",
        },
      ])
      .mockResolvedValueOnce([]) // no prior ping
      .mockResolvedValueOnce([]) // no duplicate
      .mockResolvedValueOnce(undefined) // ping insert
      .mockResolvedValueOnce(undefined) // verification insert
      .mockResolvedValueOnce([{ visit_weight: 5, required_visit_order: null }]) // mapping
      .mockResolvedValueOnce(undefined) // progress insert
      .mockResolvedValueOnce([{ earned_points: 5 }]) // progress select
      .mockResolvedValueOnce(undefined) // leaderboard upsert
      .mockResolvedValueOnce([{ rank: 1 }]); // rank

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/engine/verify",
      payload: { ...basePayload, campaign_id: campaignId },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.action_type).toBe("CHECKIN");
    expect(body.data.campaign_id).toBe(campaignId);
    expect(body.data.points_earned).toBe(5);
    expect(body.data.leaderboard_rank).toBe(1);
  });
});

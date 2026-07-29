import { describe, expect, it, vi } from "vitest";
import { SpottGeoClient } from "../src/index.js";

describe("SpottGeo Developer SDK Client", () => {
  it("initializes SpottGeoClient with apiKey and environment", () => {
    const client = new SpottGeoClient({
      apiKey: "spott_test_12345",
      environment: "test",
    });
    expect(client).toBeDefined();
  });

  it("sends verifyPresence request with correct headers", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: "VERIFIED", verification_id: "ver_123" }),
    });

    const client = new SpottGeoClient({
      apiKey: "spott_live_99999",
      baseUrl: "https://api.spottgeo.com",
    });

    const res = await client.verifyPresence({
      geofenceId: "geo_123",
      latitude: 6.5244,
      longitude: 3.3792,
      accuracyMeters: 10,
    });

    expect(res.status).toBe("VERIFIED");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.spottgeo.com/api/v1/engine/verify",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Spott-Api-Key": "spott_live_99999",
        }),
      })
    );
  });
});

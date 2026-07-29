import { describe, expect, it } from "vitest";
import { deviceReputation, ipIntelligenceCache, fraudAlerts } from "../src/schema";

describe("Fraud Database Schemas", () => {
  it("exports deviceReputation schema with trustScore and status", () => {
    expect(deviceReputation).toBeDefined();
    expect(deviceReputation.deviceId).toBeDefined();
    expect(deviceReputation.trustScore).toBeDefined();
    expect(deviceReputation.status).toBeDefined();
  });

  it("exports ipIntelligenceCache and fraudAlerts schemas", () => {
    expect(ipIntelligenceCache).toBeDefined();
    expect(fraudAlerts).toBeDefined();
    expect(fraudAlerts.spoofScore).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";
import { parseTelemetrySseMessage } from "../src/hooks/useTelemetryStream";

describe("Console Telemetry SSE Parser", () => {
  it("parses valid SSE telemetry data string into object", () => {
    const rawData = '{"pingId":"p-99","status":"VERIFIED","spoofScore":10}';
    const parsed = parseTelemetrySseMessage(rawData);
    expect(parsed).toBeDefined();
    expect(parsed?.pingId).toBe("p-99");
    expect(parsed?.status).toBe("VERIFIED");
  });

  it("returns null for malformed SSE json payload", () => {
    const parsed = parseTelemetrySseMessage("invalid json");
    expect(parsed).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { formatSseFrame, TelemetryStreamManager } from "../src/services/telemetry-stream";

describe("Telemetry Stream Service", () => {
  it("formats valid SSE frame string", () => {
    const payload = { pingId: "p-1", deviceId: "d-1", status: "VERIFIED", spoofScore: 5 };
    const frame = formatSseFrame("telemetry", payload);
    expect(frame).toContain("event: telemetry\n");
    expect(frame).toContain('data: {"pingId":"p-1"');
    expect(frame.endsWith("\n\n")).toBe(true);
  });

  it("manages client connection registration and broadcasting", () => {
    const manager = new TelemetryStreamManager();
    const sentFrames: string[] = [];
    const mockReply = {
      raw: {
        write: (data: string) => sentFrames.push(data),
        writableEnded: false,
      },
    };

    manager.addClient("client-1", mockReply as any);
    expect(manager.getClientCount()).toBe(1);

    manager.broadcastEvent({ pingId: "p-100", status: "VERIFIED" });
    expect(sentFrames.length).toBe(1);
    expect(sentFrames[0]).toContain("p-100");

    manager.removeClient("client-1");
    expect(manager.getClientCount()).toBe(0);
  });

  it("removes client if writing throws or writableEnded is true", () => {
    const manager = new TelemetryStreamManager();
    const mockReplyEnded = {
      raw: {
        write: () => {},
        writableEnded: true,
      },
    };
    const mockReplyError = {
      raw: {
        write: () => {
          throw new Error("Socket closed");
        },
        writableEnded: false,
      },
    };

    manager.addClient("client-ended", mockReplyEnded as any);
    manager.addClient("client-error", mockReplyError as any);
    expect(manager.getClientCount()).toBe(2);

    manager.broadcastEvent({ pingId: "p-101" });
    expect(manager.getClientCount()).toBe(0);
  });
});

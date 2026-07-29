import { useEffect, useState } from "react";

export interface TelemetryEvent {
  pingId: string;
  deviceId: string;
  status: string;
  spoofScore: number;
  timestamp: string;
}

export function parseTelemetrySseMessage(rawData: string): TelemetryEvent | null {
  try {
    return JSON.parse(rawData) as TelemetryEvent;
  } catch {
    return null;
  }
}

export function useTelemetryStream(streamUrl: string = "/api/v1/engine/telemetry/stream") {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !streamUrl) return;

    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("telemetry", (event: MessageEvent) => {
      const parsed = parseTelemetrySseMessage(event.data);
      if (parsed) {
        setEvents((prev) => [parsed, ...prev]);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [streamUrl]);

  return { events, isConnected };
}

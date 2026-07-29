export function formatSseFrame(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export class TelemetryStreamManager {
  private clients: Map<string, any> = new Map();

  addClient(id: string, reply: any) {
    this.clients.set(id, reply);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  getClientCount(): number {
    return this.clients.size;
  }

  broadcastEvent(data: any) {
    const frame = formatSseFrame("telemetry", data);
    for (const [id, reply] of this.clients.entries()) {
      try {
        if (!reply.raw.writableEnded) {
          reply.raw.write(frame);
        } else {
          this.clients.delete(id);
        }
      } catch {
        this.clients.delete(id);
      }
    }
  }
}

export const globalTelemetryStream = new TelemetryStreamManager();

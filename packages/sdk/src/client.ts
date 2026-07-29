export interface SpottGeoClientConfig {
  apiKey: string;
  environment?: "live" | "test";
  baseUrl?: string;
}

export interface VerifyPresenceParams {
  geofenceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  deviceId?: string;
}

export class SpottGeoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SpottGeoClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.spottgeo.com";
  }

  public async verifyPresence(params: VerifyPresenceParams): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/engine/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Spott-Api-Key": this.apiKey,
      },
      body: JSON.stringify(params),
    });
    return res.json();
  }
}

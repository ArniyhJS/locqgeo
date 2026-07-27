import { z } from "zod";

export interface ScanPayloadResult {
  geofence_id?: string;
  campaign_id?: string;
  user_id?: string;
  alias?: string;
}

const RAW_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseScanPayload(raw: string): ScanPayloadResult {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  // JSON payload: { "geofence_id": "...", "campaign_id": "...", ... }
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return {
        geofence_id: typeof parsed.geofence_id === "string" ? parsed.geofence_id : undefined,
        campaign_id: typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
        user_id: typeof parsed.user_id === "string" ? parsed.user_id : undefined,
        alias: typeof parsed.alias === "string" ? parsed.alias : undefined,
      };
    } catch {
      return {};
    }
  }

  // URL payload: https://.../scan?geofence_id=...&campaign_id=...
  if (trimmed.toLowerCase().startsWith("http://") || trimmed.toLowerCase().startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      return {
        geofence_id: url.searchParams.get("geofence_id") ?? undefined,
        campaign_id: url.searchParams.get("campaign_id") ?? undefined,
        user_id: url.searchParams.get("user_id") ?? undefined,
        alias: url.searchParams.get("alias") ?? undefined,
      };
    } catch {
      return {};
    }
  }

  // Raw geofence UUID
  if (RAW_UUID_REGEX.test(trimmed)) {
    return { geofence_id: trimmed };
  }

  // Fallback: treat as a short alias / creative code
  return { alias: trimmed };
}

export const AliasResolutionRequestSchema = z.object({
  alias: z.string().min(1).max(100),
  tenant_id: z.string().uuid().optional(),
});

export type AliasResolutionRequest = z.infer<typeof AliasResolutionRequestSchema>;

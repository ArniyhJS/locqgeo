import { z } from "zod";

// -----------------------------------------------------------------
// 1. QR Payload & Geofence Scanner Schemas
// -----------------------------------------------------------------
export const QrScanPayloadSchema = z.object({
  geofence_id: z.string().uuid("Invalid QR Code: geofence_id must be a valid UUID v4"),
  tenant_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
  checksum: z.string().min(8).optional(),
});

export type QrScanPayload = z.infer<typeof QrScanPayloadSchema>;

// -----------------------------------------------------------------
// 2. Client Geolocation & Device Context
// -----------------------------------------------------------------
export const ClientLocationStateSchema = z.object({
  latitude: z.number().min(-90.0).max(90.0),
  longitude: z.number().min(-180.0).max(180.0),
  accuracy_meters: z.number().min(0.0),
  altitude_meters: z.number().nullable().optional(),
  timestamp: z.number().int().positive(),
});

export type ClientLocationState = z.infer<typeof ClientLocationStateSchema>;

// -----------------------------------------------------------------
// 3. Local Wallet / Verification Storage Schema
// -----------------------------------------------------------------
export const LocalVerificationRecordSchema = z.object({
  verification_id: z.string().uuid(),
  geofence_id: z.string().uuid(),
  geofence_title: z.string(),
  action_type: z.string(),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]).optional(),
  reward_amount: z.number().optional(),
  reward_currency: z.string().optional(),
  verified_at: z.string().datetime(),
  payout_status: z.enum(["NOT_APPLICABLE", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"]),
  redemption_code: z.string().optional(),
  campaign_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export type LocalVerificationRecord = z.infer<typeof LocalVerificationRecordSchema>;

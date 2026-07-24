import { z } from "zod";

// -----------------------------------------------------------------
// 1. QR Payload & Node Scanner Schemas
// -----------------------------------------------------------------
export const QrScanPayloadSchema = z.object({
  node_id: z.string().uuid("Invalid QR Code: node_id must be a valid UUID v4"),
  tenant_id: z.string().uuid().optional(),
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
// 3. Local Wallet & Claim Storage Schema
// -----------------------------------------------------------------
export const LocalClaimRecordSchema = z.object({
  claim_id: z.string().uuid(),
  node_id: z.string().uuid(),
  node_title: z.string(),
  reward_type: z.enum(["AIRTIME", "DATA", "CASH", "VOUCHER"]),
  reward_amount_ngn: z.number(),
  claimed_at: z.string().datetime(),
  payout_status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED"]),
  redemption_code: z.string().optional(),
});

export type LocalClaimRecord = z.infer<typeof LocalClaimRecordSchema>;

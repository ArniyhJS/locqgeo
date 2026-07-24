import { get, set, update } from "idb-keyval";
import type { LocalClaimRecord } from "@spottgeo/api-contracts";

const WALLET_STORAGE_KEY = "spott_wallet_claims_v1";
const OFFLINE_QUEUE_KEY = "spott_offline_pings_v1";

export interface PendingOfflinePing {
  id: string;
  node_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  timestamp: number;
}

// -------------------------------------------------------------
// Local Wallet Claim Management
// -------------------------------------------------------------
export async function getLocalClaims(): Promise<LocalClaimRecord[]> {
  if (typeof window === "undefined") return [];
  const claims = await get<LocalClaimRecord[]>(WALLET_STORAGE_KEY);
  return claims || [];
}

export async function saveLocalClaim(claim: LocalClaimRecord): Promise<void> {
  if (typeof window === "undefined") return;
  await update<LocalClaimRecord[]>(WALLET_STORAGE_KEY, (val) => {
    const list = val || [];
    const exists = list.some((c) => c.claim_id === claim.claim_id);
    return exists ? list : [claim, ...list];
  });
}

// -------------------------------------------------------------
// Offline Ping Queue Management
// -------------------------------------------------------------
export async function enqueueOfflinePing(ping: PendingOfflinePing): Promise<void> {
  if (typeof window === "undefined") return;
  await update<PendingOfflinePing[]>(OFFLINE_QUEUE_KEY, (val) => {
    const list = val || [];
    return [...list, ping];
  });
}

export async function getOfflineQueue(): Promise<PendingOfflinePing[]> {
  if (typeof window === "undefined") return [];
  const queue = await get<PendingOfflinePing[]>(OFFLINE_QUEUE_KEY);
  return queue || [];
}

export async function clearOfflineQueue(): Promise<void> {
  if (typeof window === "undefined") return;
  await set(OFFLINE_QUEUE_KEY, []);
}

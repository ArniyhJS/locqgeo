import { get, set, update } from "idb-keyval";
import type { LocalVerificationRecord } from "@spottgeo/api-contracts";

const WALLET_STORAGE_KEY = "spott_wallet_verifications_v1";
const OFFLINE_QUEUE_KEY = "spott_offline_pings_v1";

export interface PendingOfflinePing {
  id: string;
  geofence_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  timestamp: number;
}

export async function getLocalVerifications(): Promise<LocalVerificationRecord[]> {
  if (typeof window === "undefined") return [];
  const records = await get<LocalVerificationRecord[]>(WALLET_STORAGE_KEY);
  return records || [];
}

export async function saveLocalVerification(record: LocalVerificationRecord): Promise<void> {
  if (typeof window === "undefined") return;
  await update<LocalVerificationRecord[]>(WALLET_STORAGE_KEY, (val) => {
    const list = val || [];
    const exists = list.some((r) => r.verification_id === record.verification_id);
    return exists ? list : [record, ...list];
  });
}

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

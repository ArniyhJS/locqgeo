import { get, set, update } from "idb-keyval";
import type { LocalVerificationRecord } from "@locqgeo/api-contracts";

const HISTORY_STORAGE_KEY = "locq_verify_history_v1";
const OFFLINE_QUEUE_KEY = "locq_verify_offline_v1";

export interface PendingOfflineVerification {
  id: string;
  geofence_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  timestamp: number;
}

export async function getLocalVerifications(): Promise<LocalVerificationRecord[]> {
  if (typeof window === "undefined") return [];
  const records = await get<LocalVerificationRecord[]>(HISTORY_STORAGE_KEY);
  return records || [];
}

export async function saveLocalVerification(record: LocalVerificationRecord): Promise<void> {
  if (typeof window === "undefined") return;
  await update<LocalVerificationRecord[]>(HISTORY_STORAGE_KEY, (val) => {
    const list = val || [];
    const exists = list.some((r) => r.verification_id === record.verification_id);
    return exists ? list : [record, ...list];
  });
}

export async function enqueueOfflineVerification(item: PendingOfflineVerification): Promise<void> {
  if (typeof window === "undefined") return;
  await update<PendingOfflineVerification[]>(OFFLINE_QUEUE_KEY, (val) => [...(val || []), item]);
}

export async function getOfflineQueue(): Promise<PendingOfflineVerification[]> {
  if (typeof window === "undefined") return [];
  const queue = await get<PendingOfflineVerification[]>(OFFLINE_QUEUE_KEY);
  return queue || [];
}

export async function clearOfflineQueue(): Promise<void> {
  if (typeof window === "undefined") return;
  await set(OFFLINE_QUEUE_KEY, []);
}

"use client";

import { useEffect, useState } from "react";
import {
  getOfflineQueue,
  enqueueOfflineVerification,
  clearOfflineQueue,
  type PendingOfflineVerification,
} from "@/lib/db-store";

const API_URL = "http://localhost:8080/api/v1/engine/verify";

export function useOfflineQueue() {
  const [queue, setQueue] = useState<PendingOfflineVerification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getOfflineQueue().then(setQueue);
  }, []);

  const addOfflineItem = async (item: Omit<PendingOfflineVerification, "id" | "timestamp">) => {
    const record: PendingOfflineVerification = {
      ...item,
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    await enqueueOfflineVerification(record);
    const updated = await getOfflineQueue();
    setQueue(updated);
  };

  const syncQueue = async () => {
    if (isSyncing || queue.length === 0) return;
    setIsSyncing(true);

    try {
      for (const item of queue) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: "offline_device_0001",
            latitude: item.latitude,
            longitude: item.longitude,
            accuracy_meters: item.accuracy_meters,
            geofence_id: item.geofence_id,
          }),
        }).catch(() => null);
      }

      await clearOfflineQueue();
      setQueue([]);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    queue,
    pendingCount: queue.length,
    isSyncing,
    addOfflineItem,
    syncQueue,
  };
}

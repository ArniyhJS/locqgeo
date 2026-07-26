"use client";

import { useEffect, useState } from "react";
import {
  getOfflineQueue,
  enqueueOfflinePing,
  clearOfflineQueue,
  type PendingOfflinePing,
} from "@/lib/db-store";

export function useOfflineQueue() {
  const [queue, setQueue] = useState<PendingOfflinePing[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getOfflineQueue().then(setQueue);
  }, []);

  const addOfflinePing = async (ping: Omit<PendingOfflinePing, "id" | "timestamp">) => {
    const record: PendingOfflinePing = {
      ...ping,
      id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    await enqueueOfflinePing(record);
    const updated = await getOfflineQueue();
    setQueue(updated);
  };

  const syncQueue = async () => {
    if (isSyncing || queue.length === 0) return;
    setIsSyncing(true);

    try {
      // Background Sync Transmission Loop
      for (const item of queue) {
        await fetch("http://localhost:8080/api/v1/engine/verify", {
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
    addOfflinePing,
    syncQueue,
  };
}

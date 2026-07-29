"use client";

import { useEffect, useState } from "react";
import type { LocalVerificationRecord } from "@spottgeo/api-contracts";
import { getLocalVerifications } from "@/lib/db-store";
import { VerificationHistory, type VerificationItem } from "@/components/VerificationHistory";

export default function HistoryPage() {
  const [records, setRecords] = useState<LocalVerificationRecord[]>([]);

  useEffect(() => {
    getLocalVerifications().then(setRecords);
  }, []);

  const historyItems: VerificationItem[] = records.map((record) => ({
    id: record.verification_id,
    status: record.action_type === "VERIFY" ? "VERIFIED" : record.action_type,
    geofenceTitle: record.geofence_title,
    distanceMeters: 4.2,
    timestamp: new Date(record.verified_at).toLocaleString(),
  }));

  // Fallback demo items if no local records stored yet
  const displayItems =
    historyItems.length > 0
      ? historyItems
      : [
          {
            id: "rec_1",
            status: "VERIFIED",
            geofenceTitle: "Ikeja Tech Hub Geofence",
            distanceMeters: 4.2,
            timestamp: "2026-07-29 14:10:00",
          },
          {
            id: "rec_2",
            status: "VERIFIED_FLAGGED",
            geofenceTitle: "Victoria Island Checkpoint",
            distanceMeters: 18.5,
            timestamp: "2026-07-28 09:45:12",
          },
          {
            id: "rec_3",
            status: "REJECTED_SPOOF",
            geofenceTitle: "Lekki Phase 1 Event Zone",
            distanceMeters: 142.0,
            timestamp: "2026-07-27 18:22:05",
          },
        ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-extrabold text-white gradient-text-cyan">
          Verification History
        </h1>
        <p className="text-xs text-gray-400">Offline-cached presence records & telemetry log.</p>
      </div>

      <VerificationHistory items={displayItems} />
    </div>
  );
}

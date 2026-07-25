"use client";

import { useEffect, useState } from "react";
import type { LocalVerificationRecord } from "@spottgeo/api-contracts";
import { getLocalVerifications } from "@/lib/db-store";

export default function HistoryPage() {
  const [records, setRecords] = useState<LocalVerificationRecord[]>([]);

  useEffect(() => {
    getLocalVerifications().then(setRecords);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Verification History</h1>
        <p className="text-xs text-gray-400">Offline-cached presence records.</p>
      </div>

      {records.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-gray-400">No verifications yet.</div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.verification_id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {record.action_type}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(record.verified_at).toLocaleString()}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{record.geofence_title}</h4>
              {record.reward_amount && (
                <p className="text-xs text-emerald-400">
                  Reward: {record.reward_currency ?? "NGN"} {record.reward_amount}
                </p>
              )}
              <p className="text-[10px] text-gray-500 font-mono truncate">ID: {record.verification_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

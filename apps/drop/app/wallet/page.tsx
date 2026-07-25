"use client";

import { useEffect, useState } from "react";
import type { LocalVerificationRecord } from "@spottgeo/api-contracts";
import { getLocalVerifications } from "@/lib/db-store";
import { VerificationCard } from "@/components/wallet/VerificationCard";

export default function WalletPage() {
  const [records, setRecords] = useState<LocalVerificationRecord[]>([]);

  useEffect(() => {
    getLocalVerifications().then((stored) => {
      if (stored.length > 0) {
        setRecords(stored);
      } else {
        // Fallback demo records
        setRecords([
          {
            verification_id: "11111111-1111-1111-1111-111111111111",
            geofence_id: "22222222-2222-2222-2222-222222222222",
            geofence_title: "Lagos Island Tech Drop #04",
            action_type: "REWARD",
            reward_type: "AIRTIME",
            reward_amount: 500,
            reward_currency: "NGN",
            verified_at: new Date().toISOString(),
            payout_status: "COMPLETED",
            redemption_code: "SPT-8A91F2",
          },
          {
            verification_id: "33333333-3333-3333-3333-333333333333",
            geofence_id: "44444444-4444-4444-4444-444444444444",
            geofence_title: "Victoria Island Mall Drop #02",
            action_type: "REWARD",
            reward_type: "DATA",
            reward_amount: 1000,
            reward_currency: "NGN",
            verified_at: new Date(Date.now() - 86400000).toISOString(),
            payout_status: "COMPLETED",
            redemption_code: "SPT-3C10E4",
          },
        ]);
      }
    });
  }, []);

  const totalRewards = records.reduce((acc, r) => acc + (r.reward_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Local Verification Wallet</h1>
        <p className="text-xs text-gray-400">Offline-cached IndexedDB verification history and reward codes.</p>
      </div>

      <div className="glass-card p-6 rounded-3xl space-y-2 border border-emerald-500/30">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400">Total Reward Value</span>
        <div className="text-3xl font-black text-white">NGN {totalRewards.toLocaleString()}</div>
        <p className="text-xs text-gray-400">Airtime, Data & Cash Vouchers</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Verification History ({records.length})</h3>
          <span className="text-[10px] text-cyan-400 font-semibold">IndexedDB Sync</span>
        </div>

        {records.map((record) => (
          <VerificationCard key={record.verification_id} record={record} />
        ))}
      </div>
    </div>
  );
}

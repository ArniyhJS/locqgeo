"use client";

import { useEffect, useState } from "react";
import type { LocalVerificationRecord } from "@locqgeo/api-contracts";
import { getLocalVerifications } from "@/lib/db-store";
import { VerificationCard } from "@/components/wallet/VerificationCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const [records, setRecords] = useState<LocalVerificationRecord[]>([]);

  useEffect(() => {
    getLocalVerifications().then((stored) => {
      if (stored.length > 0) {
        setRecords(stored);
      } else {
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
            redemption_code: "LOCQ-8A91F2",
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
            redemption_code: "LOCQ-3C10E4",
          },
        ]);
      }
    });
  }, []);

  const totalRewards = records.reduce((acc, r) => acc + (r.reward_amount ?? 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <Badge variant="default">
          👛 Offline Vault
        </Badge>
        <h1 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">Verification Wallet</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Offline-cached proof records & reward redemption codes.
        </p>
      </div>

      {/* Earnings Overview Card */}
      <Card className="p-5 space-y-2 border-indigo-500/40 bg-indigo-500/5 dark:bg-indigo-500/10 relative overflow-hidden shadow-sm">
        <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600 dark:text-indigo-400">
          Total Verified Earnings
        </span>
        <div className="text-3xl font-black text-[var(--text-primary)]">NGN {totalRewards.toLocaleString()}</div>
        <p className="text-xs text-[var(--text-secondary)]">Airtime, Data & Voucher Claims</p>
      </Card>

      {/* History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Claims History ({records.length})
          </h3>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">IndexedDB Cache Active</span>
        </div>

        {records.map((record) => (
          <VerificationCard key={record.verification_id} record={record} />
        ))}
      </div>
    </div>
  );
}

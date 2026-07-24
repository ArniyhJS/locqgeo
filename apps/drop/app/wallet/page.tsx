"use client";

import { useEffect, useState } from "react";
import type { LocalClaimRecord } from "@spottgeo/api-contracts";
import { getLocalClaims } from "@/lib/db-store";
import { ClaimCard } from "@/components/wallet/ClaimCard";

export default function WalletPage() {
  const [claims, setClaims] = useState<LocalClaimRecord[]>([]);

  useEffect(() => {
    getLocalClaims().then((stored) => {
      if (stored.length > 0) {
        setClaims(stored);
      } else {
        // Fallback demo claims
        setClaims([
          {
            claim_id: "00000000-0000-0000-0000-000000000001",
            node_id: "00000000-0000-0000-0000-000000000001",
            node_title: "Lagos Island Tech Drop #04",
            reward_type: "AIRTIME",
            reward_amount_ngn: 500,
            claimed_at: new Date().toISOString(),
            payout_status: "COMPLETED",
            redemption_code: "SPT-8A91F2",
          },
          {
            claim_id: "00000000-0000-0000-0000-000000000002",
            node_id: "00000000-0000-0000-0000-000000000002",
            node_title: "Victoria Island Mall Drop #02",
            reward_type: "DATA",
            reward_amount_ngn: 1000,
            claimed_at: new Date(Date.now() - 86400000).toISOString(),
            payout_status: "COMPLETED",
            redemption_code: "SPT-3C10E4",
          },
        ]);
      }
    });
  }, []);

  const totalEarnings = claims.reduce((acc, c) => acc + c.reward_amount_ngn, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Local Rewards Wallet</h1>
        <p className="text-xs text-gray-400">Offline-cached IndexedDB claim history & voucher redemption codes.</p>
      </div>

      {/* Balance Summary Card */}
      <div className="glass-card p-6 rounded-3xl space-y-2 border border-emerald-500/30">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400">Total Claimed Rewards</span>
        <div className="text-3xl font-black text-white">₦ {totalEarnings.toLocaleString()}</div>
        <p className="text-xs text-gray-400">Airtime, Data & Cash Vouchers</p>
      </div>

      {/* Claim Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Claim History ({claims.length})</h3>
          <span className="text-[10px] text-cyan-400 font-semibold">IndexedDB Sync</span>
        </div>

        {claims.map((claim) => (
          <ClaimCard key={claim.claim_id} claim={claim} />
        ))}
      </div>
    </div>
  );
}

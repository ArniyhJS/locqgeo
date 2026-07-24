"use client";

import { useState } from "react";
import type { LocalClaimRecord } from "@spottgeo/api-contracts";
import { PayoutStatusPill } from "./PayoutStatusPill";

interface ClaimCardProps {
  claim: LocalClaimRecord;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (claim.redemption_code) {
      navigator.clipboard.writeText(claim.redemption_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-5 space-y-3 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {claim.reward_type}
        </span>
        <PayoutStatusPill status={claim.payout_status} />
      </div>

      <div>
        <h4 className="font-bold text-sm text-white">{claim.node_title}</h4>
        <p className="text-[11px] text-gray-400">Claimed: {new Date(claim.claimed_at).toLocaleDateString()}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Reward Value</span>
          <div className="text-base font-extrabold text-emerald-400">₦ {claim.reward_amount_ngn}</div>
        </div>

        {claim.redemption_code && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
          >
            {copied ? "Copied! ✓" : claim.redemption_code}
          </button>
        )}
      </div>
    </div>
  );
}

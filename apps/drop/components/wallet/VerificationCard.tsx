"use client";

import { useState } from "react";
import type { LocalVerificationRecord } from "@spottgeo/api-contracts";
import { PayoutStatusPill } from "./PayoutStatusPill";

interface VerificationCardProps {
  record: LocalVerificationRecord;
}

export function VerificationCard({ record }: VerificationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (record.redemption_code) {
      navigator.clipboard.writeText(record.redemption_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-5 space-y-3 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {record.action_type}
        </span>
        <PayoutStatusPill status={record.payout_status} />
      </div>

      <div>
        <h4 className="font-bold text-sm text-white">{record.geofence_title}</h4>
        <p className="text-[11px] text-gray-400">
          Verified: {new Date(record.verified_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Reward Value</span>
          <div className="text-base font-extrabold text-emerald-400">
            {record.reward_amount
              ? `${record.reward_currency ?? "NGN"} ${record.reward_amount}`
              : "—"}
          </div>
        </div>

        {record.redemption_code && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : record.redemption_code}
          </button>
        )}
      </div>
    </div>
  );
}

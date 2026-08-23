"use client";

import { useState } from "react";
import type { LocalVerificationRecord } from "@locqgeo/api-contracts";
import { PayoutStatusPill } from "./PayoutStatusPill";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="p-5 space-y-3 hover:border-indigo-500/40 transition-colors">
      <div className="flex items-center justify-between">
        <Badge variant="default">
          {record.action_type}
        </Badge>
        <PayoutStatusPill status={record.payout_status} />
      </div>

      <div>
        <h4 className="font-bold text-sm text-[var(--text-primary)]">{record.geofence_title}</h4>
        <p className="text-[11px] text-[var(--text-muted)]">
          Verified: {new Date(record.verified_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
        <div>
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Reward Value</span>
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {record.reward_amount
              ? `${record.reward_currency ?? "NGN"} ${record.reward_amount}`
              : "—"}
          </div>
        </div>

        {record.redemption_code && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-colors cursor-pointer font-bold"
          >
            {copied ? "Copied!" : record.redemption_code}
          </button>
        )}
      </div>
    </Card>
  );
}

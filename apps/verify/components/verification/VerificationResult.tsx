"use client";

import Link from "next/link";
import type { PingResponseSuccess, PingResponseError } from "@locqgeo/api-contracts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VerificationResultProps {
  data?: PingResponseSuccess["data"];
  error?: PingResponseError;
}

export function VerificationResult({ data, error }: VerificationResultProps) {
  if (error) {
    return (
      <Card className="p-6 text-center space-y-4 border-rose-500/40 shadow-2xl bg-rose-500/5 dark:bg-rose-500/10">
        <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-rose-600 dark:text-rose-400">Verification Failed</h3>
          <p className="text-xs text-[var(--text-secondary)]">{error.message}</p>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-6 text-center space-y-4 border-indigo-500/40 shadow-2xl animate-in zoom-in-95 bg-indigo-500/5 dark:bg-indigo-500/10">
      <div className="h-16 w-16 mx-auto rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-2xl">
        🎉
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Presence Verified</h3>
        <p className="text-xs text-[var(--text-secondary)]">Geofence distance: {data.distance_meters}m</p>
        <p className="text-xs text-[var(--text-muted)] capitalize">Action: {data.action_type.toLowerCase()}</p>
      </div>

      {typeof data.points_earned === "number" && data.points_earned > 0 && (
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/30 space-y-2">
          <div className="text-3xl font-black text-[var(--text-primary)]">+{data.points_earned} pts</div>
          {typeof data.leaderboard_rank === "number" && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Leaderboard rank: #{data.leaderboard_rank}</p>
          )}
        </div>
      )}

      {data.reward && (
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/30 space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Reward</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {data.reward.currency} {data.reward.amount} {data.reward.type}
          </div>
        </div>
      )}

      <Link href="/history" className="block w-full">
        <Button variant="default" size="default" className="w-full text-xs font-bold">
          View Verification History
        </Button>
      </Link>
    </Card>
  );
}

"use client";

import Link from "next/link";

import type { PingResponseSuccess, PingResponseError } from "@locqgeo/api-contracts";

interface VerificationResultProps {
  data?: PingResponseSuccess["data"];
  error?: PingResponseError;
}

export function VerificationResult({ data, error }: VerificationResultProps) {
  if (error) {
    return (
      <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-rose-500/40 shadow-2xl">
        <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-2xl">
          Failed
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-rose-400">Verification Failed</h3>
          <p className="text-xs text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-blue-500/40 shadow-2xl animate-in zoom-in-95">
      <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-2xl">
        Verified
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black text-blue-400">Presence Verified</h3>
        <p className="text-xs text-gray-300">Geofence distance: {data.distance_meters}m</p>
        <p className="text-xs text-gray-400 capitalize">Action: {data.action_type.toLowerCase()}</p>
      </div>

      {typeof data.points_earned === "number" && data.points_earned > 0 && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
          <div className="text-3xl font-black text-white">+{data.points_earned} pts</div>
          {typeof data.leaderboard_rank === "number" && (
            <p className="text-xs text-blue-300">Leaderboard rank: #{data.leaderboard_rank}</p>
          )}
        </div>
      )}

      {data.reward && (
        <div className="p-4 rounded-2xl bg-gray-900/80 border border-blue-500/30 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Reward</span>
          <div className="text-2xl font-black text-white">
            {data.reward.currency} {data.reward.amount} {data.reward.type}
          </div>
        </div>
      )}

      <Link
        href="/history"
        className="w-full block glass-button py-3 rounded-2xl font-bold text-xs text-white"
      >
        View Verification History
      </Link>
    </div>
  );
}

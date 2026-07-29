"use client";

import React, { useState } from "react";

export default function StreaksPage() {
  const [streakData] = useState({
    currentStreakDays: 7,
    longestStreakDays: 14,
    multiplier: 1.3,
    streakSaversRemaining: 1,
    lastCheckinDate: "2026-07-29",
  });

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-white min-h-screen space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-[#ff6b00] tracking-tight uppercase">
          Daily Streak Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Check in daily by completing verified physical claims to escalate your reward multiplier!
        </p>
      </div>

      {/* Flame & Multiplier Main Card */}
      <div className="bg-gradient-to-b from-[#ff6b00]/20 via-slate-800 to-slate-800 border border-[#ff6b00]/40 rounded-3xl p-6 text-center shadow-xl shadow-[#ff6b00]/10 space-y-4">
        <div className="relative inline-block">
          <span className="text-7xl animate-pulse inline-block transform hover:scale-110 transition-transform cursor-pointer">
            🔥
          </span>
          <span className="absolute -bottom-1 -right-2 bg-[#ff6b00] text-black font-black text-xs px-2 py-0.5 rounded-full border border-black shadow">
            x{streakData.multiplier.toFixed(2)}
          </span>
        </div>

        <div>
          <h2 className="text-4xl font-black text-white">
            {streakData.currentStreakDays} <span className="text-xl font-bold text-slate-300">Days</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Personal Best: {streakData.longestStreakDays} Days</p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#ff6b00]/20 border border-[#ff6b00]/40 text-[#ff6b00] px-4 py-1.5 rounded-full font-bold text-sm">
          <span>⚡</span>
          <span>{streakData.multiplier.toFixed(2)}x Active Multiplier</span>
        </div>
      </div>

      {/* Streak Protection Status */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Streak Saver Protection</h3>
              <p className="text-xs text-slate-400">Prevents streak reset if you miss 1 check-in day</p>
            </div>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            streakData.streakSaversRemaining > 0
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-slate-700 text-slate-400"
          }`}>
            {streakData.streakSaversRemaining > 0 ? "ACTIVE" : "0 REMAINING"}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
          <span className="text-slate-400">Monthly Savers Available:</span>
          <span className="font-mono font-bold text-white">{streakData.streakSaversRemaining} / 1</span>
        </div>
      </div>

      {/* Multiplier Progression Tiers */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multiplier Milestones</h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <span className="font-medium text-slate-300">Days 1 - 2</span>
            <span className="font-bold text-slate-400">1.00x Base</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/40 text-[#ff6b00]">
            <span className="font-semibold">Days 3 - 6 (Current Tier)</span>
            <span className="font-black">1.15x Boost</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span className="font-semibold">Days 7 - 29</span>
            <span className="font-black">1.30x Boost</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <span className="font-semibold">Days 30+</span>
            <span className="font-black">1.50x Max Boost 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
}

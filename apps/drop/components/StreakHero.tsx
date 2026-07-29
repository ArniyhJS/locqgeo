"use client";

import React from "react";

export interface DayHistoryItem {
  day: string;
  date?: string;
  completed: boolean;
}

export interface StreakHeroProps {
  currentStreak?: number;
  multiplier?: number;
  streakSavers?: number;
  history?: DayHistoryItem[];
}

const DEFAULT_HISTORY: DayHistoryItem[] = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: true },
  { day: "Fri", completed: true },
  { day: "Sat", completed: true },
  { day: "Sun", completed: true },
];

export function StreakHero({
  currentStreak = 14,
  multiplier = 1.3,
  streakSavers = 1,
  history = DEFAULT_HISTORY,
}: StreakHeroProps) {
  return (
    <div className="glass-card p-6 space-y-6 text-white text-center relative overflow-hidden">
      {/* Glow aura accent */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF9F43]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Flame Counter Header */}
      <div className="flex flex-col items-center space-y-2 relative z-10">
        <div className="text-6xl animate-flame-flicker cursor-pointer transition-transform hover:scale-110">
          🔥
        </div>
        <h2 className="text-4xl font-extrabold font-mono tracking-tight gradient-text-amber">
          🔥 {currentStreak}-Day Streak
        </h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Check in daily to escalate your reward multiplier
        </p>
      </div>

      {/* Multiplier & Shield Status Badges */}
      <div className="flex items-center justify-center gap-3 pt-2 relative z-10">
        <div className="glass-card px-4 py-2 border-[#FF9F43]/40 flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#FF9F43] font-mono text-sm">{multiplier.toFixed(1)}x</span>
          <span className="text-gray-300">Multiplier Tier</span>
        </div>

        <div className="glass-card px-4 py-2 border-[#00F2FE]/40 flex items-center gap-2 text-xs font-semibold">
          <span>🛡️</span>
          <span className="text-[#00F2FE] font-mono text-sm">{streakSavers}</span>
          <span className="text-gray-300">Saver Active</span>
        </div>
      </div>

      {/* Rolling 7-day calendar history grid */}
      <div className="pt-4 border-t border-white/10 relative z-10 space-y-3">
        <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-1">
          <span>7-Day History</span>
          <span className="text-[#00E676] font-mono">
            {history.filter((h) => h.completed).length}/7 Verified
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {history.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-2 rounded-xl transition-all border ${
                item.completed
                  ? "glass-card border-[#FF9F43]/50 bg-[#FF9F43]/10 shadow-[0_0_12px_rgba(255,159,67,0.2)]"
                  : "bg-white/5 border-white/10 opacity-50"
              }`}
            >
              <span className="text-[10px] font-mono text-gray-400 uppercase">{item.day}</span>
              <span className="text-sm mt-1">
                {item.completed ? "🔥" : "⚪"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

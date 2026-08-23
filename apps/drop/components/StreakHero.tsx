"use client";

import React from "react";
import { Card } from "@/components/ui/card";

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
    <Card className="p-6 space-y-6 text-center relative overflow-hidden border-amber-500/30">
      {/* Glow aura accent */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Flame Counter Header */}
      <div className="flex flex-col items-center space-y-2 relative z-10">
        <div className="text-6xl animate-flame-flicker cursor-pointer transition-transform hover:scale-110">
          🔥
        </div>
        <h2 className="text-4xl font-extrabold font-mono tracking-tight text-amber-500 dark:text-amber-400">
          🔥 {currentStreak}-Day Streak
        </h2>
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">
          Check in daily to escalate your reward multiplier
        </p>
      </div>

      {/* Multiplier & Shield Status Badges */}
      <div className="flex items-center justify-center gap-3 pt-2 relative z-10">
        <div className="rounded-xl px-4 py-2 border border-amber-500/40 bg-amber-500/10 flex items-center gap-2 text-xs font-semibold">
          <span className="text-amber-600 dark:text-amber-400 font-mono text-sm font-bold">{multiplier.toFixed(1)}x</span>
          <span className="text-[var(--text-secondary)]">Multiplier Tier</span>
        </div>

        <div className="rounded-xl px-4 py-2 border border-indigo-500/40 bg-indigo-500/10 flex items-center gap-2 text-xs font-semibold">
          <span>🛡️</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold">{streakSavers}</span>
          <span className="text-[var(--text-secondary)]">Saver Active</span>
        </div>
      </div>

      {/* Rolling 7-day calendar history grid */}
      <div className="pt-4 border-t border-[var(--border-subtle)] relative z-10 space-y-3">
        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] font-medium px-1">
          <span>7-Day History</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            {history.filter((h) => h.completed).length}/7 Verified
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {history.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-2 rounded-xl transition-all border ${
                item.completed
                  ? "border-amber-500/50 bg-amber-500/10 shadow-xs"
                  : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] opacity-50"
              }`}
            >
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{item.day}</span>
              <span className="text-sm mt-1">
                {item.completed ? "🔥" : "⚪"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

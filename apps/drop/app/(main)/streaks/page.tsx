"use client";

import React, { useState } from "react";
import { StreakHero } from "@/components/StreakHero";
import { MysteryDropModal } from "@/components/MysteryDropModal";

export default function StreaksPage() {
  const [isMysteryDropOpen, setIsMysteryDropOpen] = useState(false);
  const [streakData] = useState({
    currentStreakDays: 14,
    multiplier: 1.3,
    streakSaversRemaining: 1,
    history: [
      { day: "Mon", completed: true },
      { day: "Tue", completed: true },
      { day: "Wed", completed: true },
      { day: "Thu", completed: true },
      { day: "Fri", completed: true },
      { day: "Sat", completed: true },
      { day: "Sun", completed: false },
    ],
  });

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen space-y-6 text-white">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black gradient-text-amber tracking-tight uppercase">
          Daily Streak Dashboard
        </h1>
        <p className="text-xs text-gray-400">
          Check in daily by completing verified physical claims to escalate your reward multiplier!
        </p>
      </div>

      {/* Hero Streak Component */}
      <StreakHero
        currentStreak={streakData.currentStreakDays}
        multiplier={streakData.multiplier}
        streakSavers={streakData.streakSaversRemaining}
        history={streakData.history}
      />

      {/* Mystery Drop Trigger CTA */}
      <div className="glass-card p-5 text-center space-y-3 border-[#FF9F43]/30">
        <h3 className="font-bold text-sm text-[#FF9F43]">🎁 Unopened Mystery Drop Available</h3>
        <p className="text-xs text-gray-400">
          You earned 1 mystery drop box from your 14-day geofence streak!
        </p>
        <button
          onClick={() => setIsMysteryDropOpen(true)}
          className="w-full py-3 rounded-xl glass-card border-[#FF9F43]/50 text-xs font-bold uppercase tracking-wider text-[#FF9F43] hover:bg-[#FF9F43]/10 transition-colors"
        >
          Open Mystery Drop
        </button>
      </div>

      {/* Mystery Drop Modal */}
      <MysteryDropModal
        isOpen={isMysteryDropOpen}
        onClose={() => setIsMysteryDropOpen(false)}
        rewardTitle="🎁 ₦500 Wallet Credit + 2x Multiplier Boost"
      />
    </div>
  );
}

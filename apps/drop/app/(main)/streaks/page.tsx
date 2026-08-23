"use client";

import React, { useState } from "react";
import { StreakHero } from "@/components/StreakHero";
import { MysteryDropModal } from "@/components/MysteryDropModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-amber-500 dark:text-amber-400 tracking-tight uppercase">
          Daily Streak Dashboard
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
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
      <Card className="p-5 text-center space-y-3 border-amber-500/30">
        <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400">🎁 Unopened Mystery Drop Available</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          You earned 1 mystery drop box from your 14-day geofence streak!
        </p>
        <Button
          onClick={() => setIsMysteryDropOpen(true)}
          variant="default"
          size="default"
          className="w-full text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black"
        >
          Open Mystery Drop
        </Button>
      </Card>

      {/* Mystery Drop Modal */}
      <MysteryDropModal
        isOpen={isMysteryDropOpen}
        onClose={() => setIsMysteryDropOpen(false)}
        rewardTitle="🎁 ₦500 Wallet Credit + 2x Multiplier Boost"
      />
    </div>
  );
}

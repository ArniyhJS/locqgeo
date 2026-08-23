"use client";

import React, { useState } from "react";
import { SquadQuestCard } from "@/components/SquadQuestCard";

export default function SquadsPage() {
  const [squad] = useState({
    id: "squad-1",
    name: "GeoHunters Lagos",
    currentCheckins: 85,
    targetCheckins: 100,
    members: [
      { id: "m1", name: "Aniebiet (You)", checkins: 30, rank: 1 },
      { id: "m2", name: "Tunde_Dev", checkins: 25, rank: 2 },
      { id: "m3", name: "Chioma_X", checkins: 20, rank: 3 },
      { id: "m4", name: "Kemi_Drop", checkins: 10, rank: 4 },
    ],
  });

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight uppercase">
          Squad Quest Dashboard
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Form 4-person squads and complete 100 geofence check-ins to unlock shared cash pools!
        </p>
      </div>

      {/* Squad Quest Card Component */}
      <SquadQuestCard
        squadName={squad.name}
        currentCheckins={squad.currentCheckins}
        targetCheckins={squad.targetCheckins}
        members={squad.members}
      />
    </div>
  );
}

"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SquadMemberItem {
  id: string;
  name: string;
  avatarUrl?: string;
  checkins: number;
  rank: number;
}

export interface SquadQuestCardProps {
  squadName?: string;
  currentCheckins?: number;
  targetCheckins?: number;
  members?: SquadMemberItem[];
}

const DEFAULT_MEMBERS: SquadMemberItem[] = [
  { id: "m1", name: "Aniebiet", checkins: 30, rank: 1 },
  { id: "m2", name: "Tunde", checkins: 25, rank: 2 },
  { id: "m3", name: "Chioma", checkins: 20, rank: 3 },
  { id: "m4", name: "Kemi", checkins: 10, rank: 4 },
];

export function SquadQuestCard({
  squadName = "GeoHunters Lagos",
  currentCheckins = 85,
  targetCheckins = 100,
  members = DEFAULT_MEMBERS,
}: SquadQuestCardProps) {
  const percentage = Math.min(100, Math.round((currentCheckins / targetCheckins) * 100));

  return (
    <Card className="p-6 space-y-6 relative overflow-hidden border-indigo-500/30">
      {/* Cyber-glass squad banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="space-y-1">
          <Badge variant="default">
            ⚡ Squad Quest
          </Badge>
          <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{squadName}</h3>
          <p className="text-xs text-[var(--text-secondary)]">Collaborative geofence check-in quest</p>
        </div>

        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden py-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-surface)] bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xs flex items-center justify-center shadow-md"
              title={m.name}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Animated Milestone Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[var(--text-secondary)]">Squad Quest Milestone</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {`${currentCheckins}/${targetCheckins} Geofence Check-ins`}
          </span>
        </div>

        <div className="w-full bg-[var(--bg-surface-elevated)] rounded-full h-3.5 overflow-hidden p-0.5 border border-[var(--border-subtle)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-[var(--text-muted)] text-right font-mono">
          {`${percentage}% Complete`}
        </p>
      </div>

      {/* Ranked Squad Contributor Leaderboard */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Top Contributors Leaderboard
        </h4>

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 font-mono font-bold text-center ${member.rank === 1 ? "text-amber-500" : member.rank === 2 ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                  {`#${member.rank}`}
                </span>
                <div className="font-semibold text-[var(--text-primary)]">{member.name}</div>
              </div>
              <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {`${member.checkins} check-ins`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

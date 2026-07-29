"use client";

import React from "react";

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
    <div className="glass-card p-6 space-y-6 text-white relative overflow-hidden">
      {/* Cyber-glass squad banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30">
            ⚡ Squad Quest
          </div>
          <h3 className="text-xl font-bold tracking-tight">{squadName}</h3>
          <p className="text-xs text-gray-400">Collaborative geofence check-in quest</p>
        </div>

        {/* Member Avatars Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden py-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0A0D14] bg-gradient-to-tr from-[#00F2FE] to-[#4FACFE] text-[#0A0D14] font-black text-xs flex items-center justify-center shadow-md"
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
          <span className="font-semibold text-gray-300">Squad Quest Milestone</span>
          <span className="font-mono font-bold text-[#FF9F43]">
            {`${currentCheckins}/${targetCheckins} Geofence Check-ins`}
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full animate-shimmer transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 text-right font-mono">
          {`${percentage}% Complete`}
        </p>
      </div>

      {/* Ranked Squad Contributor Leaderboard */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Top Contributors Leaderboard
        </h4>

        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl glass-card hover:bg-white/5 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 font-mono font-bold text-center ${member.rank === 1 ? "text-[#FF9F43]" : member.rank === 2 ? "text-gray-300" : "text-gray-500"}`}>
                  {`#${member.rank}`}
                </span>
                <div className="font-semibold text-white">{member.name}</div>
              </div>
              <div className="font-mono font-bold text-[#00F2FE]">
                {`${member.checkins} check-ins`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

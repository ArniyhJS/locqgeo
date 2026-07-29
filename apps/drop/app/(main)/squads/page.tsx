"use client";

import React, { useState } from "react";

interface SquadMember {
  id: string;
  name: string;
  role: "LEADER" | "MEMBER";
  claimsContributed: number;
}

export default function SquadsPage() {
  const [squad] = useState({
    id: "squad-1",
    name: "Lagos Drop Hunters",
    weeklyTargetClaims: 20,
    currentClaims: 12,
    rewardPoolNgn: 1000,
    status: "ACTIVE",
    members: [
      { id: "m1", name: "Aniebiet (You)", role: "LEADER", claimsContributed: 5 },
      { id: "m2", name: "Tunde_Dev", role: "MEMBER", claimsContributed: 4 },
      { id: "m3", name: "Chioma_X", role: "MEMBER", claimsContributed: 3 },
      { id: "m4", name: "Open Slot", role: "MEMBER", claimsContributed: 0 },
    ] as SquadMember[],
  });

  const progressPercent = Math.min(
    100,
    Math.round((squad.currentClaims / squad.weeklyTargetClaims) * 100)
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-slate-900 text-white min-h-screen space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-[#ff6b00] tracking-tight uppercase">
          Squad Quest Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Form 4-person squads and complete 20 verified physical claims per week to unlock shared ₦1,000 cash pools!
        </p>
      </div>

      {/* Main Squad Card */}
      <div className="bg-slate-800 border border-[#ff6b00]/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#ff6b00]/20 text-[#ff6b00] px-2.5 py-0.5 rounded-full border border-[#ff6b00]/30">
              ⚡ Weekly Quest
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{squad.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Reward Pool</span>
            <p className="text-lg font-black text-emerald-400">₦{squad.rewardPoolNgn.toLocaleString()}</p>
          </div>
        </div>

        {/* Quest Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Squad Target Progress</span>
            <span className="text-[#ff6b00] font-mono">
              {squad.currentClaims} / {squad.weeklyTargetClaims} Claims ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden p-0.5 border border-slate-600">
            <div
              className="bg-gradient-to-r from-[#ff6b00] to-amber-400 h-full rounded-full transition-all duration-500 shadow-md shadow-[#ff6b00]/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {squad.weeklyTargetClaims - squad.currentClaims} more claims needed to claim the ₦{squad.rewardPoolNgn} reward pool!
          </p>
        </div>
      </div>

      {/* Squad Members Roster */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Squad Roster ({squad.members.length}/4)
          </h3>
          <button className="text-xs font-bold text-[#ff6b00] hover:underline cursor-pointer">
            + Invite Friend
          </button>
        </div>

        <div className="space-y-2.5">
          {squad.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ff6b00]/20 border border-[#ff6b00]/40 flex items-center justify-center font-bold text-xs text-[#ff6b00]">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {member.name}
                    {member.role === "LEADER" && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                        LEADER
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Contributed: {member.claimsContributed} claims
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                {member.claimsContributed} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

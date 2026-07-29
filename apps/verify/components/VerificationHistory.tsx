"use client";

import React from "react";

export interface VerificationItem {
  id: string;
  status: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF" | string;
  geofenceTitle?: string;
  distanceMeters: number;
  timestamp: string;
}

export function VerificationHistory({ items }: { items: VerificationItem[] }) {
  if (items.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-xs text-gray-400">
        No verification history found.
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((item) => {
        let badgeStyle = "bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40";
        if (item.status === "VERIFIED_FLAGGED") {
          badgeStyle = "bg-[#FF9F43]/20 text-[#FF9F43] border-[#FF9F43]/40";
        } else if (item.status.includes("REJECTED")) {
          badgeStyle = "bg-[#FF1744]/20 text-[#FF1744] border-[#FF1744]/40";
        }

        return (
          <div
            key={item.id}
            className="glass-card p-4 flex items-center justify-between transition-all duration-200 hover:border-white/20"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-extrabold uppercase border ${badgeStyle}`}
                >
                  {item.status}
                </span>
                {item.geofenceTitle && (
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">
                    {item.geofenceTitle}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-mono">{item.timestamp}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-[#00F2FE]">
                {item.distanceMeters.toFixed(1)}m delta
              </div>
              <div className="text-[10px] text-gray-500 font-mono">GPS Verified</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

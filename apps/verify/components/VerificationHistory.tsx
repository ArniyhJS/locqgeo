"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
        No verification history found.
      </Card>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((item) => {
        let badgeVariant: "success" | "warning" | "destructive" = "success";
        if (item.status === "VERIFIED_FLAGGED") {
          badgeVariant = "warning";
        } else if (item.status.includes("REJECTED")) {
          badgeVariant = "destructive";
        }

        return (
          <Card
            key={item.id}
            className="p-4 flex items-center justify-between transition-all duration-200 hover:border-indigo-500/40 shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={badgeVariant}>
                  {item.status}
                </Badge>
                {item.geofenceTitle && (
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[150px]">
                    {item.geofenceTitle}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.timestamp}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {item.distanceMeters.toFixed(1)}m delta
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">GPS Verified</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

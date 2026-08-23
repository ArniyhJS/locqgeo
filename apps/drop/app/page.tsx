"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocqScanner } from "@/hooks/useLocqScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { RadarMap } from "@/components/radar/RadarMap";
import { NodeDetailsSheet } from "@/components/radar/NodeDetailsSheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NodeItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  rewardType: string;
  rewardAmount: number;
  distanceMeters: number;
}

export default function RadarPage() {
  const { currentLocation, isLocating, gpsError, captureLocation } = useLocqScanner();
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  const handleScanNode = (geofenceId: string) => {
    window.location.href = `/scan?geofence_id=${geofenceId}`;
  };

  return (
    <div className="space-y-5">
      {/* Hero Welcome & GPS Banner */}
      <Card className="border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="default">
              📍 Proof of Spatial Presence
            </Badge>
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Nearby Drops Radar</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Walk into a geofence zone & scan the billboard code to unlock airtime & data rewards.
            </p>
          </div>
          <Button
            onClick={() => captureLocation()}
            disabled={isLocating}
            variant="secondary"
            size="sm"
            className="shrink-0 font-bold"
            title="Refresh GPS"
          >
            {isLocating ? "Locating..." : "🔄 GPS"}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />
        </div>
      </Card>

      {gpsError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Main Interactive Radar Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Live Spatial Map
          </h2>
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Tap a node to inspect</span>
        </div>
        <RadarMap userLocation={currentLocation} onSelectNode={(node) => setSelectedNode(node)} />
      </div>

      {/* Gamification shortcuts */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Link href="/streaks">
          <Card className="p-4 flex items-center gap-3 hover:border-indigo-500 transition-colors cursor-pointer" interactive>
            <span className="text-2xl animate-flame-flicker">🔥</span>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Daily Streaks</p>
              <p className="text-[10px] text-[var(--text-muted)]">1.3x Multiplier Tier</p>
            </div>
          </Card>
        </Link>
        <Link href="/squads">
          <Card className="p-4 flex items-center gap-3 hover:border-indigo-500 transition-colors cursor-pointer" interactive>
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Squad Quests</p>
              <p className="text-[10px] text-[var(--text-muted)]">85% Completed</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* 1-Tap Camera Scan Action Button */}
      <div className="pt-1">
        <Link href="/scan" className="block w-full">
          <Button
            variant="default"
            size="lg"
            className="w-full py-4 text-sm font-bold shadow-lg shadow-indigo-500/30 gap-2"
          >
            <span className="text-base">📷</span>
            <span>Open Camera & Scan Billboard QR</span>
          </Button>
        </Link>
      </div>

      {/* Selected Drop Details Sheet */}
      <NodeDetailsSheet
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onScanClick={(geofenceId) => handleScanNode(geofenceId)}
      />
    </div>
  );
}

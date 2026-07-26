"use client";

import { useState } from "react";
import { useSpottScanner } from "@/hooks/useSpottScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { RadarMap } from "@/components/radar/RadarMap";
import { NodeDetailsSheet } from "@/components/radar/NodeDetailsSheet";

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
  const { currentLocation, isLocating, gpsError, captureLocation } = useSpottScanner();
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  const handleScanNode = (geofenceId: string) => {
    window.location.href = `/scan?geofence_id=${geofenceId}`;
  };

  return (
    <div className="space-y-5">
      {/* Hero Welcome & GPS Banner */}
      <div className="p5 glass-card rounded-2xl p-4 border border-[#ff6b00]/30 bg-gradient-to-b from-[#ff6b00]/10 to-transparent relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30">
              📍 Proof of Spatial Presence
            </span>
            <h1 className="text-xl font-black text-white tracking-tight">Nearby Drops Radar</h1>
            <p className="text-xs text-gray-300">
              Walk into a geofence zone & scan the billboard code to unlock airtime & data rewards.
            </p>
          </div>
          <button
            onClick={() => captureLocation()}
            disabled={isLocating}
            className="p-2.5 rounded-xl bg-[#0b0c0e] border border-[#ff6b00]/40 text-xs font-bold text-[#ff6b00] hover:bg-[#ff6b00]/20 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-lg shadow-[#ff6b00]/10"
            title="Refresh GPS"
          >
            {isLocating ? "Locating..." : "🔄 GPS"}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />
        </div>
      </div>

      {gpsError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Main Interactive Radar Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Spatial Map</h2>
          <span className="text-[10px] font-semibold text-[#ff6b00]">Tap a node to inspect</span>
        </div>
        <RadarMap userLocation={currentLocation} onSelectNode={(node) => setSelectedNode(node)} />
      </div>

      {/* 1-Tap Camera Scan Action Button */}
      <div className="pt-1">
        <a
          href="/scan"
          className="w-full glass-button py-4 rounded-2xl font-black text-sm text-[#0b0c0e] flex items-center justify-center gap-2 shadow-xl shadow-[#ff6b00]/30 transition-transform active:scale-95"
        >
          <span className="text-base">📷</span>
          <span>Open Camera & Scan Billboard QR</span>
        </a>
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

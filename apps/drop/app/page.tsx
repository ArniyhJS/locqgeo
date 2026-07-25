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
    <div className="space-y-6">
      {/* Top GPS Status Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Active Drops Radar</h1>
          <p className="text-xs text-gray-400">Step near a physical campaign node to claim rewards.</p>
        </div>
        <button
          onClick={() => captureLocation()}
          disabled={isLocating}
          className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-xs font-bold text-emerald-400 hover:border-emerald-500 cursor-pointer disabled:opacity-50"
        >
          {isLocating ? "locating..." : "🔄 GPS"}
        </button>
      </div>

      <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />

      {gpsError && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Live PostGIS Radar Map */}
      <RadarMap userLocation={currentLocation} onSelectNode={(node) => setSelectedNode(node)} />

      {/* Quick Action Button */}
      <div className="pt-2">
        <a
          href="/scan"
          className="w-full glass-button py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
        >
          📷 Open Camera & Scan Billboard QR
        </a>
      </div>

      {/* Selected Drop Details Bottom Sheet */}
      <NodeDetailsSheet
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onScanClick={(geofenceId) => handleScanNode(geofenceId)}
      />
    </div>
  );
}

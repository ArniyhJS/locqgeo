"use client";

import { useEffect, useState } from "react";

interface NodeItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  rewardType: string;
  rewardAmount: number;
  distanceMeters: number;
}

interface RadarMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  onSelectNode: (node: NodeItem) => void;
}

export function RadarMap({ userLocation, onSelectNode }: RadarMapProps) {
  const [nodes, setNodes] = useState<NodeItem[]>([]);

  useEffect(() => {
    // Simulated nearby active physical drops in Lagos
    setNodes([
      {
        id: "00000000-0000-0000-0000-000000000001",
        title: "Lagos Island Tech Drop #04",
        lat: 6.5244,
        lng: 3.3792,
        rewardType: "AIRTIME",
        rewardAmount: 500,
        distanceMeters: 14.5,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        title: "Victoria Island Mall Drop #02",
        lat: 6.4281,
        lng: 3.4219,
        rewardType: "DATA",
        rewardAmount: 1000,
        distanceMeters: 35.0,
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        title: "Ikeja City Mall Drop #01",
        lat: 6.6018,
        lng: 3.3515,
        rewardType: "CASH",
        rewardAmount: 2500,
        distanceMeters: 48.0,
      },
    ]);
  }, []);

  return (
    <div className="relative w-full h-80 rounded-3xl overflow-hidden glass-card border border-emerald-500/20 p-6 flex flex-col justify-between">
      {/* Background Radar Scanning Grid Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">Live PostGIS Radar</span>
          <h3 className="text-lg font-bold text-white leading-tight">Nearby Active Drops</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ● 3 Nodes in Range
        </span>
      </div>

      {/* Interactive Drops Grid List */}
      <div className="relative z-10 space-y-2 mt-4 overflow-y-auto max-h-48 pr-1">
        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => onSelectNode(node)}
            className="glass-card p-3 rounded-xl hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 group-hover:scale-110 transition-transform">
                📍
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">{node.title}</p>
                <p className="text-[10px] text-gray-400">Geofence Distance: ~{node.distanceMeters}m</p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-emerald-400">
              ₦ {node.rewardAmount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

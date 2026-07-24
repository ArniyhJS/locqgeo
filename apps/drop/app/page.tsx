"use client";

import { useState } from "react";
import type { PingRequest, PingResponseSuccess, PingResponseError } from "@spottgeo/api-contracts";

type PingResult = PingResponseSuccess | PingResponseError;

export default function RadarMapPage() {
  const [claiming, setClaiming] = useState(false);
  const [response, setResponse] = useState<PingResult | null>(null);

  const handleClaim = async () => {
    setClaiming(true);
    setResponse(null);

    // Construct ping request matching Spec v3.1.0 PingRequestSchema
    const pingPayload: PingRequest = {
      device_id: "dev_8a4f91e9b2019c8822ab",
      latitude: 6.5244,
      longitude: 3.3792,
      accuracy_meters: 8.5,
      node_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    };

    try {
      // Call SpottGrid Core Engine Fastify endpoint
      const res = await fetch("http://localhost:8080/api/v1/grid/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pingPayload),
      });

      const data: PingResult = await res.json();
      setResponse(data);
    } catch {
      // Demo response when offline
      setResponse({
        success: true,
        status: "VERIFIED",
        data: {
          claim_id: "claim_demo_12345678",
          distance_meters: 18,
          reward: {
            type: "AIRTIME",
            amount_ngn: 1000,
            payout_status: "QUEUED",
          },
        },
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Nearby Radar Drops</h1>
        <p className="text-xs text-gray-400 mt-0.5">Real-time GPS geofence radar active nearby.</p>
      </div>

      {/* Interactive Radar Visualizer */}
      <div className="pwa-card p-6 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[260px]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:14px_14px]"></div>

        {/* Pulse radar circles */}
        <div className="relative flex items-center justify-center">
          <div className="h-36 w-36 rounded-full border border-cyan-500/20 flex items-center justify-center animate-ping absolute"></div>
          <div className="h-28 w-28 rounded-full border border-cyan-500/30 flex items-center justify-center pulse-ring">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/40">
              📍
            </div>
          </div>
        </div>

        <div className="mt-6 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● 1 Drop In Range (18m)
          </span>
          <h3 className="font-bold text-base text-white mt-1">Lagos Island Tech Drop #04</h3>
          <p className="text-xs text-gray-400">Reward: ₦ 1,000 Instant Airtime / Data</p>
        </div>
      </div>

      {/* Claim Action */}
      <div className="space-y-3">
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {claiming ? "Verifying Anti-Cheat & PostGIS..." : "🎁 Claim Drop Reward"}
        </button>
      </div>

      {/* Response Card */}
      {response && (
        <div
          className={`pwa-card p-5 space-y-2 border ${
            response.success
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-rose-500/40 bg-rose-500/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                response.success
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {response.status}
            </span>
            <span className="text-xs text-gray-400">
              {response.success ? `${response.data.distance_meters}m away` : response.error_code}
            </span>
          </div>
          <p className="text-xs text-gray-300 font-medium">
            {response.success
              ? `Reward: ${response.data.reward.type} NGN ${response.data.reward.amount_ngn} (${response.data.reward.payout_status})`
              : response.message}
          </p>
        </div>
      )}
    </div>
  );
}

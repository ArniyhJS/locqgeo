"use client";

import React from "react";

export interface RadarScannerProps {
  accuracyMeters?: number;
  ipStatus?: string;
  signalStrengthBars?: number; // 1-4
  onVerify?: () => void;
  isVerifying?: boolean;
}

export function RadarScanner({
  accuracyMeters = 4.2,
  ipStatus = "Residential Clean",
  signalStrengthBars = 4,
  onVerify,
  isVerifying = false,
}: RadarScannerProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[75vh] p-6 text-white w-full max-w-md mx-auto">
      {/* Floating Glassmorphic Header displaying Telemetry */}
      <div className="glass-card px-5 py-3 w-full flex items-center justify-between text-xs font-medium tracking-wide shadow-xl border border-white/10">
        {/* GPS Accuracy */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
          <span className="text-gray-400">GPS:</span>
          <span className="font-mono text-[#00F2FE] font-bold">±{accuracyMeters.toFixed(1)}m</span>
        </div>

        {/* 4-bar Signal Strength Indicator */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400 mr-1 text-[10px] uppercase font-bold">Signal</span>
          <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`w-1 rounded-xs transition-colors ${
                  bar <= signalStrengthBars ? "bg-[#00F2FE] shadow-[0_0_6px_#00F2FE]" : "bg-white/20"
                }`}
                style={{ height: `${bar * 25}%` }}
              />
            ))}
          </div>
        </div>

        {/* Residential IP Status Badge */}
        <div className="flex items-center gap-1 bg-[#00F2FE]/10 px-2 py-1 rounded-md border border-[#00F2FE]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
          <span className="text-[11px] font-semibold text-[#00F2FE]">{ipStatus}</span>
        </div>
      </div>

      {/* 3D Circular Radar Grid */}
      <div className="relative w-72 h-72 my-10 flex items-center justify-center">
        {/* Outer Grid Ring 1 */}
        <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 bg-[#00F2FE]/5 shadow-[inset_0_0_30px_rgba(0,242,254,0.05)]" />
        {/* Inner Grid Ring 2 */}
        <div className="absolute inset-8 rounded-full border border-[#00F2FE]/30" />
        {/* Inner Grid Ring 3 */}
        <div className="absolute inset-16 rounded-full border border-[#00F2FE]/40" />
        {/* Inner Grid Ring 4 */}
        <div className="absolute inset-24 rounded-full border border-[#00F2FE]/50" />

        {/* Radar Crosshairs */}
        <div className="absolute w-full h-px bg-[#00F2FE]/20" />
        <div className="absolute h-full w-px bg-[#00F2FE]/20" />

        {/* Concentric Animated Scan Waves */}
        <div className="absolute inset-0 rounded-full border border-[#00F2FE] animate-radar-ping pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-[#00F2FE]/70 animate-radar-ping pointer-events-none [animation-delay:0.8s]" />

        {/* Glowing Cyan Center Pin with Pulse */}
        <div className="relative z-10 w-7 h-7 rounded-full bg-[#00F2FE] shadow-[0_0_25px_#00F2FE] flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        </div>
      </div>

      {/* Primary Glassmorphic CTA Button */}
      <button
        onClick={onVerify}
        disabled={isVerifying}
        className="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all duration-300 glass-card border-[#00F2FE]/40 hover:border-[#00F2FE] hover:shadow-[0_0_30px_rgba(0,242,254,0.35)] text-[#00F2FE] active:scale-98 disabled:opacity-50 cursor-pointer"
      >
        {isVerifying ? "Verifying Presence..." : "Verify Presence at Location"}
      </button>
    </div>
  );
}

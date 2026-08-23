"use client";

import React from "react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-between min-h-[70vh] p-4 text-[var(--text-primary)] w-full max-w-md mx-auto">
      {/* Floating Header displaying Telemetry */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-4 py-3 w-full flex items-center justify-between text-xs font-medium tracking-wide shadow-xs">
        {/* GPS Accuracy */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[var(--text-muted)]">GPS:</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">±{accuracyMeters.toFixed(1)}m</span>
        </div>

        {/* 4-bar Signal Strength Indicator */}
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)] mr-1 text-[10px] uppercase font-bold">Signal</span>
          <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className={`w-1 rounded-xs transition-colors ${
                  bar <= signalStrengthBars ? "bg-indigo-600 dark:bg-indigo-400 shadow-xs" : "bg-[var(--border-strong)]"
                }`}
                style={{ height: `${bar * 25}%` }}
              />
            ))}
          </div>
        </div>

        {/* Residential IP Status Badge */}
        <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{ipStatus}</span>
        </div>
      </div>

      {/* 3D Circular Radar Grid */}
      <div className="relative w-64 h-64 my-8 flex items-center justify-center">
        {/* Outer Grid Ring 1 */}
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 bg-indigo-500/5 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)]" />
        {/* Inner Grid Ring 2 */}
        <div className="absolute inset-8 rounded-full border border-indigo-500/30" />
        {/* Inner Grid Ring 3 */}
        <div className="absolute inset-16 rounded-full border border-indigo-500/40" />
        {/* Inner Grid Ring 4 */}
        <div className="absolute inset-24 rounded-full border border-indigo-500/50" />

        {/* Radar Crosshairs */}
        <div className="absolute w-full h-px bg-indigo-500/20" />
        <div className="absolute h-full w-px bg-indigo-500/20" />

        {/* Concentric Animated Scan Waves */}
        <div className="absolute inset-0 rounded-full border border-indigo-500 animate-radar-ping pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-indigo-500/70 animate-radar-ping pointer-events-none [animation-delay:0.8s]" />

        {/* Glowing Center Pin with Pulse */}
        <div className="relative z-10 w-7 h-7 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-md shadow-indigo-500/50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        </div>
      </div>

      {/* Primary CTA Button */}
      <Button
        onClick={onVerify}
        disabled={isVerifying}
        variant="default"
        size="lg"
        loading={isVerifying}
        className="w-full py-4 text-xs font-bold tracking-wider uppercase"
      >
        {isVerifying ? "Verifying Presence..." : "Verify Presence at Location"}
      </Button>
    </div>
  );
}

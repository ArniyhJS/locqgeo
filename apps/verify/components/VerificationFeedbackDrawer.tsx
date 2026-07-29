"use client";

import React from "react";

export interface TelemetryBreakdown {
  gpsAccuracy?: string;
  ipRiskScore?: number;
  distanceDelta?: string;
  spoofCheckResult?: string;
}

export interface VerificationFeedbackDrawerProps {
  isOpen: boolean;
  status: "VERIFIED" | "REJECTED_SPOOF" | "REJECTED_OUT_OF_BOUNDS" | string;
  rewardAmount?: string;
  telemetryBreakdown?: TelemetryBreakdown;
  onClose: () => void;
}

export function VerificationFeedbackDrawer({
  isOpen,
  status,
  rewardAmount = "₦150",
  telemetryBreakdown,
  onClose,
}: VerificationFeedbackDrawerProps) {
  if (!isOpen) return null;

  const isVerified = status === "VERIFIED";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card border-t border-white/20 rounded-t-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />

        {isVerified ? (
          /* VERIFIED State */
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#00E676]/20 border border-[#00E676]/50 flex items-center justify-center text-3xl text-[#00E676] shadow-[0_0_25px_rgba(0,230,118,0.4)]">
              ✓
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 mb-2">
                VERIFIED
              </span>
              <h3 className="text-xl font-bold text-white">Spatial Presence Verified!</h3>
            </div>
            <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
              Cryptographic location proof validated within target boundary.
            </p>
            <div className="glass-card px-4 py-2 border-[#00E676]/40 bg-[#00E676]/5 text-sm font-bold text-[#00E676]">
              Reward Credited: {rewardAmount}
            </div>
          </div>
        ) : (
          /* REJECTED State */
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FF1744]/20 border border-[#FF1744]/50 flex items-center justify-center text-3xl text-[#FF1744] shadow-[0_0_25px_rgba(255,23,68,0.4)]">
              ⚠️
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF1744]/10 text-[#FF1744] border border-[#FF1744]/30 mb-2">
                {status}
              </span>
              <h3 className="text-xl font-bold text-white">Verification Rejected</h3>
            </div>
            <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
              {status === "REJECTED_SPOOF"
                ? "Spoofing or proxy detection triggered during spatial telemetry validation."
                : "Location coordinates outside target geofence radius boundary."}
            </p>

            {/* Red Warning Card with Telemetry Breakdown */}
            <div className="w-full glass-card p-4 rounded-xl border-[#FF1744]/30 bg-[#FF1744]/10 text-left space-y-2 text-xs">
              <div className="font-bold text-[#FF1744] uppercase tracking-wider text-[10px]">
                Telemetry Breakdown
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-300 font-mono text-[11px]">
                <div>
                  Accuracy: <span className="text-white font-bold">{telemetryBreakdown?.gpsAccuracy ?? "±4.2m"}</span>
                </div>
                <div>
                  IP Risk: <span className="text-white font-bold">{telemetryBreakdown?.ipRiskScore ?? 85}%</span>
                </div>
                <div>
                  Delta: <span className="text-white font-bold">{telemetryBreakdown?.distanceDelta ?? "120m"}</span>
                </div>
                <div>
                  Result: <span className="text-[#FF1744] font-bold">{telemetryBreakdown?.spoofCheckResult ?? status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl glass-card text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

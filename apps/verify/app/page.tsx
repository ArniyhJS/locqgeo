"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RadarScanner } from "@/components/RadarScanner";
import { VerificationFeedbackDrawer } from "@/components/VerificationFeedbackDrawer";

export default function HomePage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    status: "VERIFIED" | "REJECTED_SPOOF" | "REJECTED_OUT_OF_BOUNDS";
  }>({
    isOpen: false,
    status: "VERIFIED",
  });

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setFeedbackState({
        isOpen: true,
        status: "VERIFIED",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 pt-2 pb-8">
      {/* Header Title */}
      <div className="text-center space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
          Proof of Spatial Presence
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight gradient-text-cyan">
          3D GPS Telemetry Verification
        </h1>
        <p className="text-xs text-gray-400 px-4">
          Sub-50ms cryptographic presence proof & geofence validation.
        </p>
      </div>

      {/* Interactive 3D Radar Scanner */}
      <div className="glass-card p-4 rounded-3xl border border-[#00F2FE]/20 shadow-2xl">
        <RadarScanner
          accuracyMeters={3.8}
          ipStatus="Residential Clean"
          signalStrengthBars={4}
          onVerify={handleVerify}
          isVerifying={isVerifying}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/scan"
          className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#00F2FE]/50 transition-all text-center space-y-1 block"
        >
          <div className="text-xl">📷</div>
          <div className="text-xs font-bold text-white">QR / NFC Scanner</div>
          <div className="text-[10px] text-gray-400">Scan event tags</div>
        </Link>
        <Link
          href="/history"
          className="glass-card p-4 rounded-2xl border border-white/10 hover:border-[#00F2FE]/50 transition-all text-center space-y-1 block"
        >
          <div className="text-xl">📜</div>
          <div className="text-xs font-bold text-white">Timeline Feed</div>
          <div className="text-[10px] text-gray-400">Verification log</div>
        </Link>
      </div>

      {/* Feedback Drawer */}
      <VerificationFeedbackDrawer
        isOpen={feedbackState.isOpen}
        status={feedbackState.status}
        rewardAmount="₦150"
        onClose={() => setFeedbackState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

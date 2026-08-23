"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RadarScanner } from "@/components/RadarScanner";
import { VerificationFeedbackDrawer } from "@/components/VerificationFeedbackDrawer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Badge variant="default">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Proof of Spatial Presence
        </Badge>
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          3D GPS Telemetry Verification
        </h1>
        <p className="text-xs text-[var(--text-secondary)] px-4">
          Sub-50ms cryptographic presence proof & geofence validation.
        </p>
      </div>

      {/* Interactive 3D Radar Scanner */}
      <Card className="p-4 border-indigo-500/20 shadow-xl">
        <RadarScanner
          accuracyMeters={3.8}
          ipStatus="Residential Clean"
          signalStrengthBars={4}
          onVerify={handleVerify}
          isVerifying={isVerifying}
        />
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/scan">
          <Card className="p-4 hover:border-indigo-500/50 transition-all text-center space-y-1 block" interactive>
            <div className="text-xl">📷</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">QR / NFC Scanner</div>
            <div className="text-[10px] text-[var(--text-muted)]">Scan event tags</div>
          </Card>
        </Link>
        <Link href="/history">
          <Card className="p-4 hover:border-indigo-500/50 transition-all text-center space-y-1 block" interactive>
            <div className="text-xl">📜</div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Timeline Feed</div>
            <div className="text-[10px] text-[var(--text-muted)]">Verification log</div>
          </Card>
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

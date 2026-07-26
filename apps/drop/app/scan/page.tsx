"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSpottScanner } from "@/hooks/useSpottScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { CameraView } from "@/components/scanner/CameraView";

function ScanContent() {
  const searchParams = useSearchParams();
  const targetGeofenceId = searchParams.get("geofence_id") || "";
  const {
    currentLocation,
    isLocating,
    isSubmitting,
    gpsError,
    scanError,
    verificationSuccessData,
    captureLocation,
    executeVerification,
  } = useSpottScanner();

  useEffect(() => {
    captureLocation().catch(() => {});
  }, [captureLocation]);

  const handleQrDecoded = async (scannedGeofenceId: string) => {
    if (isSubmitting) return;
    const finalGeofenceId = scannedGeofenceId.length === 36 ? scannedGeofenceId : targetGeofenceId;
    if (!finalGeofenceId) return;
    await executeVerification(finalGeofenceId);
  };

  return (
    <div className="space-y-5 max-w-sm mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
          Step 2 of 2: Physical Verification
        </span>
        <h1 className="text-xl font-extrabold text-white">QR Geofence Scanner</h1>
        <p className="text-xs text-gray-400">
          Point camera at billboard QR code to prove spatial presence.
        </p>
      </div>

      <div className="flex justify-center">
        <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />
      </div>

      {gpsError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
          ⚠️ {gpsError}
        </div>
      )}

      {scanError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
          ❌ {scanError}
        </div>
      )}

      {verificationSuccessData ? (
        <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-[#ff6b00] shadow-2xl animate-in zoom-in-95 bg-gradient-to-b from-[#ff6b00]/20 to-transparent">
          <div className="h-16 w-16 mx-auto rounded-full bg-[#ff6b00]/20 border-2 border-[#ff6b00] flex items-center justify-center text-3xl shadow-lg shadow-[#ff6b00]/40">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Spatial Presence Verified!</h3>
            <p className="text-xs text-gray-300">
              Geofence Proximity:{" "}
              <span className="font-bold text-[#ff6b00]">
                {verificationSuccessData.distance_meters}m
              </span>
            </p>
            <p className="text-xs text-gray-400 capitalize">
              Status: Verified & Anti-Cheat Validated
            </p>
          </div>

          {verificationSuccessData.reward && (
            <div className="p-4 rounded-2xl bg-[#0b0c0e]/90 border border-[#ff6b00]/40 space-y-1 shadow-inner">
              <span className="text-[10px] text-[#ff6b00] uppercase font-black tracking-wider">
                Reward Unlocked
              </span>
              <div className="text-2xl font-black text-white">
                {verificationSuccessData.reward.currency} {verificationSuccessData.reward.amount}{" "}
                {verificationSuccessData.reward.type}
              </div>
            </div>
          )}

          <a
            href="/wallet"
            className="w-full block glass-button py-3.5 rounded-2xl font-bold text-xs text-[#0b0c0e] shadow-xl shadow-[#ff6b00]/30"
          >
            View Code in Wallet 👛
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <CameraView onScanSuccess={handleQrDecoded} />

          {/* Quick Simulation Fallback Button for Testing */}
          <button
            onClick={() => targetGeofenceId && executeVerification(targetGeofenceId)}
            disabled={isLocating || isSubmitting || !targetGeofenceId}
            className="w-full glass-button py-3.5 rounded-2xl font-bold text-xs text-[#0b0c0e] disabled:opacity-50 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            {isSubmitting ? "Verifying Spatial Radius..." : "Simulate Presence Check"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-xs text-[#ff6b00]">Loading Scanner...</div>}
    >
      <ScanContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSpottScanner } from "@/hooks/useSpottScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { CameraView } from "@/components/scanner/CameraView";

function ScanContent() {
  const searchParams = useSearchParams();
  const targetNodeId = searchParams.get("node_id") || "00000000-0000-0000-0000-000000000001";
  const { currentLocation, isLocating, isSubmitting, gpsError, scanError, claimSuccessData, captureLocation, executeClaim } =
    useSpottScanner();

  useEffect(() => {
    captureLocation().catch(() => {});
  }, [captureLocation]);

  const handleQrDecoded = async (scannedNodeId: string) => {
    if (isSubmitting) return;
    const finalNodeId = scannedNodeId.length === 36 ? scannedNodeId : targetNodeId;
    await executeClaim(finalNodeId);
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-white">Billboard QR Scanner</h1>
        <p className="text-xs text-gray-400">Position physical QR code within camera reticle.</p>
      </div>

      <div className="flex justify-center">
        <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />
      </div>

      {gpsError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
          ⚠️ {gpsError}
        </div>
      )}

      {scanError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
          ❌ {scanError}
        </div>
      )}

      {claimSuccessData ? (
        <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-emerald-500/40 shadow-2xl animate-in zoom-in-95">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-2xl">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-emerald-400">Claim Verified!</h3>
            <p className="text-xs text-gray-300">Geofence Proximity: {claimSuccessData.distance_meters}m</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Reward Granted</span>
            <div className="text-2xl font-black text-white">
              ₦ {claimSuccessData.reward.amount_ngn} {claimSuccessData.reward.type}
            </div>
          </div>

          <a
            href="/wallet"
            className="w-full block glass-button py-3 rounded-2xl font-bold text-xs text-white"
          >
            👛 View Reward in Local Wallet
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <CameraView onScanSuccess={handleQrDecoded} />

          <button
            onClick={() => executeClaim(targetNodeId)}
            disabled={isLocating || isSubmitting}
            className="w-full glass-button py-3.5 rounded-2xl font-bold text-xs text-white disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isSubmitting ? "Verifying Geofence Ping..." : "⚡ Manual Simulation Scan"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-emerald-400">Loading Scanner...</div>}>
      <ScanContent />
    </Suspense>
  );
}

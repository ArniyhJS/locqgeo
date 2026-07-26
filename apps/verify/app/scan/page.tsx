"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifier } from "@/hooks/useVerifier";
import { CameraView } from "@/components/scanner/CameraView";
import { VerificationResult } from "@/components/verification/VerificationResult";
import type { PingResponseSuccess, PingResponseError } from "@spottgeo/api-contracts";

interface ScanPayload {
  geofence_id?: string;
  campaign_id?: string;
  user_id?: string;
}

function parseQrPayload(raw: string): ScanPayload {
  if (raw.startsWith("{")) {
    try {
      return JSON.parse(raw) as ScanPayload;
    } catch {
      return {};
    }
  }
  if (raw.length === 36) {
    return { geofence_id: raw };
  }
  return {};
}

function ScanContent() {
  const searchParams = useSearchParams();
  const targetGeofenceId = searchParams.get("geofence_id") || "";
  const targetCampaignId = searchParams.get("campaign_id") || "";
  const targetUserId = searchParams.get("user_id") || "";
  const [result, setResult] = useState<
    | { success: true; data: PingResponseSuccess["data"] }
    | { success: false; error: PingResponseError }
    | null
  >(null);

  const {
    currentLocation,
    isLocating,
    isSubmitting,
    gpsError,
    captureLocation,
    verifyPresence,
    reset,
  } = useVerifier();

  useEffect(() => {
    captureLocation().catch(() => {});
  }, [captureLocation]);

  const handleQrDecoded = async (raw: string) => {
    if (isSubmitting) return;
    const payload = parseQrPayload(raw);
    const finalGeofenceId = payload.geofence_id || targetGeofenceId;
    const finalCampaignId = payload.campaign_id || targetCampaignId;
    const finalUserId = payload.user_id || targetUserId;
    if (!finalGeofenceId) return;

    reset();
    const res = await verifyPresence(
      finalGeofenceId,
      finalCampaignId || undefined,
      finalUserId || undefined,
    );
    setResult(res);
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-white">Scan & Verify</h1>
        <p className="text-xs text-gray-400">Position the QR code inside the frame.</p>
      </div>

      {gpsError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
          {gpsError}
        </div>
      )}

      {result ? (
        <VerificationResult
          data={result.success ? result.data : undefined}
          error={!result.success ? result.error : undefined}
        />
      ) : (
        <div className="space-y-4">
          <CameraView onScanSuccess={handleQrDecoded} />

          <button
            onClick={() =>
              targetGeofenceId &&
              verifyPresence(
                targetGeofenceId,
                targetCampaignId || undefined,
                targetUserId || undefined,
              )
            }
            disabled={isLocating || isSubmitting || !targetGeofenceId}
            className="w-full glass-button py-3.5 rounded-2xl font-bold text-xs text-white disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isSubmitting
              ? "Verifying..."
              : isLocating
                ? "Acquiring GPS..."
                : "Simulate Manual Verification"}
          </button>

          {currentLocation && (
            <p className="text-center text-[10px] text-gray-500">
              GPS accuracy: {currentLocation.accuracy.toFixed(1)}m
            </p>
          )}
        </div>
      )}

      {result && (
        <button
          onClick={() => {
            reset();
            setResult(null);
          }}
          className="w-full py-3 rounded-2xl text-xs font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors"
        >
          Scan Another
        </button>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-xs text-blue-400">Loading Scanner...</div>}
    >
      <ScanContent />
    </Suspense>
  );
}

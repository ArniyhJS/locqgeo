"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  parseScanPayload,
  isNfcSupported,
  isBluetoothSupported,
  readNfcPayload,
  readBluetoothBeaconPayload,
} from "@spottgeo/api-contracts";
import { useVerifier } from "@/hooks/useVerifier";
import { CameraView } from "@/components/scanner/CameraView";
import { VerificationResult } from "@/components/verification/VerificationResult";
import type { PingResponseSuccess, PingResponseError } from "@spottgeo/api-contracts";

function ScanContent() {
  const searchParams = useSearchParams();
  const targetGeofenceId = searchParams.get("geofence_id") || "";
  const targetAlias = searchParams.get("alias") || "";
  const targetCampaignId = searchParams.get("campaign_id") || "";
  const targetUserId = searchParams.get("user_id") || "";

  const [manualAlias, setManualAlias] = useState("");
  const [hardwareMessage, setHardwareMessage] = useState<string | null>(null);

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

  const runVerification = async (payload: {
    geofenceId?: string;
    alias?: string;
    campaignId?: string;
    userId?: string;
  }) => {
    if (!payload.geofenceId && !payload.alias) {
      setHardwareMessage("A geofence ID or alias is required.");
      return;
    }

    setHardwareMessage(null);
    reset();
    const res = await verifyPresence(
      payload.geofenceId || "",
      payload.campaignId || undefined,
      payload.userId || undefined,
      payload.alias || undefined,
    );
    setResult(res);
  };

  const handleDecodedRaw = async (raw: string) => {
    if (isSubmitting) return;
    const payload = parseScanPayload(raw);
    await runVerification({
      geofenceId: payload.geofence_id || targetGeofenceId,
      alias: payload.alias || targetAlias,
      campaignId: payload.campaign_id || targetCampaignId,
      userId: payload.user_id || targetUserId,
    });
  };

  const handleManualAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAlias.trim() || isSubmitting) return;
    runVerification({ alias: manualAlias.trim() });
  };

  const handleNfcTap = async () => {
    if (isSubmitting) return;
    try {
      setHardwareMessage("Hold your device near the NFC tag...");
      const raw = await readNfcPayload();
      await handleDecodedRaw(raw);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "NFC read failed.";
      setHardwareMessage(msg);
    }
  };

  const handleBluetoothBeacon = async () => {
    if (isSubmitting) return;
    try {
      setHardwareMessage("Looking for SpottGeo Bluetooth beacon...");
      const raw = await readBluetoothBeaconPayload();
      await handleDecodedRaw(raw);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bluetooth beacon read failed.";
      setHardwareMessage(msg);
    }
  };

  const nfcSupported = isNfcSupported();
  const bluetoothSupported = isBluetoothSupported();

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-white">Scan & Verify</h1>
        <p className="text-xs text-gray-400">
          Scan a QR code, tap an NFC tag, or enter a location code.
        </p>
      </div>

      {gpsError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
          {gpsError}
        </div>
      )}

      {hardwareMessage && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium text-center">
          {hardwareMessage}
        </div>
      )}

      {result ? (
        <VerificationResult
          data={result.success ? result.data : undefined}
          error={!result.success ? result.error : undefined}
        />
      ) : (
        <div className="space-y-4">
          <CameraView onScanSuccess={handleDecodedRaw} />

          {/* Manual alias fallback */}
          <form onSubmit={handleManualAliasSubmit} className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Or enter location code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualAlias}
                onChange={(e) => setManualAlias(e.target.value)}
                placeholder="e.g. LAGOS-IKEJA-01"
                disabled={isSubmitting}
                className="flex-1 bg-[#0b0c0e] border border-blue-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !manualAlias.trim()}
                className="glass-button px-4 rounded-2xl font-bold text-xs text-white disabled:opacity-50 cursor-pointer"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Hardware scanners */}
          <div className="grid grid-cols-2 gap-3">
            {nfcSupported && (
              <button
                onClick={handleNfcTap}
                disabled={isSubmitting}
                className="py-3 rounded-2xl text-xs font-bold text-white border border-blue-500/30 hover:bg-blue-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Tap NFC Tag
              </button>
            )}
            {bluetoothSupported && (
              <button
                onClick={handleBluetoothBeacon}
                disabled={isSubmitting}
                className="py-3 rounded-2xl text-xs font-bold text-white border border-blue-500/30 hover:bg-blue-500/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Scan BLE Beacon
              </button>
            )}
          </div>

          {(!nfcSupported || !bluetoothSupported) && (
            <p className="text-center text-[10px] text-gray-500">
              {!nfcSupported && "NFC unavailable. "}
              {!bluetoothSupported && "Bluetooth unavailable."}
            </p>
          )}

          <button
            onClick={() =>
              runVerification({
                geofenceId: targetGeofenceId,
                alias: targetAlias,
                campaignId: targetCampaignId,
                userId: targetUserId,
              })
            }
            disabled={isLocating || isSubmitting || (!targetGeofenceId && !targetAlias)}
            className="w-full glass-button py-3.5 rounded-2xl font-bold text-xs text-white disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {isSubmitting
              ? "Verifying..."
              : isLocating
                ? "Acquiring GPS..."
                : targetGeofenceId || targetAlias
                  ? "Verify Linked Location"
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
            setHardwareMessage(null);
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

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
import { useSpottScanner } from "@/hooks/useSpottScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { CameraView } from "@/components/scanner/CameraView";

function ScanContent() {
  const searchParams = useSearchParams();
  const targetGeofenceId = searchParams.get("geofence_id") || "";
  const targetAlias = searchParams.get("alias") || "";
  const targetCampaignId = searchParams.get("campaign_id") || "";
  const targetUserId = searchParams.get("user_id") || "";

  const [manualAlias, setManualAlias] = useState("");
  const [hardwareMessage, setHardwareMessage] = useState<string | null>(null);

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

  const runVerification = async (payload: {
    geofenceId?: string;
    alias?: string;
    campaignId?: string;
    userId?: string;
  }) => {
    if (!payload.geofenceId && !payload.alias) {
      setHardwareMessage("No geofence ID or alias found in payload.");
      return;
    }

    setHardwareMessage(null);
    await executeVerification(payload);
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
    <div className="space-y-5 max-w-sm mx-auto">
      {/* Page Header */}
      <div className="text-center space-y-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
          Step 2 of 2: Physical Verification
        </span>
        <h1 className="text-xl font-extrabold text-white">Geofence Scanner</h1>
        <p className="text-xs text-gray-400">
          Scan a QR code, tap an NFC tag, or enter a location code to verify presence.
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

      {hardwareMessage && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium text-center">
          {hardwareMessage}
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
                className="flex-1 bg-[#0b0c0e] border border-[#ff6b00]/30 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff6b00]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !manualAlias.trim()}
                className="glass-button px-4 rounded-2xl font-bold text-xs text-[#0b0c0e] disabled:opacity-50 cursor-pointer"
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
                className="py-3 rounded-2xl text-xs font-bold text-white border border-[#ff6b00]/30 hover:bg-[#ff6b00]/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Tap NFC Tag
              </button>
            )}
            {bluetoothSupported && (
              <button
                onClick={handleBluetoothBeacon}
                disabled={isSubmitting}
                className="py-3 rounded-2xl text-xs font-bold text-white border border-[#ff6b00]/30 hover:bg-[#ff6b00]/10 transition-colors disabled:opacity-50 cursor-pointer"
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

          {/* Quick simulation fallback for testing */}
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
            className="w-full glass-button py-3.5 rounded-2xl font-bold text-xs text-[#0b0c0e] disabled:opacity-50 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            {isSubmitting
              ? "Verifying Spatial Radius..."
              : targetGeofenceId || targetAlias
                ? "Verify Linked Location"
                : "Simulate Presence Check"}
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

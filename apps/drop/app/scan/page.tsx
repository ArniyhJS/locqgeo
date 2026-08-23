"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  parseScanPayload,
  isNfcSupported,
  isBluetoothSupported,
  readNfcPayload,
  readBluetoothBeaconPayload,
} from "@locqgeo/api-contracts";
import { useLocqScanner } from "@/hooks/useLocqScanner";
import { AccuracyBadge } from "@/components/scanner/AccuracyBadge";
import { CameraView } from "@/components/scanner/CameraView";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  } = useLocqScanner();

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
      setHardwareMessage("Looking for LocqGeo Bluetooth beacon...");
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
        <Badge variant="default">
          Step 2 of 2: Physical Verification
        </Badge>
        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Geofence Scanner</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Scan a QR code, tap an NFC tag, or enter a location code to verify presence.
        </p>
      </div>

      <div className="flex justify-center">
        <AccuracyBadge accuracyMeters={currentLocation?.accuracy || null} />
      </div>

      {gpsError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium text-center">
          ⚠️ {gpsError}
        </div>
      )}

      {scanError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium text-center">
          ❌ {scanError}
        </div>
      )}

      {hardwareMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium text-center">
          {hardwareMessage}
        </div>
      )}

      {verificationSuccessData ? (
        <Card className="p-6 text-center space-y-4 border-indigo-500 shadow-2xl bg-indigo-500/10">
          <div className="h-16 w-16 mx-auto rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/40">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-primary)]">Spatial Presence Verified!</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Geofence Proximity:{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {verificationSuccessData.distance_meters}m
              </span>
            </p>
            <p className="text-xs text-[var(--text-muted)] capitalize">
              Status: Verified & Anti-Cheat Validated
            </p>
          </div>

          {verificationSuccessData.reward && (
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-indigo-500/40 space-y-1 shadow-inner">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-wider">
                Reward Unlocked
              </span>
              <div className="text-2xl font-black text-[var(--text-primary)]">
                {verificationSuccessData.reward.currency} {verificationSuccessData.reward.amount}{" "}
                {verificationSuccessData.reward.type}
              </div>
            </div>
          )}

          <Link href="/wallet" className="block w-full">
            <Button
              variant="default"
              size="lg"
              className="w-full py-3.5 text-xs font-bold"
            >
              View Code in Wallet 👛
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <CameraView onScanSuccess={handleDecodedRaw} />

          {/* Manual alias fallback */}
          <form onSubmit={handleManualAliasSubmit} className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Or enter location code
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={manualAlias}
                onChange={(e) => setManualAlias(e.target.value)}
                placeholder="e.g. LAGOS-IKEJA-01"
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !manualAlias.trim()}
                variant="default"
                size="default"
              >
                Verify
              </Button>
            </div>
          </form>

          {/* Hardware scanners */}
          <div className="grid grid-cols-2 gap-3">
            {nfcSupported && (
              <Button
                onClick={handleNfcTap}
                disabled={isSubmitting}
                variant="outline"
                size="default"
              >
                Tap NFC Tag
              </Button>
            )}
            {bluetoothSupported && (
              <Button
                onClick={handleBluetoothBeacon}
                disabled={isSubmitting}
                variant="outline"
                size="default"
              >
                Scan BLE Beacon
              </Button>
            )}
          </div>

          {(!nfcSupported || !bluetoothSupported) && (
            <p className="text-center text-[10px] text-[var(--text-muted)]">
              {!nfcSupported && "NFC unavailable. "}
              {!bluetoothSupported && "Bluetooth unavailable."}
            </p>
          )}

          {/* Quick simulation fallback for testing */}
          <Button
            onClick={() =>
              runVerification({
                geofenceId: targetGeofenceId,
                alias: targetAlias,
                campaignId: targetCampaignId,
                userId: targetUserId,
              })
            }
            disabled={isLocating || isSubmitting || (!targetGeofenceId && !targetAlias)}
            variant="secondary"
            size="lg"
            className="w-full py-3.5 text-xs font-bold"
          >
            {isSubmitting
              ? "Verifying Spatial Radius..."
              : targetGeofenceId || targetAlias
                ? "Verify Linked Location"
                : "Simulate Presence Check"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Loading Scanner...</div>}
    >
      <ScanContent />
    </Suspense>
  );
}

"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  parseScanPayload,
  isNfcSupported,
  isBluetoothSupported,
  readNfcPayload,
  readBluetoothBeaconPayload,
} from "@locqgeo/api-contracts";
import { useVerifier } from "@/hooks/useVerifier";
import { CameraView } from "@/components/scanner/CameraView";
import { RadarScanner } from "@/components/RadarScanner";
import { VerificationFeedbackDrawer } from "@/components/VerificationFeedbackDrawer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PingResponseSuccess, PingResponseError } from "@locqgeo/api-contracts";

function ScanContent() {
  const searchParams = useSearchParams();
  const targetGeofenceId = searchParams.get("geofence_id") || "";
  const targetAlias = searchParams.get("alias") || "";
  const targetCampaignId = searchParams.get("campaign_id") || "";
  const targetUserId = searchParams.get("user_id") || "";

  const [manualAlias, setManualAlias] = useState("");
  const [hardwareMessage, setHardwareMessage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setDrawerOpen(true);
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
    <div className="space-y-6 max-w-sm mx-auto pb-8">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Scan & Verify</h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Scan QR, tap NFC, or verify presence via 3D radar.
        </p>
      </div>

      {gpsError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium text-center">
          {gpsError}
        </div>
      )}

      {hardwareMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium text-center">
          {hardwareMessage}
        </div>
      )}

      {/* Radar Scanner Component */}
      <Card className="p-2 border-indigo-500/30 shadow-xl">
        <RadarScanner
          accuracyMeters={currentLocation?.accuracy || 4.2}
          ipStatus="Residential Clean"
          signalStrengthBars={4}
          isVerifying={isSubmitting || isLocating}
          onVerify={() =>
            runVerification({
              geofenceId: targetGeofenceId || "demo-geofence",
              alias: targetAlias || manualAlias || "LAGOS-IKEJA-01",
              campaignId: targetCampaignId,
              userId: targetUserId,
            })
          }
        />
      </Card>

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
      </div>

      {/* Verification Feedback Drawer */}
      <VerificationFeedbackDrawer
        isOpen={drawerOpen}
        status={
          result
            ? result.success
              ? "VERIFIED"
              : result.error.status
            : "VERIFIED"
        }
        rewardAmount={
          result && result.success && result.data.reward
            ? `${result.data.reward.currency || "NGN"} ${result.data.reward.amount}`
            : "₦150"
        }
        telemetryBreakdown={{
          gpsAccuracy: currentLocation ? `±${currentLocation.accuracy.toFixed(1)}m` : "±4.2m",
          ipRiskScore: result && !result.success ? 85 : 5,
          distanceDelta: result && result.success ? `${result.data.distance_meters.toFixed(1)}m` : "120m",
          spoofCheckResult: result ? (result.success ? "Passed" : result.error.error_code) : "Passed",
        }}
        onClose={() => setDrawerOpen(false)}
      />
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

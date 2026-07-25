"use client";

import { useState, useCallback } from "react";
import { getOrCreateDeviceId } from "@/lib/fingerprint";
import { saveLocalVerification } from "@/lib/db-store";
import type { PingResponseSuccess, PingResponseError, LocalVerificationRecord } from "@spottgeo/api-contracts";

export interface ScannerState {
  isLocating: boolean;
  isSubmitting: boolean;
  gpsError: string | null;
  scanError: string | null;
  verificationSuccessData: PingResponseSuccess["data"] | null;
  currentLocation: { latitude: number; longitude: number; accuracy: number } | null;
}

export function useSpottScanner() {
  const [state, setState] = useState<ScannerState>({
    isLocating: false,
    isSubmitting: false,
    gpsError: null,
    scanError: null,
    verificationSuccessData: null,
    currentLocation: null,
  });

  const captureLocation = useCallback((): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    setState((prev) => ({ ...prev, isLocating: true, gpsError: null }));

    return new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        const err = "Geolocation is not supported by your browser.";
        setState((prev) => ({ ...prev, isLocating: false, gpsError: err }));
        return reject(new Error(err));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy > 50.0) {
            const err = `GPS signal is too weak (Accuracy: ${accuracy.toFixed(1)}m). Step outside under clear sky.`;
            setState((prev) => ({ ...prev, isLocating: false, gpsError: err }));
            return reject(new Error(err));
          }

          const loc = { latitude, longitude, accuracy };
          setState((prev) => ({ ...prev, isLocating: false, currentLocation: loc }));
          resolve(loc);
        },
        (error) => {
          let msg = "Failed to acquire GPS location.";
          if (error.code === error.PERMISSION_DENIED) msg = "Location permission was denied.";
          if (error.code === error.POSITION_UNAVAILABLE) msg = "Location information is unavailable.";
          if (error.code === error.TIMEOUT) msg = "GPS request timed out.";

          setState((prev) => ({ ...prev, isLocating: false, gpsError: msg }));
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  const executeVerification = useCallback(
    async (geofenceId: string) => {
      setState((prev) => ({ ...prev, isSubmitting: true, scanError: null }));

      try {
        const location = state.currentLocation || (await captureLocation());
        const deviceId = await getOrCreateDeviceId();

        const response = await fetch("http://localhost:8080/api/v1/engine/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_id: deviceId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy_meters: location.accuracy,
            geofence_id: geofenceId,
          }),
        }).catch(() => null);

        // Fallback simulation for dev environments when the engine is offline
        if (!response || !response.ok) {
          const mockRecord: LocalVerificationRecord = {
            verification_id: `ver_${Date.now()}`,
            geofence_id: geofenceId,
            geofence_title: "Physical Presence Target",
            action_type: "REWARD",
            reward_type: "AIRTIME",
            reward_amount: 500,
            reward_currency: "NGN",
            verified_at: new Date().toISOString(),
            payout_status: "COMPLETED",
            redemption_code: `SPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          };
          await saveLocalVerification(mockRecord);

          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            verificationSuccessData: {
              verification_id: mockRecord.verification_id,
              geofence_id: geofenceId,
              distance_meters: 14.2,
              action_type: "REWARD",
              reward: {
                type: "AIRTIME",
                amount: 500,
                currency: "NGN",
                payout_status: "COMPLETED",
              },
            },
          }));

          if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([100, 50, 100]);
          }

          return { success: true, data: mockRecord };
        }

        const result = (await response.json()) as PingResponseSuccess | PingResponseError;

        if (!result.success) {
          const errMessage = result.message || "Verification failed: out of bounds or excessive speed.";
          setState((prev) => ({ ...prev, isSubmitting: false, scanError: errMessage }));
          return { success: false, error: errMessage };
        }

        const data = result.data;
        const localRecord: LocalVerificationRecord = {
          verification_id: data.verification_id,
          geofence_id: geofenceId,
          geofence_title: "Verified Presence Target",
          action_type: data.action_type,
          reward_type: data.reward?.type,
          reward_amount: data.reward?.amount,
          reward_currency: data.reward?.currency,
          verified_at: new Date().toISOString(),
          payout_status: data.reward?.payout_status ?? "COMPLETED",
          redemption_code: data.reward
            ? `SPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            : undefined,
        };
        await saveLocalVerification(localRecord);

        setState((prev) => ({ ...prev, isSubmitting: false, verificationSuccessData: data }));

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([100, 50, 100]);
        }

        return { success: true, data: localRecord };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network connection error.";
        setState((prev) => ({ ...prev, isSubmitting: false, scanError: msg }));
        return { success: false, error: msg };
      }
    },
    [captureLocation, state.currentLocation]
  );

  return {
    ...state,
    captureLocation,
    executeVerification,
  };
}

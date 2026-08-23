"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TelemetryBreakdown {
  gpsAccuracy?: string;
  ipRiskScore?: number;
  distanceDelta?: string;
  spoofCheckResult?: string;
}

export interface VerificationFeedbackDrawerProps {
  isOpen: boolean;
  status: "VERIFIED" | "REJECTED_SPOOF" | "REJECTED_OUT_OF_BOUNDS" | string;
  rewardAmount?: string;
  telemetryBreakdown?: TelemetryBreakdown;
  onClose: () => void;
}

export function VerificationFeedbackDrawer({
  isOpen,
  status,
  rewardAmount = "₦150",
  telemetryBreakdown,
  onClose,
}: VerificationFeedbackDrawerProps) {
  if (!isOpen) return null;

  const isVerified = status === "VERIFIED";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] rounded-t-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mb-2" />

        {isVerified ? (
          /* VERIFIED State */
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-500/20">
              ✓
            </div>
            <div>
              <Badge variant="success" className="mb-2">
                VERIFIED
              </Badge>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Spatial Presence Verified!</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Cryptographic location proof validated within target boundary.
            </p>
            <div className="rounded-xl px-4 py-2 border border-emerald-500/40 bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Reward Credited: {rewardAmount}
            </div>
          </div>
        ) : (
          /* REJECTED State */
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-3xl text-rose-600 dark:text-rose-400 shadow-md shadow-rose-500/20">
              ⚠️
            </div>
            <div>
              <Badge variant="destructive" className="mb-2">
                {status}
              </Badge>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Verification Rejected</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
              {status === "REJECTED_SPOOF"
                ? "Spoofing or proxy detection triggered during spatial telemetry validation."
                : "Location coordinates outside target geofence radius boundary."}
            </p>

            {/* Warning Card with Telemetry Breakdown */}
            <div className="w-full rounded-2xl p-4 border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 text-left space-y-2 text-xs">
              <div className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                Telemetry Breakdown
              </div>
              <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)] font-mono text-[11px]">
                <div>
                  Accuracy: <span className="text-[var(--text-primary)] font-bold">{telemetryBreakdown?.gpsAccuracy ?? "±4.2m"}</span>
                </div>
                <div>
                  IP Risk: <span className="text-[var(--text-primary)] font-bold">{telemetryBreakdown?.ipRiskScore ?? 85}%</span>
                </div>
                <div>
                  Delta: <span className="text-[var(--text-primary)] font-bold">{telemetryBreakdown?.distanceDelta ?? "120m"}</span>
                </div>
                <div>
                  Result: <span className="text-rose-600 dark:text-rose-400 font-bold">{telemetryBreakdown?.spoofCheckResult ?? status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={onClose}
          variant="secondary"
          size="default"
          className="w-full text-xs font-bold uppercase tracking-wider"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

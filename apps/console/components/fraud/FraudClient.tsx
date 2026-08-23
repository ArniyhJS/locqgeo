"use client";

import { useState } from "react";
import { unblockDeviceAction } from "@/src/actions/fraud";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface FraudAlertItem {
  id: string;
  deviceId: string;
  trustScore: number;
  lastSeenIp: string;
  isVpnOrProxy: boolean;
  spoofScore: number;
  accuracyRisk: number;
  velocityRisk: number;
  networkRisk: number;
  deviceRisk: number;
  actionTaken: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF";
  status: "BLOCKED" | "FLAGGED" | "HEALTHY";
  createdAt: string;
}

const INITIAL_ALERTS: FraudAlertItem[] = [
  {
    id: "alert-001",
    deviceId: "device_hw_fp_882910481029481920",
    trustScore: 25,
    lastSeenIp: "185.220.101.5",
    isVpnOrProxy: true,
    spoofScore: 82,
    accuracyRisk: 90,
    velocityRisk: 85,
    networkRisk: 100,
    deviceRisk: 75,
    actionTaken: "REJECTED_SPOOF",
    status: "BLOCKED",
    createdAt: "2026-07-29T08:45:00Z",
  },
  {
    id: "alert-002",
    deviceId: "device_hw_fp_492019481029381044",
    trustScore: 55,
    lastSeenIp: "102.89.23.14",
    isVpnOrProxy: false,
    spoofScore: 48,
    accuracyRisk: 40,
    velocityRisk: 65,
    networkRisk: 0,
    deviceRisk: 45,
    actionTaken: "VERIFIED_FLAGGED",
    status: "FLAGGED",
    createdAt: "2026-07-29T07:12:00Z",
  },
  {
    id: "alert-003",
    deviceId: "device_hw_fp_102938475610293847",
    trustScore: 98,
    lastSeenIp: "197.210.64.2",
    isVpnOrProxy: false,
    spoofScore: 12,
    accuracyRisk: 5,
    velocityRisk: 10,
    networkRisk: 0,
    deviceRisk: 2,
    actionTaken: "VERIFIED",
    status: "HEALTHY",
    createdAt: "2026-07-29T06:30:00Z",
  },
];

export function FraudClient() {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>(INITIAL_ALERTS);
  const [selectedDevice, setSelectedDevice] = useState<FraudAlertItem | null>(null);
  const [unblockReason, setUnblockReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUnblockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await unblockDeviceAction({
        targetDeviceId: selectedDevice.deviceId,
        reason: unblockReason,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: `Device ${res.targetDeviceId} unblocked successfully and trust score reset to 100!`,
        });

        setAlerts((prev) =>
          prev.map((item) =>
            item.deviceId === res.targetDeviceId
              ? {
                  ...item,
                  status: "HEALTHY",
                  trustScore: 100,
                  actionTaken: "VERIFIED",
                  spoofScore: 0,
                }
              : item,
          ),
        );

        setSelectedDevice(null);
        setUnblockReason("");
      } else {
        const errorMsg =
          typeof res.error === "string"
            ? res.error
            : JSON.stringify(res.error) || "Failed to unblock device. Check input parameters.";
        setFeedback({
          type: "error",
          message: errorMsg,
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred during device unblock.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Fraud Center & Anti-Cheat AI
            </h1>
            <Badge variant="destructive">
              ● 3-Tier Risk Protocol Active
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time composite spoof score calculation, VPN/Proxy intelligence, and 1-click device reputation unblock controls.
          </p>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10">
          <span className="text-[11px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
            Total Spoofs Blocked
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">1,492</span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">REJECTED_SPOOF</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Spoof Limit:</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">≥ 60 (Hard Block)</span>
          </div>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
          <span className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
            Flagged Payout Holds
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">184</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">VERIFIED_FLAGGED</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Hold Duration:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">24 Hours</span>
          </div>
        </Card>

        <Card className="border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10">
          <span className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            VPN / Proxy Detection Rate
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">99.4%</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>IP Intelligence:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cached 24h</span>
          </div>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10">
          <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
            Healthy Verified Devices
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">48,210</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>Avg Trust Score:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">97.8 / 100</span>
          </div>
        </Card>
      </div>

      {/* Fraud Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Device Reputation & Fraud Alerts</CardTitle>
          <CardDescription>
            Composite spoof score factors: Accuracy (35%), Velocity (30%), Network (20%), Device Trust (15%).
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Device ID</th>
                  <th className="pb-3">Trust Score</th>
                  <th className="pb-3">Last IP / Network</th>
                  <th className="pb-3">Spoof Score</th>
                  <th className="pb-3">Action Taken</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {alerts.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    <td className="py-3.5 font-mono text-[var(--text-primary)] font-medium max-w-[200px] truncate" title={item.deviceId}>
                      {item.deviceId}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          item.trustScore >= 80
                            ? "success"
                            : item.trustScore >= 40
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {item.trustScore} / 100
                      </Badge>
                    </td>
                    <td className="py-3.5 font-mono text-[var(--text-secondary)]">
                      {item.lastSeenIp}{" "}
                      {item.isVpnOrProxy && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-300 font-sans ml-1 font-bold">
                          VPN
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-[var(--text-primary)]">
                      {item.spoofScore}
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          item.actionTaken === "VERIFIED"
                            ? "success"
                            : item.actionTaken === "VERIFIED_FLAGGED"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {item.actionTaken}
                      </Badge>
                    </td>
                    <td className="py-3.5 font-semibold">
                      {item.status}
                    </td>
                    <td className="py-3.5 text-right">
                      {item.status !== "HEALTHY" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedDevice(item);
                            setUnblockReason(`Verified identity and hardware fingerprint for ${item.deviceId.substring(0, 16)}`);
                          }}
                        >
                          Unblock Device
                        </Button>
                      ) : (
                        <span className="text-[var(--text-muted)] text-[11px]">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Unblock Device Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="w-full max-w-lg shadow-2xl space-y-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Unblock Device Reputation</CardTitle>
                <CardDescription>Resets device trust score to 100 and removes payout hold.</CardDescription>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                ✕
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUnblockSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Device ID</label>
                  <Input
                    type="text"
                    readOnly
                    value={selectedDevice.deviceId}
                    className="font-mono cursor-not-allowed opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Audit Unblock Reason</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide audit reason for unblocking (e.g. Verified support ticket #1234)"
                    value={unblockReason}
                    onChange={(e) => setUnblockReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] font-sans text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="default"
                    onClick={() => setSelectedDevice(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    loading={loading}
                  >
                    Confirm Unblock Device
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

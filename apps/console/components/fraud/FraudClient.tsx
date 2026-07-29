"use client";

import { useState } from "react";
import { unblockDeviceAction } from "@/src/actions/fraud";

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

  // Unblock Modal State
  const [selectedDevice, setSelectedDevice] = useState<FraudAlertItem | null>(null);
  const [unblockReason, setUnblockReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

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

        // Update local state to mark device as HEALTHY and reset trust score
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
              : item
          )
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
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred during device unblock.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Fraud Telemetry & Anti-Cheat AI
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              ● 3-Tier Risk Action Protocol Active
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Real-time composite spoof score calculation, VPN/Proxy intelligence, and 1-click device reputation unblock controls.
          </p>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Total Spoofs Blocked
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">1,492</span>
            <span className="text-xs font-semibold text-rose-400/80">REJECTED_SPOOF</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Spoof Score Limit:</span>
            <span className="font-mono text-rose-400 font-semibold">≥ 60 (Hard Block)</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Flagged Payout Holds
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">184</span>
            <span className="text-xs font-semibold text-amber-400/80">VERIFIED_FLAGGED</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Hold Duration:</span>
            <span className="font-mono text-amber-400 font-semibold">24 Hours</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            VPN / Proxy Detection Rate
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">99.4%</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>IP Intelligence:</span>
            <span className="text-emerald-400 font-semibold">Cached 24h</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-[#10121a] to-[#151926] border border-gray-800 shadow-xl relative overflow-hidden">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Healthy Verified Devices
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">48,210</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Avg Trust Score:</span>
            <span className="text-emerald-400 font-semibold">97.8 / 100</span>
          </div>
        </div>
      </div>

      {/* Fraud Alerts Table */}
      <div className="p-6 rounded-xl bg-[#10121a] border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Device Reputation & Fraud Alerts</h2>
            <p className="text-xs text-gray-400">
              Composite spoof score factors: Accuracy (35%), Velocity (30%), Network (20%), Device Trust (15%).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-gray-800/60">
              {alerts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="py-3.5 font-mono text-white font-medium max-w-[200px] truncate" title={item.deviceId}>
                    {item.deviceId}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        item.trustScore >= 80
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.trustScore >= 40
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {item.trustScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-gray-400">
                    {item.lastSeenIp}{" "}
                    {item.isVpnOrProxy && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-300 font-sans ml-1">
                        VPN
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-mono font-bold text-white">
                    {item.spoofScore}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.actionTaken === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.actionTaken === "VERIFIED_FLAGGED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {item.actionTaken}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === "HEALTHY"
                          ? "text-emerald-400"
                          : item.status === "FLAGGED"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {item.status !== "HEALTHY" ? (
                      <button
                        onClick={() => {
                          setSelectedDevice(item);
                          setUnblockReason(`Verified identity and hardware fingerprint for ${item.deviceId.substring(0, 16)}`);
                        }}
                        className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all"
                      >
                        Unblock Device
                      </button>
                    ) : (
                      <span className="text-gray-500 text-[11px]">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unblock Device Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#10121a] border border-gray-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Unblock Device Reputation</h3>
                <p className="text-xs text-gray-400">Resets device trust score to 100 and removes payout hold.</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUnblockSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Target Device ID</label>
                <input
                  type="text"
                  readOnly
                  value={selectedDevice.deviceId}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Audit Unblock Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide audit reason for unblocking (e.g. Verified support ticket #1234)"
                  value={unblockReason}
                  onChange={(e) => setUnblockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white font-sans text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedDevice(null)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Unblocking..." : "Confirm Unblock Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

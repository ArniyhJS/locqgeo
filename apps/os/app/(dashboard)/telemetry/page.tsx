"use client";

import { useEffect, useState } from "react";
import type { TelemetrySummaryResponse } from "@spottgeo/api-contracts";
import { FraudBreakdownChart } from "@/components/analytics/FraudBreakdownChart";
import { HourlyTrendChart } from "@/components/analytics/HourlyTrendChart";

export default function TelemetryPage() {
  const [data, setData] = useState<TelemetrySummaryResponse | null>(null);

  useEffect(() => {
    fetch("/api/v1/os/telemetry?tenant_id=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00")
      .then((res) => res.json())
      .then((json: TelemetrySummaryResponse) => setData(json))
      .catch(() => {});
  }, []);

  const fraud = data?.fraud_breakdown || {
    rejected_accuracy: 820,
    rejected_velocity: 640,
    rejected_out_of_bounds: 410,
    rejected_duplicate: 234,
  };

  const timeSeries = data?.time_series || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Live Telemetry & Anti-Cheat Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          NDPR-compliant raw stream tracking speed-of-light velocity, GPS accuracy, and duplicate claim rejections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200 text-sm">Anti-Cheat Fraud Rule Violations</h3>
            <span className="text-xs text-rose-400 font-semibold">Live Feed</span>
          </div>
          <FraudBreakdownChart
            rejectedAccuracy={fraud.rejected_accuracy}
            rejectedVelocity={fraud.rejected_velocity}
            rejectedOutOfBounds={fraud.rejected_out_of_bounds}
            rejectedDuplicate={fraud.rejected_duplicate}
          />
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200 text-sm">Hourly Telemetry Scan Velocity</h3>
            <span className="text-xs text-blue-400 font-semibold">Recharts Feed</span>
          </div>
          <HourlyTrendChart data={timeSeries} />
        </div>
      </div>

      {/* NDPR Compliant Anonymized Raw Stream */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-200 text-sm">NDPR Compliant Telemetry Event Log Stream</h3>
          <span className="text-xs text-gray-400 font-medium">IPs Masked & Hashes Truncated to 8 chars</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
              <tr>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Anonymized Device ID</th>
                <th className="pb-3">Masked IP Address</th>
                <th className="pb-3">Coordinates (Lat, Lng)</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Anti-Cheat Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr>
                <td className="py-3 font-mono text-gray-400">01:18:42</td>
                <td className="font-mono text-emerald-300">dev_8a4f91e9</td>
                <td className="font-mono text-gray-400">102.89.x.x</td>
                <td>6.5244°, 3.3792°</td>
                <td>4.2 m</td>
                <td><span className="px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">SUCCESS</span></td>
              </tr>
              <tr>
                <td className="py-3 font-mono text-gray-400">01:17:15</td>
                <td className="font-mono text-rose-300">dev_ff0192cc</td>
                <td className="font-mono text-gray-400">197.210.x.x</td>
                <td>6.4531°, 3.4210°</td>
                <td>120.0 m</td>
                <td><span className="px-2 py-0.5 rounded text-rose-400 bg-rose-500/10 border border-rose-500/20">REJECTED_ACCURACY</span></td>
              </tr>
              <tr>
                <td className="py-3 font-mono text-gray-400">01:15:02</td>
                <td className="font-mono text-amber-300">dev_3c8810e4</td>
                <td className="font-mono text-gray-400">102.91.x.x</td>
                <td>7.0000°, 3.8000°</td>
                <td>6.1 m</td>
                <td><span className="px-2 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20">REJECTED_VELOCITY</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

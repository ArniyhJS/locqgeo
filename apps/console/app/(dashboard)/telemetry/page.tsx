"use client";

import { useEffect, useState } from "react";
import type { TelemetrySummaryResponse } from "@spottgeo/api-contracts";
import { FraudBreakdownChart } from "@/components/analytics/FraudBreakdownChart";
import { HourlyTrendChart } from "@/components/analytics/HourlyTrendChart";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default function TelemetryPage() {
  const [data, setData] = useState<TelemetrySummaryResponse | null>(null);

  useEffect(() => {
    fetch(`/api/v1/console/telemetry?tenant_id=${DEMO_TENANT_ID}`)
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
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Live Telemetry & Anti-Cheat Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          NDPR-compliant raw stream tracking velocity, GPS accuracy, and duplicate verification
          rejections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200 text-sm">
              Anti-Cheat Fraud Rule Violations
            </h3>
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
            <h3 className="font-semibold text-gray-200 text-sm">Hourly Verification Velocity</h3>
            <span className="text-xs text-blue-400 font-semibold">Recharts Feed</span>
          </div>
          <HourlyTrendChart data={timeSeries} />
        </div>
      </div>
    </div>
  );
}

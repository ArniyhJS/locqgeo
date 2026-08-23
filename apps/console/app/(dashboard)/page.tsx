"use client";

import { useEffect, useState } from "react";
import type { TelemetrySummaryResponse } from "@locqgeo/api-contracts";
import { KpiSummaryCards } from "@/components/analytics/KpiSummaryCards";
import { FraudBreakdownChart } from "@/components/analytics/FraudBreakdownChart";
import { HourlyTrendChart } from "@/components/analytics/HourlyTrendChart";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default function DashboardOverviewPage() {
  const [data, setData] = useState<TelemetrySummaryResponse | null>(null);

  useEffect(() => {
    fetch(`/api/v1/console/telemetry?tenant_id=${DEMO_TENANT_ID}`)
      .then((res) => res.json())
      .then((json: TelemetrySummaryResponse) => setData(json))
      .catch(() => {});
  }, []);

  const summary = data?.summary || {
    total_pings: 128490,
    verified_events: 126386,
    fraud_blocked: 2104,
    conversion_rate_pct: 98.36,
    total_spend: 14850000,
  };

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
        <h1 className="text-2xl font-bold tracking-tight text-white">Executive Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time overview of active geofences, presence verifications, and anti-cheat fraud
          breakdowns.
        </p>
      </div>

      <KpiSummaryCards
        totalPings={summary.total_pings}
        verifiedEvents={summary.verified_events}
        fraudBlocked={summary.fraud_blocked}
        totalSpend={summary.total_spend}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200">Verification Velocity (Hourly Trend)</h3>
            <span className="text-xs text-blue-400 font-medium">Recharts Live Feed</span>
          </div>
          <HourlyTrendChart data={timeSeries} />
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200">Blocked Fraud Breakdown</h3>
            <span className="text-xs text-rose-400 font-medium">Anti-Cheat Rules</span>
          </div>
          <FraudBreakdownChart
            rejectedAccuracy={fraud.rejected_accuracy}
            rejectedVelocity={fraud.rejected_velocity}
            rejectedOutOfBounds={fraud.rejected_out_of_bounds}
            rejectedDuplicate={fraud.rejected_duplicate}
          />
        </div>
      </div>
    </div>
  );
}

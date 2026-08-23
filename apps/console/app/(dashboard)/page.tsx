"use client";

import { useEffect, useState } from "react";
import type { TelemetrySummaryResponse } from "@locqgeo/api-contracts";
import { KpiSummaryCards } from "@/components/analytics/KpiSummaryCards";
import { FraudBreakdownChart } from "@/components/analytics/FraudBreakdownChart";
import { HourlyTrendChart } from "@/components/analytics/HourlyTrendChart";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Executive Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Real-time overview of active geofences, presence verifications, and anti-cheat fraud breakdowns.
        </p>
      </div>

      <KpiSummaryCards
        totalPings={summary.total_pings}
        verifiedEvents={summary.verified_events}
        fraudBlocked={summary.fraud_blocked}
        totalSpend={summary.total_spend}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Verification Velocity (Hourly Trend)</CardTitle>
              <CardDescription>24-hour verification and scan event velocity</CardDescription>
            </div>
            <Badge variant="default">Recharts Live Feed</Badge>
          </CardHeader>
          <CardContent>
            <HourlyTrendChart data={timeSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Blocked Fraud Breakdown</CardTitle>
              <CardDescription>Risk scoring rules classification</CardDescription>
            </div>
            <Badge variant="destructive">Anti-Cheat Rules</Badge>
          </CardHeader>
          <CardContent>
            <FraudBreakdownChart
              rejectedAccuracy={fraud.rejected_accuracy}
              rejectedVelocity={fraud.rejected_velocity}
              rejectedOutOfBounds={fraud.rejected_out_of_bounds}
              rejectedDuplicate={fraud.rejected_duplicate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

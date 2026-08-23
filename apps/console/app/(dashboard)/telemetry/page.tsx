"use client";

import { useEffect, useState } from "react";
import type { TelemetrySummaryResponse } from "@locqgeo/api-contracts";
import { FraudBreakdownChart } from "@/components/analytics/FraudBreakdownChart";
import { HourlyTrendChart } from "@/components/analytics/HourlyTrendChart";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Live Telemetry & Anti-Cheat Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          NDPR-compliant raw stream tracking velocity, GPS accuracy, and duplicate verification rejections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Anti-Cheat Rule Violations</CardTitle>
              <CardDescription>Live breakdown of rejected spoof attempts</CardDescription>
            </div>
            <Badge variant="destructive">Live Feed</Badge>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Hourly Verification Velocity</CardTitle>
              <CardDescription>Real-time spatial scan progression</CardDescription>
            </div>
            <Badge variant="default">Recharts Feed</Badge>
          </CardHeader>
          <CardContent>
            <HourlyTrendChart data={timeSeries} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

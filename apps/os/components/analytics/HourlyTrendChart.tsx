"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TimeSeriesItem {
  timestamp_hour: string;
  pings: number;
  verified_claims: number;
  blocked_fraud: number;
}

interface HourlyTrendChartProps {
  data: TimeSeriesItem[];
}

export function HourlyTrendChart({ data }: HourlyTrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="timestamp_hour" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "8px", fontSize: "12px" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line type="monotone" dataKey="pings" stroke="#3b82f6" strokeWidth={2} name="Total Scans" dot={false} />
          <Line type="monotone" dataKey="verified_claims" stroke="#10b981" strokeWidth={2} name="Verified Claims" dot={false} />
          <Line type="monotone" dataKey="blocked_fraud" stroke="#f43f5e" strokeWidth={2} name="Blocked Fraud" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

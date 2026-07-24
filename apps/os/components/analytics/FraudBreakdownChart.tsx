"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FraudBreakdownProps {
  rejectedAccuracy: number;
  rejectedVelocity: number;
  rejectedOutOfBounds: number;
  rejectedDuplicate: number;
}

export function FraudBreakdownChart({
  rejectedAccuracy,
  rejectedVelocity,
  rejectedOutOfBounds,
  rejectedDuplicate,
}: FraudBreakdownProps) {
  const data = [
    { name: "Low GPS Accuracy", value: rejectedAccuracy, color: "#f43f5e" },
    { name: "Excess Velocity", value: rejectedVelocity, color: "#fb7185" },
    { name: "Out of Bounds", value: rejectedOutOfBounds, color: "#fda4af" },
    { name: "24h Duplicate", value: rejectedDuplicate, color: "#e11d48" },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "8px", fontSize: "12px" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

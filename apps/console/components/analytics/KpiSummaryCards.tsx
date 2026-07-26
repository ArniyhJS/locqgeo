"use client";

interface KpiSummaryProps {
  totalPings: number;
  verifiedEvents: number;
  fraudBlocked: number;
  totalSpend: number;
}

export function KpiSummaryCards({
  totalPings,
  verifiedEvents,
  fraudBlocked,
  totalSpend,
}: KpiSummaryProps) {
  const conversionRate =
    totalPings > 0 ? ((verifiedEvents / totalPings) * 100).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="glass-card p-6 space-y-2 border border-[#ff6b00]/30 bg-gradient-to-tr from-[#ff6b00]/10 to-transparent">
        <span className="text-xs uppercase tracking-wider font-extrabold text-[#ff6b00]">Total Telemetry Pings</span>
        <div className="text-3xl font-black text-white">{totalPings.toLocaleString()}</div>
        <span className="text-xs text-[#ff6b00] font-medium">PostGIS Spatial Scans</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Verified Presence Events</span>
        <div className="text-3xl font-extrabold text-emerald-400">{verifiedEvents.toLocaleString()}</div>
        <span className="text-xs text-emerald-400 font-medium">Conversion Rate: {conversionRate}%</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Spoofing Fraud Blocked</span>
        <div className="text-3xl font-extrabold text-rose-400">{fraudBlocked.toLocaleString()}</div>
        <span className="text-xs text-rose-400 font-medium">4-Step Anti-Cheat Filter</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Reward Budget Spent</span>
        <div className="text-3xl font-extrabold text-[#ff6b00]">NGN {totalSpend.toLocaleString()}</div>
        <span className="text-xs text-gray-400 font-medium">Airtime & Data Payouts</span>
      </div>
    </div>
  );
}

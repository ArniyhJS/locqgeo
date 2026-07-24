"use client";

interface KpiSummaryProps {
  totalPings: number;
  verifiedClaims: number;
  fraudBlocked: number;
  totalSpendNgn: number;
}

export function KpiSummaryCards({
  totalPings,
  verifiedClaims,
  fraudBlocked,
  totalSpendNgn,
}: KpiSummaryProps) {
  // Conversion Rate Invariant: (verified_claims / total_pings) * 100, 0.00% if total_pings === 0
  const conversionRate =
    totalPings > 0 ? ((verifiedClaims / totalPings) * 100).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Total Telemetry Pings</span>
        <div className="text-3xl font-extrabold text-white">{totalPings.toLocaleString()}</div>
        <span className="text-xs text-blue-400 font-medium">PostGIS Spatial Scans</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Verified Claims</span>
        <div className="text-3xl font-extrabold text-emerald-400">{verifiedClaims.toLocaleString()}</div>
        <span className="text-xs text-emerald-400 font-medium">Conversion Rate: {conversionRate}%</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Fraud Blocked</span>
        <div className="text-3xl font-extrabold text-rose-400">{fraudBlocked.toLocaleString()}</div>
        <span className="text-xs text-rose-400 font-medium">4-Step Anti-Cheat Filter</span>
      </div>

      <div className="glass-card p-6 space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Total Reward Budget Spent</span>
        <div className="text-3xl font-extrabold text-cyan-400">₦ {totalSpendNgn.toLocaleString()}</div>
        <span className="text-xs text-gray-400 font-medium">Airtime, Data & Paystack</span>
      </div>
    </div>
  );
}

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
  const conversionRate = totalPings > 0 ? ((verifiedEvents / totalPings) * 100).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 p-6 space-y-2 shadow-xs">
        <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
          Total Telemetry Pings
        </span>
        <div className="text-3xl font-black text-[var(--text-primary)]">{totalPings.toLocaleString()}</div>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">PostGIS Spatial Scans</span>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 space-y-2 shadow-xs">
        <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
          Verified Presence Events
        </span>
        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
          {verifiedEvents.toLocaleString()}
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Conversion Rate: {conversionRate}%
        </span>
      </div>

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 p-6 space-y-2 shadow-xs">
        <span className="text-[11px] uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400">
          Spoofing Fraud Blocked
        </span>
        <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{fraudBlocked.toLocaleString()}</div>
        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">4-Step Anti-Cheat Filter</span>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-2 shadow-xs">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-secondary)]">
          Reward Budget Spent
        </span>
        <div className="text-3xl font-black text-[var(--text-primary)]">
          NGN {totalSpend.toLocaleString()}
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">Airtime & Data Payouts</span>
      </div>
    </div>
  );
}

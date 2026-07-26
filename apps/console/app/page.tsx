export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Executive Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time overview of active geo-campaigns, claims, and anti-cheat telemetry.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-6 space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            Active Campaigns
          </span>
          <div className="text-3xl font-extrabold text-white">14</div>
          <span className="text-xs text-emerald-400 font-medium">↑ +3 this week</span>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            Total Valid Claims
          </span>
          <div className="text-3xl font-extrabold text-white">128,490</div>
          <span className="text-xs text-emerald-400 font-medium">↑ 98.4% success rate</span>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            Fraud Blocked
          </span>
          <div className="text-3xl font-extrabold text-rose-400">2,104</div>
          <span className="text-xs text-rose-400 font-medium">Blocked by Anti-Cheat Filter</span>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            Disbursed Payouts
          </span>
          <div className="text-3xl font-extrabold text-blue-400">₦ 14.8M</div>
          <span className="text-xs text-gray-400 font-medium">Telco Airtime & Paystack</span>
        </div>
      </div>

      {/* Campaign Activity & Map View Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-200">Active Geofenced Drops</h3>
            <span className="text-xs text-blue-400 font-medium">PostGIS ST_DWithin Active</span>
          </div>

          <div className="h-64 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="text-center space-y-2 z-10">
              <div className="inline-flex h-12 w-12 rounded-full bg-blue-500/20 text-blue-400 items-center justify-center font-bold text-lg border border-blue-500/40 animate-pulse">
                📍
              </div>
              <p className="text-sm font-semibold text-gray-200">Lagos Island Geofence Node #04</p>
              <p className="text-xs text-gray-400">6.5244° N, 3.3792° E — Radius: 500m</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-200">System Telemetry Stream</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-400">ACCEPTED_PING</p>
                <p className="text-gray-400">Device ID: dev_8a4f91e</p>
              </div>
              <span className="text-gray-500">12s ago</span>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
              <div>
                <p className="font-medium text-rose-400">REJECTED_ANTICHEAT</p>
                <p className="text-gray-400">Velocity &gt; 30m/s anomaly</p>
              </div>
              <span className="text-gray-500">45s ago</span>
            </div>

            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
              <div>
                <p className="font-medium text-emerald-400">PAYOUT_DISPATCHED</p>
                <p className="text-gray-400">₦ 1,000 Airtime VTPass</p>
              </div>
              <span className="text-gray-500">2m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NodesListPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Campaign Nodes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage PostGIS physical geofence targets and reward allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/nodes/bulk"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
          >
            📥 CSV Bulk Import
          </a>
          <a
            href="/nodes/new"
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg"
          >
            + Create Campaign Node
          </a>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
              <tr>
                <th className="pb-3">Node Title</th>
                <th className="pb-3">Coordinates (Lat, Lng)</th>
                <th className="pb-3">Geofence Radius</th>
                <th className="pb-3">Reward Type</th>
                <th className="pb-3">Daily Budget Spent / Cap</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr>
                <td className="py-3.5 font-medium text-white">Lagos Island Tech Drop #04</td>
                <td>6.5244°, 3.3792°</td>
                <td>50.0 meters</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    AIRTIME
                  </span>
                </td>
                <td>₦ 12,500.00 / ₦ 50,000.00</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-medium text-white">Victoria Island Mall Drop #02</td>
                <td>6.4281°, 3.4219°</td>
                <td>100.0 meters</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                    DATA
                  </span>
                </td>
                <td>₦ 50,000.00 / ₦ 50,000.00</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                    DEPLETED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-medium text-white">Ikeja City Mall Drop #01</td>
                <td>6.6018°, 3.3515°</td>
                <td>75.0 meters</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    CASH
                  </span>
                </td>
                <td>₦ 8,000.00 / ₦ 25,000.00</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

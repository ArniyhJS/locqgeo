import { getGeofencesAction } from "@/app/actions/geofences";
import { DEMO_TENANT_ID } from "@/lib/constants";

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const cur = currency ?? "NGN";
  return `${cur === "NGN" ? "₦" : cur} ${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(isActive: boolean, spent: number, limit: number | null) {
  if (!isActive) {
    return (
      <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 font-semibold border border-gray-500/20">
        INACTIVE
      </span>
    );
  }
  if (limit != null && spent >= limit) {
    return (
      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
        DEPLETED
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
      ACTIVE
    </span>
  );
}

const rewardColors: Record<string, string> = {
  AIRTIME: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DATA: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CASH: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  VOUCHER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default async function NodesListPage() {
  const result = await getGeofencesAction(DEMO_TENANT_ID);
  const nodes = result.success && result.data ? result.data : [];

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
        {nodes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">📍</div>
            <p className="text-gray-400 text-sm">No campaign nodes yet.</p>
            <a
              href="/nodes/new"
              className="inline-block glass-button px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg"
            >
              + Create Your First Node
            </a>
          </div>
        ) : (
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
                {nodes.map((node) => {
                  const colorClass = rewardColors[node.reward_type ?? ""] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";
                  return (
                    <tr key={node.id}>
                      <td className="py-3.5 font-medium text-white">{node.title}</td>
                      <td>{node.latitude.toFixed(4)}°, {node.longitude.toFixed(4)}°</td>
                      <td>{node.radius_meters} meters</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded font-semibold border ${colorClass}`}>
                          {node.reward_type ?? node.action_type}
                        </span>
                      </td>
                      <td>
                        {formatCurrency(node.daily_budget_spent, node.reward_currency)} / {formatCurrency(node.daily_budget_limit, node.reward_currency)}
                      </td>
                      <td>
                        {getStatusBadge(node.is_active, node.daily_budget_spent, node.daily_budget_limit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCampaignsAction } from "@/app/actions/campaigns";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default async function CampaignsListPage() {
  const result = await getCampaignsAction(DEMO_TENANT_ID);
  const campaigns = (result.success ? result.data : []) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build billboard gamification, treasure hunts, and attendance challenges.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg"
        >
          + Create Campaign
        </Link>
      </div>

      <div className="glass-card p-6 space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No campaigns yet.{" "}
            <Link href="/campaigns/new" className="text-blue-400 hover:underline">
              Create your first campaign
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Reward</th>
                  <th className="pb-3">Budget Spent / Limit</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {campaigns.map((c) => {
                  const start = new Date(c.starts_at);
                  const end = new Date(c.ends_at);
                  const now = new Date();
                  const isRunning = c.is_active && start <= now && end >= now;
                  const statusClass = isRunning
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : c.is_active
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-gray-500/10 text-gray-400 border-gray-500/20";
                  const statusLabel = isRunning
                    ? "RUNNING"
                    : c.is_active
                      ? "SCHEDULED"
                      : "INACTIVE";

                  return (
                    <tr key={c.id}>
                      <td className="py-3.5">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="font-medium text-white hover:text-blue-400 transition-colors"
                        >
                          {c.title}
                        </Link>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {c.geofences.length} linked nodes
                        </p>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 uppercase">
                          {c.action_type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {start.toLocaleDateString()} – {end.toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        {c.reward_type ? (
                          <span className="text-gray-300">
                            {c.reward_currency} {c.reward_amount} {c.reward_type}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {c.total_budget_limit ? (
                          <span className="text-gray-300">
                            ₦ {c.total_budget_spent.toLocaleString()} / ₦{" "}
                            {c.total_budget_limit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded font-semibold border ${statusClass}`}>
                          {statusLabel}
                        </span>
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

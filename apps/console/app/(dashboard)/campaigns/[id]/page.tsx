import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignByIdAction, getCampaignLeaderboardAction } from "@/app/actions/campaigns";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;

  const [campaignResult, leaderboardResult] = await Promise.all([
    getCampaignByIdAction(id),
    getCampaignLeaderboardAction(id, 20),
  ]);

  if (!campaignResult.success || !campaignResult.data) {
    notFound();
  }

  const c = campaignResult.data;
  const leaderboard = (leaderboardResult.success ? leaderboardResult.data : []) ?? [];
  const start = new Date(c.starts_at);
  const end = new Date(c.ends_at);
  const now = new Date();
  const isRunning = c.is_active && start <= now && end >= now;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{c.title}</h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                isRunning
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : c.is_active
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
              }`}
            >
              {isRunning ? "RUNNING" : c.is_active ? "SCHEDULED" : "INACTIVE"}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {c.description || "No description provided."}
          </p>
        </div>
        <Link
          href="/campaigns"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
        >
          ← Back to Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Action Type</span>
          <div className="text-lg font-bold text-white uppercase">{c.action_type}</div>
        </div>
        <div className="glass-card p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Campaign Period</span>
          <div className="text-sm text-gray-200">
            {start.toLocaleString()} – {end.toLocaleString()}
          </div>
        </div>
        <div className="glass-card p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-gray-500">Reward</span>
          <div className="text-sm text-gray-200">
            {c.reward_type
              ? `${c.reward_currency} ${c.reward_amount} ${c.reward_type}`
              : "No reward configured"}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Linked Billboards / Geofences</h2>
        {c.geofences.length === 0 ? (
          <p className="text-sm text-gray-500">No geofences linked to this campaign.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3">Geofence ID</th>
                  <th className="pb-3">Visit Points</th>
                  <th className="pb-3">Required Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {c.geofences.map((g) => (
                  <tr key={g.geofence_id}>
                    <td className="py-3 font-mono text-gray-300">{g.geofence_id}</td>
                    <td className="py-3">{g.visit_weight}</td>
                    <td className="py-3">{g.required_visit_order ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500">No verified visits yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Device ID</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Visits</th>
                  <th className="pb-3">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {leaderboard.map((entry) => (
                  <tr key={entry.device_id}>
                    <td className="py-3 font-bold text-white">#{entry.rank}</td>
                    <td className="py-3 font-mono text-gray-400">
                      {entry.device_id.slice(0, 16)}…
                    </td>
                    <td className="py-3">{entry.total_points}</td>
                    <td className="py-3">{entry.total_visits}</td>
                    <td className="py-3">{entry.streak_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

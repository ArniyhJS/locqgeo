import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignByIdAction, getCampaignLeaderboardAction } from "@/app/actions/campaigns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{c.title}</h1>
            <Badge
              variant={
                isRunning
                  ? "success"
                  : c.is_active
                  ? "warning"
                  : "secondary"
              }
            >
              {isRunning ? "RUNNING" : c.is_active ? "SCHEDULED" : "INACTIVE"}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {c.description || "No description provided."}
          </p>
        </div>
        <Link href="/campaigns">
          <Button variant="outline" size="default">
            ← Back to Campaigns
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Action Type</span>
          <div className="text-lg font-bold text-[var(--text-primary)] uppercase">{c.action_type}</div>
        </Card>
        <Card className="p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Campaign Period</span>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {start.toLocaleString()} – {end.toLocaleString()}
          </div>
        </Card>
        <Card className="p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Reward</span>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {c.reward_type
              ? `${c.reward_currency} ${c.reward_amount} ${c.reward_type}`
              : "No reward configured"}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked Billboards / Geofences</CardTitle>
        </CardHeader>
        <CardContent>
          {c.geofences.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No geofences linked to this campaign.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="pb-3">Geofence ID</th>
                    <th className="pb-3">Visit Points</th>
                    <th className="pb-3">Required Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {c.geofences.map((g) => (
                    <tr key={g.geofence_id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                      <td className="py-3 font-mono text-[var(--text-primary)]">{g.geofence_id}</td>
                      <td className="py-3 font-semibold">{g.visit_weight}</td>
                      <td className="py-3">{g.required_visit_order ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No verified visits yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Device ID</th>
                    <th className="pb-3">Points</th>
                    <th className="pb-3">Visits</th>
                    <th className="pb-3">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {leaderboard.map((entry) => (
                    <tr key={entry.device_id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                      <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">#{entry.rank}</td>
                      <td className="py-3 font-mono text-[var(--text-secondary)]">
                        {entry.device_id.slice(0, 16)}…
                      </td>
                      <td className="py-3 font-bold text-[var(--text-primary)]">{entry.total_points}</td>
                      <td className="py-3">{entry.total_visits}</td>
                      <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">{entry.streak_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

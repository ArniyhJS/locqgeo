export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCampaignsAction } from "@/app/actions/campaigns";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CampaignsListPage() {
  const result = await getCampaignsAction(DEMO_TENANT_ID);
  const campaigns = (result.success ? result.data : []) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Campaigns</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Build billboard gamification, treasure hunts, and attendance challenges.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button variant="default" size="default">
            + Create Campaign
          </Button>
        </Link>
      </div>

      <Card>
        {campaigns.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">🏆</span>}
            title="No campaigns yet"
            description="Create presence challenges with geofences, leaderboard ranking, and instant rewards."
            action={{ label: "+ Create First Campaign", href: "/campaigns/new" }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Reward</th>
                  <th className="pb-3">Budget Spent / Limit</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {campaigns.map((c) => {
                  const start = new Date(c.starts_at);
                  const end = new Date(c.ends_at);
                  const now = new Date();
                  const isRunning = c.is_active && start <= now && end >= now;

                  return (
                    <tr key={c.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                      <td className="py-3.5">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="font-bold text-[var(--text-primary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {c.title}
                        </Link>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {c.geofences.length} linked nodes
                        </p>
                      </td>
                      <td className="py-3.5">
                        <Badge variant="default">
                          {c.action_type}
                        </Badge>
                      </td>
                      <td className="py-3.5">
                        {start.toLocaleDateString()} – {end.toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-medium">
                        {c.reward_type ? (
                          <span className="text-[var(--text-primary)]">
                            {c.reward_currency} {c.reward_amount} {c.reward_type}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 font-mono">
                        {c.total_budget_limit ? (
                          <span className="text-[var(--text-primary)]">
                            ₦ {c.total_budget_spent.toLocaleString()} / ₦{" "}
                            {c.total_budget_limit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

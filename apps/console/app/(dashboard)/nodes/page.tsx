import { getGeofencesAction } from "@/app/actions/geofences";
import { DEMO_TENANT_ID } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const cur = currency ?? "NGN";
  return `${cur === "NGN" ? "₦" : cur} ${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(isActive: boolean, spent: number, limit: number | null) {
  if (!isActive) {
    return <Badge variant="secondary">INACTIVE</Badge>;
  }
  if (limit != null && spent >= limit) {
    return <Badge variant="warning">DEPLETED</Badge>;
  }
  return <Badge variant="success">ACTIVE</Badge>;
}

export default async function NodesListPage() {
  const result = await getGeofencesAction(DEMO_TENANT_ID);
  const nodes = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Campaign Geofences</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage PostGIS physical geofence targets and reward allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/nodes/bulk">
            <Button variant="outline" size="default">
              📥 CSV Bulk Import
            </Button>
          </Link>
          <Link href="/nodes/new">
            <Button variant="default" size="default">
              + Create Geofence
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {nodes.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">📍</span>}
            title="No campaign geofences registered"
            description="Create your first PostGIS presence target or import a batch with CSV."
            action={{ label: "+ Create First Geofence", href: "/nodes/new" }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Node Title</th>
                  <th className="pb-3">Coordinates (Lat, Lng)</th>
                  <th className="pb-3">Geofence Radius</th>
                  <th className="pb-3">Reward Type</th>
                  <th className="pb-3">Daily Budget Spent / Cap</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    <td className="py-3.5 font-semibold text-[var(--text-primary)]">{node.title}</td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {node.latitude.toFixed(4)}°, {node.longitude.toFixed(4)}°
                    </td>
                    <td>{node.radius_meters} meters</td>
                    <td>
                      <Badge variant="default">
                        {node.reward_type ?? node.action_type}
                      </Badge>
                    </td>
                    <td className="font-mono font-medium text-[var(--text-primary)]">
                      {formatCurrency(node.daily_budget_spent, node.reward_currency)} / {formatCurrency(node.daily_budget_limit, node.reward_currency)}
                    </td>
                    <td>
                      {getStatusBadge(node.is_active, node.daily_budget_spent, node.daily_budget_limit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

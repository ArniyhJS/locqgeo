import { getUsersAction } from "@/app/actions/users";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const result = await getUsersAction();
  const users = (result.success ? result.data : []) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Users</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Progressively linked identities and wallet balances.
        </p>
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState
            icon={<span className="text-3xl">👤</span>}
            title="No users have linked an account yet"
            description="Scans remain anonymous until a device is linked via phone or email."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Devices</th>
                  <th className="pb-3">Wallet</th>
                  <th className="pb-3">Verified</th>
                  <th className="pb-3">Linked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                    <td className="py-3.5 font-semibold text-[var(--text-primary)]">
                      {u.full_name || "Anonymous"}
                      <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{u.id}</p>
                    </td>
                    <td className="py-3.5 text-[var(--text-secondary)]">
                      {u.phone_number && <div>{u.phone_number}</div>}
                      {u.email && <div className="text-[var(--text-muted)]">{u.email}</div>}
                    </td>
                    <td className="py-3.5">{u.device_count}</td>
                    <td className="py-3.5 font-medium text-[var(--text-primary)]">
                      {u.currency} {u.balance.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <Badge variant={u.is_verified ? "success" : "warning"}>
                        {u.is_verified ? "VERIFIED" : "PENDING"}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-[var(--text-muted)]">
                      {new Date(u.created_at).toLocaleDateString()}
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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Team Management & RBAC</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage tenant users and Role-Based Access Control (`ADMIN`, `MARKETER`, `VIEWER`).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Tenant Team Members</CardTitle>
          <Button variant="default" size="sm">
            + Invite Member
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase">
                <tr>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                <tr className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                  <td className="py-3 font-semibold text-[var(--text-primary)]">Aniebiet Ebebe</td>
                  <td className="text-[var(--text-secondary)]">aniebiet@locqgeo.com</td>
                  <td>
                    <Badge variant="default">
                      ADMIN
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="success">
                      ACTIVE
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-[var(--bg-surface-elevated)] transition-colors">
                  <td className="py-3 font-semibold text-[var(--text-primary)]">Marketing Lead</td>
                  <td className="text-[var(--text-secondary)]">marketing@acme.com</td>
                  <td>
                    <Badge variant="secondary">
                      MARKETER
                    </Badge>
                  </td>
                  <td>
                    <Badge variant="success">
                      ACTIVE
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

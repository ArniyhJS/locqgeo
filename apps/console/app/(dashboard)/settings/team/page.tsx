export default function TeamPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Team Management & RBAC</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage tenant users and Role-Based Access Control (`ADMIN`, `MARKETER`, `VIEWER`).
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">Tenant Team Members</h3>
          <button className="glass-button px-4 py-2 rounded-lg text-xs font-semibold text-white">
            + Invite Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
              <tr>
                <th className="pb-3">Full Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr>
                <td className="py-3 font-medium text-white">Aniebiet Ebebe</td>
                <td className="text-gray-400">aniebiet@spottgeo.com</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    ADMIN
                  </span>
                </td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-white">Marketing Lead</td>
                <td className="text-gray-400">marketing@acme.com</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                    MARKETER
                  </span>
                </td>
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

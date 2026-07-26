import { getUsersAction } from "@/app/actions/users";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const result = await getUsersAction();
  const users = (result.success ? result.data : []) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
        <p className="text-sm text-gray-400 mt-1">
          Progressively linked identities and wallet balances.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No users have linked an account yet.{" "}
            <span className="text-gray-500">
              Scans are still anonymous until a device is linked via phone/email.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Devices</th>
                  <th className="pb-3">Wallet</th>
                  <th className="pb-3">Verified</th>
                  <th className="pb-3">Linked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3.5 font-medium text-white">
                      {u.full_name || "Anonymous"}
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.id}</p>
                    </td>
                    <td className="py-3.5 text-gray-300">
                      {u.phone_number && <div>{u.phone_number}</div>}
                      {u.email && <div className="text-gray-500">{u.email}</div>}
                    </td>
                    <td className="py-3.5">{u.device_count}</td>
                    <td className="py-3.5 text-gray-300">
                      {u.currency} {u.balance.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          u.is_verified
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {u.is_verified ? "VERIFIED" : "PENDING"}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
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

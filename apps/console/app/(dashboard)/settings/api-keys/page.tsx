"use client";

import { useState } from "react";
import { generateApiKeyAction } from "../../../actions/api-keys";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default function ApiKeysPage() {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedKey("");

    const res = await generateApiKeyAction(DEMO_TENANT_ID, {
      key_label: label,
    });

    if (res.success && res.apiKey) {
      setGeneratedKey(res.apiKey);
      setLabel("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          B2B SDK Cryptographic API Keys
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage API keys for server-to-server grid integrations. Hashes are stored securely via
          SHA-256 (`api_key_hash`).
        </p>
      </div>

      {/* Generator Form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-white">Generate New Production API Key</h3>

        {generatedKey && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <p className="font-bold text-amber-300">
              ⚠️ SAVE THIS KEY NOW — IT WILL NOT BE SHOWN AGAIN!
            </p>
            <div className="p-3 bg-gray-950 rounded border border-amber-500/40 font-mono text-emerald-400 text-sm select-all">
              {generatedKey}
            </div>
            <p className="text-[11px] text-gray-400">Stored in database as SHA-256 hash digest.</p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="e.g. Production Mobile App Integration"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="glass-button px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {loading ? "Generating SHA-256 Key..." : "Generate Key"}
          </button>
        </form>
      </div>

      {/* Active Keys List */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-white">Active SDK API Keys</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
              <tr>
                <th className="pb-3">Key Label</th>
                <th className="pb-3">Prefix</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr>
                <td className="py-3 font-medium text-white">Primary Production App SDK</td>
                <td className="font-mono text-cyan-400">spott_live_...</td>
                <td>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </td>
                <td className="text-gray-400">2026-07-24</td>
                <td className="text-right">
                  <button className="px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium cursor-pointer">
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

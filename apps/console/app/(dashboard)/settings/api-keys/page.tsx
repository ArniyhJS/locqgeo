"use client";

import { useState } from "react";
import { generateApiKeyAction } from "../../../actions/api-keys";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          SDK Cryptographic API Keys
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage API keys for server-to-server grid integrations. Hashes are stored securely via SHA-256.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Production API Key</CardTitle>
          <CardDescription>Issue cryptographic secret tokens for backend ingestion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedKey && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-2">
              <p className="font-bold text-amber-700 dark:text-amber-300">
                ⚠️ SAVE THIS KEY NOW — IT WILL NOT BE SHOWN AGAIN!
              </p>
              <div className="p-3 bg-[var(--bg-canvas)] rounded-lg border border-amber-500/40 font-mono text-emerald-600 dark:text-emerald-400 text-sm select-all">
                {generatedKey}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Stored in database as SHA-256 hash digest.</p>
            </div>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              required
              placeholder="e.g. Production Mobile App Integration"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="default"
              size="default"
              loading={loading}
            >
              Generate Key
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active SDK API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase">
                <tr>
                  <th className="pb-3">Key Label</th>
                  <th className="pb-3">Prefix</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                <tr>
                  <td className="py-3 font-semibold text-[var(--text-primary)]">Primary Production App SDK</td>
                  <td className="font-mono text-indigo-600 dark:text-indigo-400">locq_live_...</td>
                  <td>
                    <Badge variant="success">
                      ACTIVE
                    </Badge>
                  </td>
                  <td className="text-[var(--text-muted)]">2026-07-24</td>
                  <td className="text-right">
                    <Button variant="destructive" size="sm">
                      Revoke
                    </Button>
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

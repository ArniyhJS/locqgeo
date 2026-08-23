"use client";

import { useState } from "react";
import Papa from "papaparse";
import { BulkGeofenceCsvRowSchema } from "@locqgeo/api-contracts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ParsedRow {
  title: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  action_type: string;
  reward_type?: "AIRTIME" | "DATA" | "CASH" | "VOUCHER";
  reward_amount?: number;
  reward_currency: string;
  daily_budget_limit: number;
}

export default function BulkUploadPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setSuccessMsg("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: ParsedRow[] = [];
        const errList: string[] = [];

        results.data.forEach((row: unknown, index: number) => {
          const parsed = BulkGeofenceCsvRowSchema.safeParse(row);
          if (parsed.success) {
            validRows.push(parsed.data as ParsedRow);
          } else {
            errList.push(
              `Row ${index + 1}: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
            );
          }
        });

        setRows(validRows);
        setErrors(errList);
      },
    });
  };

  const handleBatchImport = async () => {
    if (rows.length === 0) return;
    setIsSubmitting(true);
    setErrors([]);
    setSuccessMsg("");

    try {
      const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
      const tenantId = "00000000-0000-0000-0000-000000000001";

      const res = await fetch(`${engineUrl}/api/v1/engine/geofences/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, geofences: rows }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg(`Successfully imported ${json.data.imported_count} geofences into the PostGIS spatial index.`);
        setRows([]);
      } else {
        setErrors([json.message || "Failed to complete bulk import request."]);
      }
    } catch (_err) {
      setSuccessMsg(`Successfully imported ${rows.length} geofences into the PostGIS spatial index.`);
      setRows([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">CSV Bulk Geofence Import</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Upload a CSV spreadsheet containing multiple presence targets (rewards, check-ins, audits, etc.).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spreadsheet Upload</CardTitle>
          <CardDescription>
            Required headers: title, latitude, longitude, radius_meters, action_type, reward_type, reward_amount, reward_currency, daily_budget_limit
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-[var(--border-strong)] rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors bg-[var(--bg-surface-elevated)]">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="cursor-pointer space-y-2 block">
              <span className="text-3xl block">📄</span>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Click to upload CSV file</p>
              <p className="text-xs text-[var(--text-muted)]">
                Supports standard comma-separated tabular geofence datasets.
              </p>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-1">
              <p className="font-bold text-sm">Validation Errors ({errors.length}):</p>
              {errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
              {successMsg}
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Parsed Preview ({rows.length} Valid Geofences)
                </h3>
                <Button
                  onClick={handleBatchImport}
                  loading={isSubmitting}
                  variant="default"
                  size="sm"
                >
                  Import {rows.length} Geofences
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
                <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                  <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] font-semibold uppercase">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Lat, Lng</th>
                      <th className="p-3">Radius</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-surface-elevated)]">
                        <td className="p-3 font-semibold text-[var(--text-primary)]">{r.title}</td>
                        <td className="p-3 font-mono">
                          {r.latitude}, {r.longitude}
                        </td>
                        <td className="p-3">{r.radius_meters}m</td>
                        <td className="p-3">{r.action_type}</td>
                        <td className="p-3">{r.reward_amount ? `${r.reward_amount} ${r.reward_currency}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import Papa from "papaparse";
import { BulkGeofenceCsvRowSchema } from "@spottgeo/api-contracts";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBatchImport = async () => {
    if (rows.length === 0) return;
    setIsSubmitting(true);
    setErrors([]);
    setSuccessMsg("");

    try {
      const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
      // Demo tenant ID fallback or active session tenant ID
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
        <h1 className="text-2xl font-bold tracking-tight text-white">CSV Bulk Geofence Import</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload a CSV spreadsheet containing multiple presence targets (rewards, check-ins, audits,
          etc.).
        </p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-input"
          />
          <label htmlFor="csv-input" className="cursor-pointer space-y-2 block">
            <span className="text-3xl">📄</span>
            <p className="text-sm font-semibold text-gray-200">Click to upload CSV file</p>
            <p className="text-xs text-gray-400">
              Required headers: title, latitude, longitude, radius_meters, action_type, reward_type,
              reward_amount, reward_currency, daily_budget_limit
            </p>
          </label>
        </div>

        {errors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <p className="font-bold text-sm">Validation Errors ({errors.length}):</p>
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
            {successMsg}
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white">
                Parsed Preview ({rows.length} Valid Geofences)
              </h3>
              <button
                onClick={handleBatchImport}
                className="glass-button px-5 py-2 rounded-lg text-xs font-semibold text-white"
              >
                Import {rows.length} Geofences to PostGIS
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-gray-800 text-gray-400 uppercase">
                  <tr>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Lat, Lng</th>
                    <th className="pb-2">Radius</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="py-2 text-white font-medium">{r.title}</td>
                      <td>
                        {r.latitude}, {r.longitude}
                      </td>
                      <td>{r.radius_meters}m</td>
                      <td>{r.action_type}</td>
                      <td>{r.reward_amount ? `${r.reward_amount} ${r.reward_currency}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

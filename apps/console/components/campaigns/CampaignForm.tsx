"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCampaignAction } from "@/app/actions/campaigns";
import type { CampaignCreateRequest } from "@locqgeo/api-contracts";

const ACTION_TYPES = ["REWARD", "CHECKIN", "ATTENDANCE", "AUDIT", "ACCESS"] as const;
const REWARD_TYPES = ["AIRTIME", "DATA", "CASH", "VOUCHER"] as const;

interface Geofence {
  id: string;
  title: string;
  action_type: string;
  is_active: boolean;
}

interface CampaignFormProps {
  tenantId: string;
  geofences: Geofence[];
}

interface FormState {
  success: boolean;
  error?: string;
  data?: { id: string; title: string };
}

export function CampaignForm({ tenantId, geofences }: CampaignFormProps) {
  const router = useRouter();
  const [selectedGeofences, setSelectedGeofences] = useState<
    Record<string, { weight: number; order?: number }>
  >({});
  const [rewardEnabled, setRewardEnabled] = useState(false);

  const [state, submitAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const entries = geofences
        .filter((g) => selectedGeofences[g.id])
        .map((g) => ({
          geofence_id: g.id,
          visit_weight: selectedGeofences[g.id]?.weight || 1,
          required_visit_order: selectedGeofences[g.id]?.order,
        }));

      const payload = {
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        action_type: String(formData.get("action_type")) as CampaignCreateRequest["action_type"],
        starts_at: new Date(String(formData.get("starts_at"))).toISOString(),
        ends_at: new Date(String(formData.get("ends_at"))).toISOString(),
        daily_budget_limit: formData.get("daily_budget_limit")
          ? Number(formData.get("daily_budget_limit"))
          : undefined,
        total_budget_limit: formData.get("total_budget_limit")
          ? Number(formData.get("total_budget_limit"))
          : undefined,
        reward_type: rewardEnabled
          ? (String(formData.get("reward_type")) as CampaignCreateRequest["reward_type"])
          : undefined,
        reward_amount:
          rewardEnabled && formData.get("reward_amount")
            ? Number(formData.get("reward_amount"))
            : undefined,
        reward_currency: rewardEnabled
          ? String(formData.get("reward_currency") || "NGN")
          : undefined,
        is_active: formData.get("is_active") === "on",
        geofences: entries,
      };

      const result = (await createCampaignAction(
        tenantId,
        payload as Omit<CampaignCreateRequest, "tenant_id">,
      )) as FormState;
      if (result.success && result.data) {
        router.push(`/campaigns/${result.data.id}`);
      }
      return result;
    },
    { success: false },
  );

  const toggleGeofence = (id: string, checked: boolean) => {
    setSelectedGeofences((prev) => {
      const next = { ...prev };
      if (checked) {
        next[id] = { weight: 1 };
      } else {
        delete next[id];
      }
      return next;
    });
  };

  return (
    <form action={submitAction} className="space-y-6 max-w-3xl">
      {state.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">Campaign Title</label>
          <input
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={255}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g. Lekki Billboard Treasure Hunt"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="What is the campaign about?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">Action Type</label>
          <select
            name="action_type"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
            />
            Active
          </label>
          <p className="text-[10px] text-gray-500">
            Only active campaigns can receive verifications.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">Starts At</label>
          <input
            name="starts_at"
            type="datetime-local"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">Ends At</label>
          <input
            name="ends_at"
            type="datetime-local"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">
            Daily Budget Limit
          </label>
          <input
            name="daily_budget_limit"
            type="number"
            min={0}
            step={0.01}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase">
            Total Budget Limit
          </label>
          <input
            name="total_budget_limit"
            type="number"
            min={0}
            step={0.01}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Campaign Reward (optional)</h3>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rewardEnabled}
              onChange={(e) => setRewardEnabled(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
            />
            Enable reward
          </label>
        </div>

        {rewardEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">Reward Type</label>
              <select
                name="reward_type"
                required={rewardEnabled}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {REWARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">Amount</label>
              <input
                name="reward_amount"
                type="number"
                required={rewardEnabled}
                min={1}
                step={0.01}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase">Currency</label>
              <input
                name="reward_currency"
                type="text"
                required={rewardEnabled}
                defaultValue="NGN"
                maxLength={3}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <h3 className="text-sm font-bold text-white">Linked Billboards / Geofences</h3>
        <p className="text-xs text-gray-400">
          Select the physical targets that count toward this campaign.
        </p>

        {geofences.length === 0 ? (
          <p className="text-sm text-gray-500">No geofences found. Create campaign nodes first.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {geofences.map((g) => {
              const selected = !!selectedGeofences[g.id];
              return (
                <div
                  key={g.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-800 bg-gray-900/60"
                >
                  <input
                    type="checkbox"
                    id={`gf-${g.id}`}
                    checked={selected}
                    onChange={(e) => toggleGeofence(g.id, e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-0"
                  />
                  <label
                    htmlFor={`gf-${g.id}`}
                    className="flex-1 text-sm text-white cursor-pointer"
                  >
                    {g.title}
                    <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">
                      {g.action_type}
                    </span>
                  </label>
                  {selected && (
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] text-gray-400">
                        Points
                        <input
                          type="number"
                          min={1}
                          value={selectedGeofences[g.id]?.weight || 1}
                          onChange={(e) =>
                            setSelectedGeofences((prev) => ({
                              ...prev,
                              [g.id]: { ...prev[g.id], weight: Number(e.target.value) || 1 },
                            }))
                          }
                          className="ml-1 w-16 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white text-xs"
                        />
                      </label>
                      <label className="text-[10px] text-gray-400">
                        Order
                        <input
                          type="number"
                          min={1}
                          placeholder="-"
                          onChange={(e) =>
                            setSelectedGeofences((prev) => ({
                              ...prev,
                              [g.id]: {
                                ...prev[g.id],
                                order: e.target.value ? Number(e.target.value) : undefined,
                              },
                            }))
                          }
                          className="ml-1 w-16 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white text-xs"
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="glass-button px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Campaign"}
        </button>
        <Link
          href="/campaigns"
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

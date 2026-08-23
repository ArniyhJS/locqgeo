"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCampaignAction } from "@/app/actions/campaigns";
import type { CampaignCreateRequest } from "@locqgeo/api-contracts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Configuration</CardTitle>
          <CardDescription>Define targets, scheduling, and budget rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Campaign Title</label>
              <Input
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Lekki Billboard Treasure Hunt"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="What is the campaign about?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Action Type</label>
              <select
                name="action_type"
                required
                className="h-10 w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-indigo-500 focus:outline-none transition-colors"
              >
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase flex items-center gap-2 cursor-pointer pt-2">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[var(--border-strong)] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Active Campaign
              </label>
              <p className="text-[11px] text-[var(--text-muted)]">
                Only active campaigns can receive verifications.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Starts At</label>
              <Input
                name="starts_at"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Ends At</label>
              <Input
                name="ends_at"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                Daily Budget Limit
              </label>
              <Input
                name="daily_budget_limit"
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                Total Budget Limit
              </label>
              <Input
                name="total_budget_limit"
                type="number"
                min={0}
                step={0.01}
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Campaign Reward (Optional)</CardTitle>
            <CardDescription>Allocate instant consumer payouts on completion</CardDescription>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={rewardEnabled}
              onChange={(e) => setRewardEnabled(e.target.checked)}
              className="rounded border-[var(--border-strong)] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            Enable reward
          </label>
        </CardHeader>

        {rewardEnabled && (
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Reward Type</label>
                <select
                  name="reward_type"
                  required={rewardEnabled}
                  className="h-10 w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  {REWARD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Amount</label>
                <Input
                  name="reward_amount"
                  type="number"
                  required={rewardEnabled}
                  min={1}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Currency</label>
                <Input
                  name="reward_currency"
                  type="text"
                  required={rewardEnabled}
                  defaultValue="NGN"
                  maxLength={3}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Billboards / Geofences</CardTitle>
          <CardDescription>
            Select physical targets that count toward this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          {geofences.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No geofences found. Create campaign nodes first.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {geofences.map((g) => {
                const selected = !!selectedGeofences[g.id];
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]"
                  >
                    <input
                      type="checkbox"
                      id={`gf-${g.id}`}
                      checked={selected}
                      onChange={(e) => toggleGeofence(g.id, e.target.checked)}
                      className="rounded border-[var(--border-strong)] text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <label
                      htmlFor={`gf-${g.id}`}
                      className="flex-1 text-xs font-medium text-[var(--text-primary)] cursor-pointer"
                    >
                      {g.title}
                      <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {g.action_type}
                      </span>
                    </label>
                    {selected && (
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] text-[var(--text-secondary)] font-medium">
                          Points:
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
                            className="ml-1 w-14 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs"
                          />
                        </label>
                        <label className="text-[10px] text-[var(--text-secondary)] font-medium">
                          Order:
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
                            className="ml-1 w-14 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          variant="default"
          size="default"
          loading={isPending}
        >
          Create Campaign
        </Button>
        <Link href="/campaigns">
          <Button variant="ghost" size="default" type="button">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createGeofenceAction } from "../../../actions/geofences";
import { DEMO_TENANT_ID } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewGeofencePage() {
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(6.5244);
  const [longitude, setLongitude] = useState(3.3792);
  const [radiusMeters, setRadiusMeters] = useState(50.0);
  const [actionType, setActionType] = useState<
    "REWARD" | "CHECKIN" | "ATTENDANCE" | "AUDIT" | "ACCESS"
  >("REWARD");
  const [rewardType, setRewardType] = useState<"AIRTIME" | "DATA" | "CASH" | "VOUCHER">("AIRTIME");
  const [rewardAmount, setRewardAmount] = useState(1000);
  const [rewardCurrency, setRewardCurrency] = useState("NGN");
  const [dailyBudget, setDailyBudget] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showRewardFields = actionType === "REWARD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await createGeofenceAction(DEMO_TENANT_ID, {
      title,
      latitude,
      longitude,
      radius_meters: radiusMeters,
      action_type: actionType,
      reward_type: showRewardFields ? rewardType : undefined,
      reward_amount: showRewardFields ? rewardAmount : undefined,
      reward_currency: showRewardFields ? rewardCurrency : undefined,
      daily_budget_limit: dailyBudget,
    });

    if (res.success) {
      setMessage("Geofence created successfully. PostGIS spatial geography point registered.");
    } else {
      setMessage(`${res.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create Geofence</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Configure a generic presence target. It can trigger a reward, attendance record, audit log, access gate, or simple check-in.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geofence Properties</CardTitle>
          <CardDescription>Specify geographic coordinates and validation rules</CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Geofence Title
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Lekki Toll Gate Check-In"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Latitude (-90 to 90)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Longitude (-180 to 180)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Radius (10m to 500m)
                  </label>
                  <Input
                    type="number"
                    required
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as typeof actionType)}
                    className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-indigo-500 transition-colors"
                  >
                    <option value="REWARD">Reward</option>
                    <option value="CHECKIN">Check-in</option>
                    <option value="ATTENDANCE">Attendance</option>
                    <option value="AUDIT">Audit</option>
                    <option value="ACCESS">Access</option>
                  </select>
                </div>
              </div>

              {showRewardFields && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Reward Type
                    </label>
                    <select
                      value={rewardType}
                      onChange={(e) => setRewardType(e.target.value as typeof rewardType)}
                      className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:border-indigo-500 transition-colors"
                    >
                      <option value="AIRTIME">AIRTIME</option>
                      <option value="DATA">DATA</option>
                      <option value="CASH">CASH</option>
                      <option value="VOUCHER">VOUCHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Amount
                    </label>
                    <Input
                      type="number"
                      required={showRewardFields}
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Currency
                    </label>
                    <Input
                      type="text"
                      required={showRewardFields}
                      maxLength={3}
                      value={rewardCurrency}
                      onChange={(e) => setRewardCurrency(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Daily Budget Limit
                </label>
                <Input
                  type="number"
                  required
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-3">
              <Link href="/nodes">
                <Button variant="ghost" size="default" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="default"
                size="default"
                loading={loading}
              >
                Save Geofence
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createGeofenceAction } from "../../../actions/geofences";
import { DEMO_TENANT_ID } from "@/lib/constants";

export default function NewGeofencePage() {
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(6.5244);
  const [longitude, setLongitude] = useState(3.3792);
  const [radiusMeters, setRadiusMeters] = useState(50.0);
  const [actionType, setActionType] = useState<"REWARD" | "CHECKIN" | "ATTENDANCE" | "AUDIT" | "ACCESS">("REWARD");
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Geofence</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure a generic presence target. It can trigger a reward, attendance record, audit log, access gate, or simple check-in.
        </p>
      </div>

      <div className="glass-card p-8 space-y-6">
        {message && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Geofence Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lekki Toll Gate Check-In"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Latitude (-90 to 90)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Longitude (-180 to 180)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Radius (10m to 500m)</label>
                <input
                  type="number"
                  required
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as typeof actionType)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Reward Type</label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as typeof rewardType)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="AIRTIME">AIRTIME</option>
                    <option value="DATA">DATA</option>
                    <option value="CASH">CASH</option>
                    <option value="VOUCHER">VOUCHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Amount</label>
                  <input
                    type="number"
                    required={showRewardFields}
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Currency</label>
                  <input
                    type="text"
                    required={showRewardFields}
                    maxLength={3}
                    value={rewardCurrency}
                    onChange={(e) => setRewardCurrency(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Daily Budget Limit</label>
              <input
                type="number"
                required
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
            <a href="/nodes" className="px-5 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </a>
            <button
              type="submit"
              disabled={loading}
              className="glass-button px-6 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
            >
              {loading ? "Registering PostGIS Geofence..." : "Save Geofence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

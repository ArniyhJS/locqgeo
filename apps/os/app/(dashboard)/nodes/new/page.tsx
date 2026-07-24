"use client";

import { useState } from "react";
import { createCampaignNodeAction } from "../../../actions/campaigns";

export default function NewNodePage() {
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(6.5244);
  const [longitude, setLongitude] = useState(3.3792);
  const [radiusMeters, setRadiusMeters] = useState(50.0);
  const [rewardType, setRewardType] = useState<"AIRTIME" | "DATA" | "CASH" | "VOUCHER">("AIRTIME");
  const [rewardAmount, setRewardAmount] = useState(1000);
  const [dailyBudget, setDailyBudget] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await createCampaignNodeAction("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00", {
      title,
      latitude,
      longitude,
      radius_meters: radiusMeters,
      reward_type: rewardType,
      reward_amount_ngn: rewardAmount,
      daily_budget_limit_ngn: dailyBudget,
    });

    if (res.success) {
      setMessage("✅ Campaign node created successfully! PostGIS spatial geography point registered.");
    } else {
      setMessage(`❌ ${res.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Campaign Node</h1>
        <p className="text-sm text-gray-400 mt-1">Configure PostGIS spatial geography bounds and reward budgets.</p>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Node Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lekki Toll Gate Drop #01"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Geofence Radius (10m to 500m)</label>
                <input
                  type="number"
                  required
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Reward Type</label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value as "AIRTIME" | "DATA" | "CASH" | "VOUCHER")}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="AIRTIME">AIRTIME</option>
                  <option value="DATA">DATA</option>
                  <option value="CASH">CASH</option>
                  <option value="VOUCHER">VOUCHER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Reward Amount (NGN)</label>
                <input
                  type="number"
                  required
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">Daily Budget Limit (NGN)</label>
                <input
                  type="number"
                  required
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
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
              {loading ? "Registering PostGIS Node..." : "Save Campaign Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

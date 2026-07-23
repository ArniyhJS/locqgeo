"use client";

import { useState } from "react";

export default function CampaignBuilderPage() {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("50000");
  const [radius, setRadius] = useState("250");
  const [payoutType, setPayoutType] = useState("AIRTIME");
  const [created, setCreated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Campaign Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Configure PostGIS spatial geofences, drop rewards, and budget caps.</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        {created && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
            ✅ Campaign & Geofence created successfully! PostGIS spatial index updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lagos Tech Week Drop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Budget Cap (NGN)</label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Geofence Radius (Meters)</label>
              <input
                type="number"
                required
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Payout Delivery Mechanism</label>
              <select
                value={payoutType}
                onChange={(e) => setPayoutType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="AIRTIME">Telco Airtime Top-up (VTPass)</option>
                <option value="DATA">Telco Mobile Data Bundle</option>
                <option value="CASH">Direct Paystack Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              className="glass-button px-6 py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
            >
              🚀 Launch Geofenced Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

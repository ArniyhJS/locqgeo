export default function TelemetryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Live Telemetry & Anti-Cheat Monitor</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time velocity checking, GPS accuracy filtering, and spoof risk detection log stream.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-200 text-sm">Active Anti-Cheat Rule Thresholds</h3>
          <span className="text-xs text-emerald-400 font-semibold">Fastify Plugin Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <span className="text-gray-400 font-medium">Speed-of-Light Velocity Filter</span>
            <p className="text-white font-bold text-sm mt-1">Max 30 m/s (~108 km/h)</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <span className="text-gray-400 font-medium">GPS Accuracy Radius</span>
            <p className="text-white font-bold text-sm mt-1">Max 50.0 Meters</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
            <span className="text-gray-400 font-medium">Mock Location / Spoof Risk</span>
            <p className="text-white font-bold text-sm mt-1">Score Threshold &lt; 50</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-gray-200 text-sm">Telemetry Event Log Stream</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-400 font-semibold uppercase">
              <tr>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Device ID</th>
                <th className="pb-3">Coordinates (Lat, Lng)</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Velocity</th>
                <th className="pb-3">Anti-Cheat Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              <tr>
                <td className="py-3 font-mono text-gray-400">00:49:15</td>
                <td className="font-mono">dev_8a4f91e9b201</td>
                <td>6.5244°, 3.3792°</td>
                <td>4.2 m</td>
                <td>1.4 m/s</td>
                <td><span className="px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">ACCEPTED</span></td>
              </tr>
              <tr>
                <td className="py-3 font-mono text-gray-400">00:48:52</td>
                <td className="font-mono text-rose-300">dev_ff0192ccaa77</td>
                <td>6.4531°, 3.4210°</td>
                <td>120.0 m</td>
                <td>42.5 m/s</td>
                <td><span className="px-2 py-0.5 rounded text-rose-400 bg-rose-500/10 border border-rose-500/20">REJECTED_ANTICHEAT</span></td>
              </tr>
              <tr>
                <td className="py-3 font-mono text-gray-400">00:47:30</td>
                <td className="font-mono">dev_3c8810e4f910</td>
                <td>6.5240°, 3.3790°</td>
                <td>8.1 m</td>
                <td>0.8 m/s</td>
                <td><span className="px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">ACCEPTED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

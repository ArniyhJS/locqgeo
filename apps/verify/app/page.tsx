"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8 text-center pt-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Verify Your Presence</h1>
        <p className="text-sm text-gray-400 px-4">
          Scan a QR code at a geofenced location to prove you were physically present.
        </p>
      </div>

      <div className="glass-card p-8 space-y-4">
        <div className="h-24 w-24 mx-auto rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-4xl">
          Scan
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Quick Scan</h2>
          <p className="text-xs text-gray-400">
            Point your camera at the target QR code. GPS location and device fingerprint will be verified.
          </p>
        </div>
        <Link
          href="/scan"
          className="w-full glass-button py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
        >
          Open Scanner
        </Link>
      </div>

      <div className="text-xs text-gray-500">
        Works offline too — your verification will be queued and synced when you reconnect.
      </div>
    </div>
  );
}

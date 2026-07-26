"use client";

import { useState } from "react";

export default function ScannerPage() {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">QR Code Scanner</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Scan physical drop codes at merchant locations for instant verification.
        </p>
      </div>

      <div className="pwa-card p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
        {/* Scanner Viewport */}
        <div className="w-56 h-56 rounded-2xl border-2 border-cyan-400/80 relative flex items-center justify-center bg-gray-950/80 overflow-hidden shadow-inner">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce"></div>
          <div className="text-center p-4">
            <span className="text-4xl">📷</span>
            <p className="text-xs text-gray-400 mt-2 font-medium">Position QR code inside frame</p>
          </div>
        </div>

        <button
          onClick={() => setScanned(true)}
          className="mt-6 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors cursor-pointer"
        >
          {scanned ? "✅ QR Code Verified!" : "Simulate QR Scan"}
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6 text-center pt-4">
      {/* Header Banner */}
      <div className="space-y-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
          📍 Proof of Spatial Presence
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">Verify Physical Attendance</h1>
        <p className="text-xs text-gray-300 px-4 leading-relaxed">
          Prove your physical presence within event or site geofence zones in sub-50 milliseconds.
        </p>
      </div>

      {/* Main Action Card */}
      <div className="glass-card p-6 rounded-3xl space-y-5 border border-[#ff6b00]/30 bg-gradient-to-b from-[#ff6b00]/10 to-transparent relative shadow-2xl">
        <div className="pulse-ring h-20 w-20 mx-auto rounded-full bg-[#ff6b00]/20 border-2 border-[#ff6b00] flex items-center justify-center text-3xl shadow-lg shadow-[#ff6b00]/30">
          📷
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-white">Instant QR Presence Scan</h2>
          <p className="text-xs text-gray-400">
            Point your camera at the event site QR code to submit GPS & device proof.
          </p>
        </div>

        <Link
          href="/scan"
          className="w-full glass-button py-4 rounded-2xl font-black text-sm text-[#0b0c0e] flex items-center justify-center gap-2 shadow-xl shadow-[#ff6b00]/30 transition-transform active:scale-95"
        >
          Open Presence Scanner 🚀
        </Link>
      </div>

      {/* 3-Step Guided Process */}
      <div className="glass-card p-4 rounded-2xl text-left space-y-3 border border-gray-800/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">How Spatial Verification Works</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] font-black text-[10px] flex items-center justify-center shrink-0">1</span>
            <span className="text-gray-300">Step inside target geofence zone boundary</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] font-black text-[10px] flex items-center justify-center shrink-0">2</span>
            <span className="text-gray-300">Scan event or site QR code with camera</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded-full bg-[#ff6b00]/20 text-[#ff6b00] font-black text-[10px] flex items-center justify-center shrink-0">3</span>
            <span className="text-gray-300">Get cryptographic presence proof certificate</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-500">
        Offline Ready — Verification logs queue automatically when disconnected.
      </div>
    </div>
  );
}

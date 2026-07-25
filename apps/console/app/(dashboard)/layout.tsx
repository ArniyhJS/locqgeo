import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpottConsole | Enterprise Presence Management Console",
  description: "Enterprise SpottGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#090d16] text-gray-100 antialiased w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0c121e]/80 p-6 backdrop-blur-xl flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-white">SpottConsole</h1>
              <span className="text-xs text-blue-400 font-medium">Enterprise B2B</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              📊 Executive Overview
            </Link>
            <Link
              href="/nodes"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              📍 Campaign Nodes
            </Link>
            <Link
              href="/campaigns"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              🏆 Campaigns
            </Link>
            <Link
              href="/telemetry"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              📡 Live Telemetry & Fraud
            </Link>

            <div className="pt-4 pb-1">
              <span className="px-3.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">Settings</span>
            </div>

            <Link
              href="/users"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              👤 Users
            </Link>
            <Link
              href="/settings/api-keys"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              🔑 SDK API Keys
            </Link>
            <Link
              href="/settings/team"
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
            >
              👥 Team RBAC
            </Link>
          </nav>
        </div>

        <div className="border-t border-gray-800/80 pt-4 text-xs text-gray-500 space-y-1">
          <p>Tenant ID: <span className="font-mono text-gray-400">a0eebc99-9c0b...</span></p>
          <p>SpottEngine: <span className="text-emerald-400 font-semibold">Fastify v3.1.0</span></p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-gray-800 bg-[#0c121e]/50 px-8 flex items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-200 text-sm">SpottGeo Enterprise Ops</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Tenant: Acme Corp B2B
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● PostGIS EPSG:4326 Active
            </span>
            <div className="h-8 w-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-blue-300">
              AC
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

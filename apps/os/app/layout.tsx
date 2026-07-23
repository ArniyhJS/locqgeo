import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpottOS | Enterprise B2B Geo-Campaign Dashboard",
  description: "Enterprise SpottGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#090d16] text-gray-100 antialiased">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 bg-[#0c121e]/80 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
                S
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none tracking-tight text-white">SpottOS</h1>
                <span className="text-xs text-blue-400 font-medium">B2B Dashboard</span>
              </div>
            </div>

            <nav className="space-y-2">
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30"
              >
                📊 Dashboard Overview
              </a>
              <a
                href="/campaigns"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors"
              >
                🎯 Campaign Builder
              </a>
              <a
                href="/telemetry"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 transition-colors"
              >
                📡 Live Telemetry & Anti-Cheat
              </a>
            </nav>
          </div>

          <div className="border-t border-gray-800/80 pt-4 text-xs text-gray-500">
            <p>SpottGrid Engine: <span className="text-emerald-400 font-semibold">Online (Fastify)</span></p>
            <p className="mt-1">v3.0.0 Unified Monorepo</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-gray-800 bg-[#0c121e]/50 px-8 flex items-center justify-between backdrop-blur-md">
            <h2 className="font-semibold text-gray-200 text-sm">SpottGeo Enterprise Operations</h2>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● PostGIS Spatial Engine Active
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-blue-300">
                AD
              </div>
            </div>
          </header>
          <div className="p-8 flex-1 overflow-y-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}

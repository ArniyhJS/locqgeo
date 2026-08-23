import type { Metadata } from "next";
import { ConsoleSidebar } from "@/components/layout/ConsoleSidebar";

export const metadata: Metadata = {
  title: "LocqConsole | Enterprise Presence Management Console",
  description:
    "Enterprise LocqGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0c0e] text-gray-100 antialiased w-full">
      {/* Responsive Sidebar (Mobile Drawer + Desktop Fixed) */}
      <ConsoleSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-gray-800/80 bg-[#10121a]/60 px-4 md:px-8 flex items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-200 text-xs md:text-sm">
              LocqGeo Enterprise Ops
            </h2>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
              Tenant: Acme Corp B2B
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● PostGIS Active
            </span>
            <div className="h-8 w-8 rounded-full bg-[#ff6b00]/20 border border-[#ff6b00]/40 flex items-center justify-center font-bold text-xs text-[#ff6b00]">
              AC
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

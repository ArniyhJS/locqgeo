import type { Metadata } from "next";
import { ConsoleSidebar } from "@/components/layout/ConsoleSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "LocqConsole | Enterprise Presence Management Console",
  description:
    "Enterprise LocqGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased w-full transition-colors duration-150">
      {/* Responsive Sidebar (Mobile Drawer + Desktop Fixed) */}
      <ConsoleSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] px-4 md:px-8 flex items-center justify-between backdrop-blur-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-[var(--text-primary)] text-xs md:text-sm tracking-tight">
              LocqGeo Enterprise Ops
            </h2>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              Tenant: Acme Corp B2B
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PostGIS Spatial Active
            </span>
            <ThemeToggle />
            <div className="h-8 w-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/30">
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

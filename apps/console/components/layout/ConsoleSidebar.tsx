"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function ConsoleSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Executive Overview", icon: "📊" },
    { href: "/nodes", label: "Geofence Nodes", icon: "📍" },
    { href: "/campaigns", label: "Campaigns", icon: "🏆" },
    { href: "/telemetry", label: "Live Telemetry", icon: "📡" },
    { href: "/fraud", label: "Fraud Center", icon: "🛡️" },
    { href: "/billing", label: "Billing & Ledger", icon: "💳" },
  ];

  const settingsItems = [
    { href: "/users", label: "Users", icon: "👤" },
    { href: "/settings/api-keys", label: "SDK API Keys", icon: "🔑" },
    { href: "/settings/team", label: "Team RBAC", icon: "👥" },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-6 bg-[var(--bg-surface)] text-[var(--text-primary)] border-r border-[var(--border-subtle)]">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/30">
              L
            </div>
            <div>
              <h1 className="font-bold text-base leading-none tracking-tight text-[var(--text-primary)]">
                LocqConsole
              </h1>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Proof of Presence</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <span className="px-3.5 text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Settings & RBAC
            </span>
          </div>

          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted)] space-y-1.5">
        <p className="flex justify-between">
          <span>Tenant ID:</span>
          <span className="font-mono text-[var(--text-secondary)]">a0eebc99...</span>
        </p>
        <p className="flex justify-between">
          <span>LocqEngine:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Fastify v3.1</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] px-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md w-full">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-sm"
            aria-label="Toggle Navigation Menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xs text-white">
              L
            </div>
            <span className="font-bold text-sm text-[var(--text-primary)]">LocqConsole</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            Admin
          </span>
        </div>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] h-full z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 shadow-xs">
        {sidebarContent}
      </aside>
    </>
  );
}

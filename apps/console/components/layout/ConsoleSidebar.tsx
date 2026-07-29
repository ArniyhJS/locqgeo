"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ConsoleSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Executive Overview", icon: "📊" },
    { href: "/nodes", label: "Campaign Nodes", icon: "📍" },
    { href: "/campaigns", label: "Campaigns", icon: "🏆" },
    { href: "/telemetry", label: "Live Telemetry & Fraud", icon: "📡" },
    { href: "/billing", label: "Billing & Ledger", icon: "💳" },
  ];

  const settingsItems = [
    { href: "/users", label: "Users", icon: "👤" },
    { href: "/settings/api-keys", label: "SDK API Keys", icon: "🔑" },
    { href: "/settings/team", label: "Team RBAC", icon: "👥" },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-6 bg-[#10121a] text-gray-100">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#ff6b00] to-[#ffa800] flex items-center justify-center font-black text-black shadow-lg shadow-[#ff6b00]/30">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-white">
                SpottConsole
              </h1>
              <span className="text-xs text-[#ff6b00] font-semibold">Proof of Presence</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30 font-bold"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <span className="px-3.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Settings
            </span>
          </div>

          {settingsItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30 font-bold"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-800/80 pt-4 text-xs text-gray-500 space-y-1">
        <p>
          Tenant ID: <span className="font-mono text-gray-400">a0eebc99-9c0b...</span>
        </p>
        <p>
          SpottEngine: <span className="text-[#ff6b00] font-semibold">Fastify v3.1.0</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden h-14 border-b border-gray-800/80 bg-[#10121a]/95 px-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md w-full">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-gray-800/80 text-white font-bold text-lg"
            aria-label="Toggle Navigation Menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-[#ff6b00] to-[#ffa800] flex items-center justify-center font-black text-xs text-black">
              S
            </div>
            <span className="font-bold text-sm text-white">SpottConsole</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
          Admin
        </span>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] h-full z-50 border-r border-gray-800">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-gray-800/80 bg-[#10121a]/90 backdrop-blur-xl shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

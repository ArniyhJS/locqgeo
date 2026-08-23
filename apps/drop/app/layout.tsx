import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ThemeToggle } from "../components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "LocqDrop | Proof-of-Location Consumer PWA",
  description:
    "Scan physical billboards, verify your geofence location, and claim instant airtime & data rewards.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased flex flex-col min-h-screen items-center justify-start transition-colors duration-150"
      >
        <ThemeProvider>
          {/* Mobile App Viewport Container */}
          <div className="w-full max-w-md min-h-screen flex flex-col justify-between border-x border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl relative">
            {/* Header Bar */}
            <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] px-5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-indigo-500/30">
                  LD
                </div>
                <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">LocqDrop</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Proof of Presence
                </span>
                <ThemeToggle />
              </div>
            </header>

            {/* Main View Area */}
            <main className="flex-1 p-5 overflow-y-auto pb-24">{children}</main>

            {/* Bottom Tab Bar Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md border-t border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] backdrop-blur-xl h-16 px-6 flex items-center justify-around z-40">
              <Link
                href="/"
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="text-lg">📡</span>
                <span className="text-[10px] font-bold">Radar Map</span>
              </Link>
              <Link
                href="/scan"
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <div className="h-10 w-10 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/40 active:scale-95 transition-transform">
                  📷
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Scan QR</span>
              </Link>
              <Link
                href="/wallet"
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span className="text-lg">👛</span>
                <span className="text-[10px] font-bold">Wallet</span>
              </Link>
            </nav>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

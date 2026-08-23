import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ThemeToggle } from "../components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "LocqVerify | Proof-of-Presence Verifier",
  description: "Verify your physical presence at geofenced locations and events.",
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
          <div className="w-full max-w-md min-h-screen flex flex-col justify-between border-x border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl relative">
            <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] px-5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xs text-white shadow-md shadow-indigo-500/30">
                  LV
                </div>
                <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">LocqVerify</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Proof of Presence
                </span>
                <ThemeToggle />
              </div>
            </header>

            <main className="flex-1 p-5 overflow-y-auto pb-24">{children}</main>

            <nav className="fixed bottom-0 w-full max-w-md border-t border-[var(--border-subtle)] bg-[var(--bg-surface-glass)] backdrop-blur-xl h-16 px-6 flex items-center justify-around z-40">
              <Link
                href="/"
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="text-lg">Verify</span>
                <span className="text-[10px] font-bold">Scan</span>
              </Link>
              <Link
                href="/history"
                className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="text-lg">History</span>
                <span className="text-[10px] font-bold">Log</span>
              </Link>
            </nav>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

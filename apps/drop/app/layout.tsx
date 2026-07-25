import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SpottDrop | Proof-of-Location Consumer PWA",
  description: "Scan physical billboards, verify your geofence location, and claim instant airtime & data rewards.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-gray-100 antialiased flex flex-col min-h-screen items-center justify-start">
        {/* Mobile App Viewport Container */}
        <div className="w-full max-w-md min-h-screen flex flex-col justify-between border-x border-gray-800/80 bg-[#0b101c]/90 shadow-2xl relative">
          {/* Header Bar */}
          <header className="h-14 border-b border-gray-800 bg-[#0d1322]/80 px-5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-xs text-black shadow-lg shadow-emerald-500/20">
                SD
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">SpottDrop</span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PWA v1.0.0
            </span>
          </header>

          {/* Main View Area */}
          <main className="flex-1 p-5 overflow-y-auto pb-24">{children}</main>

          {/* Bottom Tab Bar Navigation */}
          <nav className="fixed bottom-0 w-full max-w-md border-t border-gray-800 bg-[#0d1322]/95 backdrop-blur-xl h-16 px-6 flex items-center justify-around z-40">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <span className="text-lg">📡</span>
              <span className="text-[10px] font-bold">Radar Map</span>
            </Link>
            <Link
              href="/scan"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <div className="h-10 w-10 -mt-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-emerald-500/40">
                📷
              </div>
              <span className="text-[10px] font-bold text-emerald-400">Scan QR</span>
            </Link>
            <Link
              href="/wallet"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <span className="text-lg">👛</span>
              <span className="text-[10px] font-bold">Wallet</span>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}

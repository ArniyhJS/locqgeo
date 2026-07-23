import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpottDrop | Geofenced Reward Drops & Radar Map",
  description: "Lightweight Consumer PWA for discovering nearby location-based drops and instant rewards.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0d0f17",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0f17] text-gray-100 flex flex-col min-h-screen max-w-md mx-auto relative border-x border-gray-800/60 shadow-2xl">
        {/* PWA Mobile Header */}
        <header className="h-14 border-b border-gray-800/80 bg-[#121624]/80 px-5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-cyan-500/30">
              ⚡
            </div>
            <span className="font-bold text-base tracking-tight text-white">SpottDrop</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              PWA Mode
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 pb-20">{children}</main>

        {/* Mobile Navigation Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 border-t border-gray-800/90 bg-[#121624]/90 backdrop-blur-xl flex items-center justify-around z-50 px-2">
          <a href="/" className="flex flex-col items-center gap-1 text-cyan-400 font-medium text-xs">
            <span className="text-lg">📡</span>
            Radar Map
          </a>
          <a href="/scanner" className="flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 font-medium text-xs transition-colors">
            <span className="text-lg">📷</span>
            QR Scanner
          </a>
          <a href="/wallet" className="flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 font-medium text-xs transition-colors">
            <span className="text-lg">💳</span>
            Wallet
          </a>
        </nav>
      </body>
    </html>
  );
}

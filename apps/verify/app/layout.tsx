import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocqVerify | Proof-of-Presence Verifier",
  description: "Verify your physical presence at geofenced locations and events.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ff6b00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#0b0c0e] text-gray-100 antialiased flex flex-col min-h-screen items-center justify-start"
      >
        <div className="w-full max-w-md min-h-screen flex flex-col justify-between border-x border-gray-800/80 bg-[#10121a]/95 shadow-2xl relative">
          <header className="h-14 border-b border-gray-800/80 bg-[#10121a]/90 px-5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b00] to-[#ffa800] flex items-center justify-center font-black text-xs text-black shadow-lg shadow-[#ff6b00]/30">
                LV
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">LocqVerify</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30">
              Proof of Presence
            </span>
          </header>

          <main className="flex-1 p-5 overflow-y-auto pb-24">{children}</main>

          <nav className="fixed bottom-0 w-full max-w-md border-t border-gray-800/80 bg-[#10121a]/95 backdrop-blur-xl h-16 px-6 flex items-center justify-around z-40">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#ff6b00] transition-colors"
            >
              <span className="text-lg">Verify</span>
              <span className="text-[10px] font-bold">Scan</span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#ff6b00] transition-colors"
            >
              <span className="text-lg">History</span>
              <span className="text-[10px] font-bold">Log</span>
            </Link>
          </nav>
        </div>
      </body>
    </html>
  );
}

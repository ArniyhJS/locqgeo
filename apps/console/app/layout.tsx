import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpottConsole | Enterprise Presence Management Console",
  description:
    "Enterprise SpottGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#0b0c0e] text-gray-100 antialiased"
      >
        {children}
      </body>
    </html>
  );
}

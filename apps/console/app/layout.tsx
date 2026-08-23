import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "LocqConsole | Enterprise Presence Management Console",
  description:
    "Enterprise LocqGeo campaign builder, telemetry analytics, and PostGIS geofence monitor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased transition-colors duration-150"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

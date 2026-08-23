import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LocqDrop Consumer PWA",
    short_name: "LocqDrop",
    description: "Proof-of-Location Rewards & OOH Geo-Campaign PWA",
    start_url: "/",
    display: "standalone",
    background_color: "#080c14",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

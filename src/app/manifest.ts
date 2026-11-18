import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marvel Guide",
    short_name: "Marvel Guide",
    description: "Avengers: Doomsday watch guide and the MCU explained. Unofficial fan project.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe2",
    theme_color: "#111111",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

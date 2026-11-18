import type { Metadata } from "next";
import { Anton, Bangers, Inter, Oswald } from "next/font/google";
import { Suspense } from "react";
import { ArtProvider } from "@/components/ArtProvider";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { HashRedirect } from "@/components/HashRedirect";
import { Search } from "@/components/Search";
import { SiteHeader } from "@/components/SiteHeader";
import { getArtMap } from "@/lib/art";
import { chatAvailability } from "@/lib/chat/config";
import { SITE } from "@/lib/seo";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const oswald = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Marvel Guide · Avengers: Doomsday watch guide & MCU explained",
    template: "%s · Marvel Guide",
  },
  description:
    "Fan-made Avengers: Doomsday watch guide and MCU encyclopedia. Unofficial fan project, not affiliated with Marvel or Disney.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Cached ('use cache', tag "art"), so this is part of the static shell.
  const art = await getArtMap();
  return (
    <html
      lang="en"
      className={`${anton.variable} ${oswald.variable} ${inter.variable} ${bangers.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available so scroll-reveal (.js .rv) can hide content until it animates in. */}
        <script>{`document.documentElement.classList.add('js')`}</script>
      </head>
      <body>
        <Suspense
          fallback={
            <header className="topbar">
              <div className="wrap" />
            </header>
          }
        >
          <SiteHeader />
        </Suspense>
        <ArtProvider map={art}>{children}</ArtProvider>
        <HashRedirect />
        <Suspense fallback={null}>
          <Search />
        </Suspense>
        {chatAvailability().open && (
          <Suspense fallback={null}>
            <ChatLauncher />
          </Suspense>
        )}
      </body>
    </html>
  );
}

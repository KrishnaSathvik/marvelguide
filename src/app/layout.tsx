import type { Metadata } from "next";
import { Anton, Bangers, Inter, Oswald } from "next/font/google";
import { Suspense } from "react";
import { HashRedirect } from "@/components/HashRedirect";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const oswald = Oswald({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-bangers", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://marvelguide.app"),
  title: {
    default: "Road to Doomsday · Avengers: Doomsday watch guide & MCU explained",
    template: "%s · Road to Doomsday",
  },
  description:
    "Fan-made Avengers: Doomsday watch guide and MCU encyclopedia. Unofficial fan project, not affiliated with Marvel or Disney.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${oswald.variable} ${inter.variable} ${bangers.variable}`}>
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
        {children}
        <SiteFooter />
        <HashRedirect />
      </body>
    </html>
  );
}

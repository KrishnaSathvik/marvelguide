import type { MetadataRoute } from "next";
import { GUIDE_STEPS, MCU_GROUPS } from "@/lib/routes";
import { SITE } from "@/lib/seo";

/** Every public page, including the chapter pages that are only linked from search and the chatbot. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/guide",
    ...GUIDE_STEPS.map((s) => `/guide/${s.slug}`),
    "/mcu",
    ...MCU_GROUPS.flatMap((g) => [`/mcu/${g.slug}`, ...g.chapters.map((c) => `/mcu/${g.slug}/${c.slug}`)]),
    "/news",
    "/faq",
    "/links",
    "/ask",
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p === "/" ? "" : p}` }));
}

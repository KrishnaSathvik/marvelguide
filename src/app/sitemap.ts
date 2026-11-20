import type { MetadataRoute } from "next";
import { getArtMap } from "@/lib/art";
import { doomPosterShots, posterPageCount, posterPageHref, posterShots } from "@/lib/posters";
import { GUIDE_STEPS, MCU_GROUPS } from "@/lib/routes";
import { SITE } from "@/lib/seo";

/**
 * Every indexable page. Redirects (/guide, /mcu, /mcu/[group]) are omitted.
 * /ask stays reachable from the chat button and is left out on purpose.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posters = doomPosterShots(await getArtMap()).length + posterShots().length;
  const paths = [
    "/",
    ...GUIDE_STEPS.map((s) => `/guide/${s.slug}`),
    ...MCU_GROUPS.flatMap((g) => g.chapters.map((c) => `/mcu/${g.slug}/${c.slug}`)),
    ...Array.from({ length: posterPageCount(posters) }, (_, i) => posterPageHref(i + 1)),
    "/news",
    "/faq",
    "/links",
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p === "/" ? "" : p}` }));
}

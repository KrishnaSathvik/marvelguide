import type { Metadata } from "next";

export const SITE = {
  name: "Marvel Guide",
  // Production host is www (marvelguide.app 308-redirects here in Vercel → Domains).
  url: "https://www.marvelguide.app",
  tagline: "Avengers: Doomsday watch guide & MCU explained",
};

const OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: `${SITE.name}: ${SITE.tagline}` };

/**
 * Full metadata for one page: title, description, canonical URL, Open Graph and Twitter tags.
 * Next merges metadata shallowly (a page's `openGraph` replaces the layout's), so every page builds the
 * complete set here instead of relying on the layout, including the share image (app/opengraph-image.png).
 */
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const ogTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE.name, locale: "en_US", url: path, title: ogTitle, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [OG_IMAGE.url] },
  };
}

/** Absolute www URL for a site path. The layout title template adds " · Marvel Guide"; callers must not. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path === "/" ? "" : path}`;
}

/** JSON-LD for a script tag. Escapes `<` so the payload cannot close the script. */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

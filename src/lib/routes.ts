import GROUPS from "@data/site/GROUPS.json";

/** Header tabs. `short` is used on tablets/phones so the header never wraps. */
export const TABS = [
  { href: "/", label: "Home", homeOnly: true },
  { href: "/guide", label: "Doomsday Guide", short: "Guide" },
  { href: "/mcu", label: "MCU Explained", short: "MCU" },
  { href: "/news", label: "News" },
  { href: "/faq", label: "FAQ" },
  { href: "/links", label: "Links" },
] as const;

export const GUIDE_STEPS = [
  { slug: "story", legacyId: "story", label: "Story", title: "The story so far" },
  { slug: "watch", legacyId: "watch", label: "Watch", title: "What to watch" },
  { slug: "universes", legacyId: "universes", label: "Universes", title: "The 3 universes" },
  { slug: "characters", legacyId: "roster", label: "Characters", title: "The characters" },
] as const;

export type GuideStep = (typeof GUIDE_STEPS)[number];

/** Legacy group id → URL slug. */
const GROUP_SLUG: Record<string, string> = {
  "g-basics": "basics",
  "g-infinity": "infinity-saga",
  "g-characters": "characters",
  "g-multiverse": "multiverse",
  "g-toolkit": "toolkit",
};

/** Legacy chapter id (e-*) → URL slug. */
const CHAPTER_SLUG: Record<string, string> = {
  "e-mcu": "what-is-the-mcu",
  "e-phases": "phases",
  "e-films": "films",
  "e-series": "series",
  "e-stones": "infinity-stones",
  "e-infinity": "snap-and-blip",
  "e-heroes": "directory",
  "e-villains": "villains",
  "e-teams": "teams",
  "e-power": "power-scale",
  "e-tva": "tva",
  "e-multiverse": "multiverse",
  "e-time": "time-travel",
  "e-tech": "tech",
  "e-map": "connection-map",
  "e-orders": "watch-orders",
  "e-road": "road-to-doomsday",
};

export type McuChapter = { slug: string; legacyId: string; title: string };
export type McuGroup = {
  slug: string;
  legacyId: string;
  title: string;
  icon: string;
  description: string;
  chapters: McuChapter[];
};

export const MCU_GROUPS: McuGroup[] = GROUPS.map((g) => ({
  slug: GROUP_SLUG[g.id],
  legacyId: g.id,
  title: g.n,
  icon: g.i,
  description: g.d,
  chapters: (g.ch as [string, string][]).map(([id, title]) => ({
    slug: CHAPTER_SLUG[id],
    legacyId: id,
    title,
  })),
}));

export const findGroup = (slug: string) => MCU_GROUPS.find((g) => g.slug === slug);
export const findStep = (slug: string) => GUIDE_STEPS.find((s) => s.slug === slug);

/**
 * Old single-page hash links (#watch, #g-basics, #e-films …) → new URLs.
 * Hashes never reach the server, so <HashRedirect/> applies this on the client.
 * `null` = recognised but intentionally not redirected (just drop the hash).
 */
export function legacyHashTarget(hash: string): string | null | undefined {
  const id = hash.replace(/^#/, "");
  if (!id) return undefined;
  const fixed: Record<string, string | null> = {
    home: "/",
    hero: "/",
    guide: "/guide",
    "guide-top": "/guide",
    encyclopedia: "/mcu",
    news: "/news",
    faq: "/faq",
    links: "/links",
    official: "/links",
    edit: null,
  };
  if (id in fixed) return fixed[id];
  const step = GUIDE_STEPS.find((s) => s.legacyId === id);
  if (step) return `/guide/${step.slug}`;
  for (const g of MCU_GROUPS) {
    if (g.legacyId === id) return `/mcu/${g.slug}`;
    const ch = g.chapters.find((c) => c.legacyId === id);
    if (ch) return `/mcu/${g.slug}/${ch.slug}`;
  }
  if (id.startsWith("film-")) return `/mcu/basics/films#${id}`;
  if (id.startsWith("series-")) return `/mcu/basics/series#${id}`;
  if (id.startsWith("news-")) return `/news#${id}`;
  return undefined;
}

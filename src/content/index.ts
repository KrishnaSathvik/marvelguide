/**
 * Typed access to data/site/*.json (the single content source, extracted from legacy/index.html).
 * Pages and, later, the chatbot's site-knowledge both read from here.
 */
import CH_ from "@data/site/CH.json";
import COLLIDE_ from "@data/site/COLLIDE.json";
import C_ from "@data/site/C.json";
import CAST_ from "@data/site/CAST.json";
import DPLINK_ from "@data/site/DPLINK.json";
import DPLUS_ from "@data/site/DPLUS.json";
import LANE_ from "@data/site/LANE.json";
import OFFICIAL_ from "@data/site/OFFICIAL.json";
import STORY_ from "@data/site/STORY.json";
import TEAMS_ from "@data/site/TEAMS.json";
import TRACKS_ from "@data/site/TRACKS.json";
import UNIS_ from "@data/site/UNIS.json";
import WATCH_ from "@data/site/WATCH.json";

export type ColorKey = keyof typeof C_;
export const C = C_ as Record<ColorKey, string>;

export const DPLUS = DPLUS_ as string;
export const DPLINK = DPLINK_ as Record<string, string>;
/** Disney+ title page for a film/series id, or the Marvel brand page as fallback. */
export const dpl = (id: string) =>
  DPLINK[id] ? `https://www.disneyplus.com/browse/entity-${DPLINK[id]}` : DPLUS;

export const CAST = CAST_ as Record<string, string[]>;

/* ---------- Guide ---------- */
export type StoryChapter = { y: string; h: string; w: string; i: string; what: string; why: string; lead: string };
export const STORY = STORY_ as StoryChapter[];

export type LaneKey = "gold" | "purple" | "blue" | "orange" | "green";
export type WatchItem = {
  id: string;
  n: string;
  y: number;
  t: string;
  m: number | null;
  lane: LaneKey;
  why: string;
  ch: string[];
  link?: string;
  lt?: string;
};
export const WATCH = WATCH_ as WatchItem[];
export const OFFICIAL = OFFICIAL_ as string[];
export const LANE = LANE_ as Record<LaneKey, string>;
export type TrackKey = "weekend" | "official" | "deep";
export const TRACKS = TRACKS_ as Record<TrackKey, { ids: string[]; d: string }>;

export type Universe = {
  k: string;
  c: ColorKey;
  code: string;
  tag: string;
  h: string;
  seen: string;
  what: string;
  who: string;
  now: string;
};
export const UNIS = UNIS_ as Universe[];
export const COLLIDE = COLLIDE_ as { h: string; t: string; p: string }[];

export type Team = { k: string; n: string; c: string };
export const TEAMS = TEAMS_ as Team[];
export type RosterCard = {
  id: string;
  n: string;
  a: string;
  tm: string;
  meet: string;
  l: string;
  lp?: number;
  s?: string;
  rm?: number;
};
export const CH = CH_ as RosterCard[];

/* ---------- MCU Explained ---------- */
import DIR_ from "@data/site/DIR.json";
import DIRT_ from "@data/site/DIRT.json";
import EARTHS_ from "@data/site/EARTHS.json";
import EIGHT_ from "@data/site/EIGHT.json";
import ENC_ from "@data/site/ENC.json";
import FILMS_ from "@data/site/FILMS.json";
import FINFO_ from "@data/site/FINFO.json";
import ORDERS_ from "@data/site/ORDERS.json";
import SERIES_ from "@data/site/SERIES.json";
import TEAMS_E_ from "@data/site/TEAMS_E.json";
import TIERS_ from "@data/site/TIERS.json";
import VILLAINS_ from "@data/site/VILLAINS.json";
import VROWS_ from "@data/site/VROWS.json";

/** Same as legacy `slug()`. */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Encyclopedia row: image + badge + titled text blocks (legacy `erow`). */
export type EncRow = {
  id: string;
  badge: string;
  tag?: string;
  title: string;
  sub?: string;
  blocks: [string, string][];
  lead?: [string, string];
  swatch?: string;
};
export const ENC = ENC_ as unknown as Record<string, EncRow[]>;
export const VROWS = VROWS_ as unknown as EncRow[];

export type Film = { id: string; n: string; y: number; ph: number; star: boolean; up: boolean };
export const FILMS = FILMS_ as Film[];
/** Film descriptions. FINFO's first field is a dead legacy rating and is never exposed. */
export const FILM_DESC: Record<string, string> = Object.fromEntries(
  Object.entries(FINFO_ as Record<string, string[]>).map(([k, v]) => [k, v[1]]),
);

/** Series. Legacy `r` mixed old ratings with "spc" (special); only the special flag survives. */
export type Series = { id: string; n: string; y: string; p: string; special: boolean; animated: boolean };
const ANIMATED = new Set([
  "I Am Groot",
  "What If…?",
  "X-Men '97",
  "Your Friendly Neighborhood Spider-Man",
  "Eyes of Wakanda",
  "Marvel Zombies",
]);
export const SERIES: Series[] = (SERIES_ as { id: string; n: string; y: string; p: string; r: string }[]).map((s) => ({
  id: s.id,
  n: s.n,
  y: s.y,
  p: s.p,
  special: s.r === "spc",
  animated: ANIMATED.has(s.n),
}));

export type DirChar = { n: string; r: string; a: string; m: string; p: string; t: string; d: string; s: string };
export const DIR = DIR_ as DirChar[];
export const DIRT = DIRT_ as Record<string, string>;

export const VILLAINS = VILLAINS_ as { id: string; n: string; p: string; sc: "universal" | "cosmic" | "global" | "street"; w: number }[];
export const TEAMS_E = TEAMS_E_ as { id: string; n: string; e: string; c: string; p: string; m: string; tg: string }[];
export const TIERS = TIERS_ as [string, string, string, string[]][];
export const EARTHS = EARTHS_ as { id: string; n: string; t: string; p: string; c: string; tg: string }[];
export const ORDERS = ORDERS_ as { id: string; n: string; s: string; c: string; p: string }[];
export const EIGHT = EIGHT_ as { id: string; n: string; p: string; tg: string }[];

/* ---------- News, FAQ, Links ---------- */
import FAQ_ from "@data/site/FAQ.json";
import LINKS_ from "@data/site/LINKS.json";
import NEWS_ from "@data/site/NEWS.json";

/** A paragraph, or a labelled paragraph with an optional certainty tag ("What it means: … [Theory]"). */
export type NewsPara = string | { label: string; text: string; tag?: string };
export type NewsItem = {
  id: string;
  section: "latest" | "visionquest" | "rumors";
  /** Dateline label, e.g. "The Hollywood Reporter" or "Release plan". Cards carry no dates (owner's call). */
  source: string;
  tag: "Official" | "Canon" | "Report" | "Unconfirmed" | "Rumor";
  title: string;
  body: NewsPara[];
  spoiler?: NewsPara[];
  spoilerList?: string[];
  big?: boolean;
  links: { name: string; url: string }[];
};
export const NEWS = NEWS_ as NewsItem[];

export type FaqItem = { g: string; q: string; a: string; sp?: number | boolean };
export const FAQ = FAQ_ as FaqItem[];
export const LINKS = LINKS_ as { i: string; k: string; b: string; s: string; u: string }[];

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

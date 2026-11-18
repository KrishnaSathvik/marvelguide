/**
 * Global search index, built from the content modules (same entries as the legacy `add(...)` calls).
 * Each entry points at a real page plus the element id to scroll to.
 */
import {
  CAST,
  CH,
  DIR,
  DIRT,
  EARTHS,
  EIGHT,
  ENC,
  FAQ,
  FILMS,
  LINKS,
  ORDERS,
  SERIES,
  slug,
  STORY,
  TEAMS,
  TEAMS_E,
  TIERS,
  UNIS,
  VILLAINS,
  VROWS,
  WATCH,
} from "@/content";
import { MCU_GROUPS } from "./routes";

export type SearchItem = {
  type: string;
  title: string;
  text: string;
  /** Page path, without hash. */
  path: string;
  /** Element id on that page (omit to land at the top). */
  target?: string;
  icon: string;
};

/** MCU chapter id → group page that contains it. */
const GROUP_OF: Record<string, string> = Object.fromEntries(
  MCU_GROUPS.flatMap((g) => g.chapters.map((c) => [c.legacyId, `/mcu/${g.slug}`])),
);
const mcu = (chapter: string) => GROUP_OF[chapter];

const ETYPE: Record<string, [string, string, string]> = {
  // ENC key: [type, icon, chapter]
  "e-mcu": ["Topic", "compass", "e-mcu"],
  "e-phases": ["Phase", "layers", "e-phases"],
  "e-stones": ["Infinity Stone", "gem", "e-stones"],
  "e-infinity": ["Event", "zap", "e-infinity"],
  "e-tva": ["Term", "git-branch", "e-tva"],
  "e-multiverse-rows": ["Term", "orbit", "e-multiverse"],
  "e-time": ["Term", "hourglass", "e-time"],
  "e-tech": ["Tech", "cpu", "e-tech"],
};

const teamName = Object.fromEntries(TEAMS.map((t) => [t.k, t.n]));

function build(): SearchItem[] {
  const out: SearchItem[] = [];
  const add = (type: string, title: string, text: string, path: string, target: string | undefined, icon: string) =>
    out.push({ type, title, text, path, target, icon });

  /* Guide */
  STORY.forEach((s, i) => add("Story", s.h, `${s.y} · ${s.w} — ${s.what}`, "/guide/story", `story-${i + 1}`, "book-open"));
  WATCH.forEach((x) => add("Watch list", x.n, `${x.y} · ${x.t} — ${x.why}`, "/guide/watch", `watch-${x.id}`, "monitor-play"));
  UNIS.forEach((u) => add("Universe", `${u.code} — ${u.tag}`, u.what, "/guide/universes", `uni-${u.k}`, "orbit"));
  add("Universe", "How the universes collide", "Incursions, the open multiverse and who has crossed over", "/guide/universes", "collide-box", "orbit");
  add("Character", "Doctor Doom", "Robert Downey Jr. · Victor von Doom, the villain of Avengers: Doomsday", "/guide/characters", "char-doom", "crown");
  CH.forEach((h) =>
    add(
      "Character",
      h.n,
      `${h.rm ? "Rumored · " : ""}${h.a}${h.s ? " · " + h.s : ""} · ${teamName[h.tm]} · Meet them in ${h.meet}`,
      "/guide/characters",
      `char-${h.id}`,
      "users",
    ),
  );
  add("Section", "The watch list", "Weekend sprint, official Disney+ 15, deep cuts", "/guide/watch", undefined, "monitor-play");
  add("Section", "Who's colliding — three universes", "Earth-616, Earth-828, Earth-10005", "/guide/universes", undefined, "orbit");
  add("Section", "Confirmed roster", "Every confirmed Doomsday cast member", "/guide/characters", undefined, "users");

  /* FAQ & links */
  FAQ.forEach((q, i) => add("FAQ", q.q, q.sp ? "Spoiler answer — open to reveal" : q.a, "/faq", `faq-${i + 1}`, "circle-help"));
  LINKS.forEach((l, i) => add("Official link", l.b, `${l.k} — ${l.s}`, "/links", `link-${i}`, "external-link"));

  /* MCU Explained */
  Object.entries(ENC).forEach(([k, list]) => {
    const [type, icon, chapter] = ETYPE[k];
    list.forEach((r) =>
      add(type, r.title, (r.sub ? r.sub + " — " : "") + r.blocks.map((b) => b[1]).join(" "), mcu(chapter), r.id, icon),
    );
  });
  VROWS.forEach((r) => add("Villain", r.title, `${r.sub} — ${r.blocks.map((b) => b[1]).join(" ")}`, mcu("e-villains"), r.id, "skull"));
  DIR.forEach((c) => add("Character", c.n, `${c.r} · ${c.a} · ${DIRT[c.t]} — ${c.d}`, mcu("e-heroes"), `dir-${slug(c.n)}`, "users"));
  MCU_GROUPS.forEach((g) => add("Encyclopedia part", `MCU Explained: ${g.title}`, g.description, `/mcu/${g.slug}`, undefined, g.icon));
  FILMS.forEach((f) =>
    add(
      "Film",
      f.n,
      `${f.y} · Phase ${f.ph}${f.up ? " · Upcoming" : ""}${f.star ? " · Saga milestone" : ""}${CAST[f.id] ? " · " + CAST[f.id].join(", ") : ""}`,
      mcu("e-films"),
      f.id,
      "film",
    ),
  );
  SERIES.forEach((s) => add("Series", s.n, `${s.y} — ${s.p}`, mcu("e-series"), s.id, "tv"));
  VILLAINS.forEach((v) => add("Villain", v.n, `${v.p} · ${v.sc} threat`, mcu("e-villains"), v.id, "skull"));
  TEAMS_E.forEach((t) => add("Team", t.n, `${t.e} — ${t.p} Members: ${t.m}`, mcu("e-teams"), t.id, "shield"));
  EARTHS.forEach((e) => add("Universe", `${/^\d/.test(e.n) ? "Earth-" + e.n : e.n} — ${e.t}`, e.p, mcu("e-multiverse"), e.id, "globe"));
  TIERS.forEach((t, i) => add("Power tier", `${t[0]} (${t[1]})`, t[3].join(", "), mcu("e-power"), `tier-${6 - i}`, "gauge"));
  add(
    "Diagram",
    "Connection map",
    "Iron Man → The Avengers → Thanos → Time Heist → The Multiverse → Doomsday, across the Infinity and Multiverse Sagas",
    mcu("e-map"),
    "cmap",
    "network",
  );
  add("Diagram", "The Sacred Timeline", "Before, Loki's break, and the branching multiverse", mcu("e-tva"), "tsvg", "git-branch");
  ORDERS.forEach((o) => add("Watch order", o.n, `${o.s} — ${o.p}`, mcu("e-orders"), o.id, "route"));
  EIGHT.forEach((e) => add("Doomsday checklist", e.n, e.p, mcu("e-road"), e.id, "list-checks"));
  add("Topic", "Avengers: Doomsday & Secret Wars", "The two-film finale: Dec 18, 2026 and Dec 17, 2027", mcu("e-road"), "e-finale", "layers");
  add("Feature", "Tony Stark", "Iron Man — the man who started it all, 2008–2019; RDJ returns as Doom", mcu("e-road"), "e-tony", "star");

  /* News (hand-written keywords, as in legacy) */
  const news = (title: string, text: string, target: string, icon: string, type = "Latest") =>
    add(type, title, text, "/news", target, icon);
  news("Runtime: about 2½ hours (149 min reported)", "Omelete report, Infinity Vision edition extra scene, how long is Doomsday", "news-runtime", "clock");
  news("Release: Dec 16 internationally, Dec 18 US", "international release date, world tour, LA premiere, previews", "news-release", "calendar");
  news("Feige: the Avengers are back together", "Empire interview, Sam Wilson leads the team, Captain America", "news-feige", "users");
  news("The Hulk is in Doomsday", "Mark Ruffalo, Bruce Banner, Hollywood Reporter", "news-hulk", "zap");
  news("Endgame: Encore now on Disney+", "Nov 13, new scenes, post-credits scene, Loki, Owen Wilson", "news-encore", "tv");
  news("Box office: eyeing a $1B+ opening", "presales, tracking, record opening weekend", "news-boxoffice", "zap");
  news(
    "VisionQuest finale post-credits scene (spoiler)",
    "Episode 8 “Forever” (Nov 10, 2026) — the scene that sets up Avengers: Doomsday. Wanda, Doctor Doom, Scarlet Witch",
    "news-wanda",
    "zap",
  );
  news("How VisionQuest ended (recap)", "Ultron, Jocasta, The Client, Tommy, Billy, Vision revived, Ultron post-credits", "news-finale", "tv");
  news("Thor yellow lightning / Odinforce billboard", "Shanghai Doomsday billboard; Steve holds Mjolnir", "rumor-thor", "zap", "Rumor");
  news("Anthony Mackie name-drops Paul Bettany", "Vision in Doomsday?", "rumor-vision", "zap", "Rumor");
  news("Stitch Cosbi toys: Scarlet Witch, Thanos, Ghost Rider", "Hot Toys Doomsday collectibles", "rumor-stitch", "zap", "Rumor");

  return out;
}

export const SEARCH_INDEX = build();

/** Filter chips → item types (legacy GROUPS_S). */
export const SEARCH_GROUPS: Record<string, string[] | null> = {
  All: null,
  "Films & shows": ["Film", "Series", "Watch list", "Watch order", "Phase"],
  People: ["Character", "Hero", "Villain", "Team"],
  Lore: ["Term", "Universe", "Infinity Stone", "Tech", "Power tier", "Event", "Topic", "Time-travel rule", "Story", "Diagram", "Encyclopedia part"],
  News: ["Latest", "Rumor"],
};

/** Short type label shown on each result (legacy LABEL). */
export const typeLabel = (t: string) =>
  (
    ({
      Latest: "News",
      "Encyclopedia part": "Guide",
      Section: "Guide",
      "Official link": "Link",
      "Doomsday checklist": "Guide",
      Feature: "Guide",
      "Time-travel rule": "Lore",
      "Infinity Stone": "Stone",
      "Power tier": "Power",
    }) as Record<string, string>
  )[t] ?? t;

"use client";

import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { C, DIR, DIRT, slug } from "@/content";
import { useSearchReveal } from "@/lib/search-events";

const TEAMS = Object.keys(DIRT);

/** Each name opens that character's own page on Marvel.com. */
const MARVEL: Record<string, string> = {
  "Iron Man": "https://www.marvel.com/characters/iron-man-tony-stark",
  "Captain America": "https://www.marvel.com/characters/captain-america-steve-rogers",
  Thor: "https://www.marvel.com/characters/thor-thor-odinson",
  Hulk: "https://www.marvel.com/characters/hulk-bruce-banner",
  "Black Widow": "https://www.marvel.com/characters/black-widow-natasha-romanoff",
  Hawkeye: "https://www.marvel.com/characters/hawkeye-clint-barton",
  "War Machine": "https://www.marvel.com/characters/war-machine-james-rhodes",
  Vision: "https://www.marvel.com/characters/vision",
  "Scarlet Witch": "https://www.marvel.com/characters/scarlet-witch-wanda-maximoff",
  "Ant-Man": "https://www.marvel.com/characters/ant-man-scott-lang",
  "The Wasp": "https://www.marvel.com/characters/hope-van-dyne",
  "Cassie Lang": "https://www.marvel.com/characters/cassie-lang",
  "Falcon / Captain America": "https://www.marvel.com/characters/sam-wilson",
  Falcon: "https://www.marvel.com/characters/joaquin-torres",
  "Captain Marvel": "https://www.marvel.com/characters/captain-marvel-carol-danvers",
  "Doctor Strange": "https://www.marvel.com/characters/doctor-strange-stephen-strange",
  "Spider-Man": "https://www.marvel.com/characters/spider-man-peter-parker",
  "Shang-Chi": "https://www.marvel.com/characters/shang-chi",
  "Nick Fury": "https://www.marvel.com/characters/nick-fury",
  "Peggy Carter": "https://www.marvel.com/characters/peggy-carter",
  "Winter Soldier": "https://www.marvel.com/characters/winter-soldier-bucky-barnes",
  "Phil Coulson": "https://www.marvel.com/characters/phil-coulson",
  "Maria Hill": "https://www.marvel.com/characters/maria-hill",
  Wong: "https://www.marvel.com/characters/wong",
  "Monica Rambeau": "https://www.marvel.com/characters/monica-rambeau",
  Valkyrie: "https://www.marvel.com/characters/valkyrie",
  "Black Panther (T'Challa)": "https://www.marvel.com/characters/black-panther-t-challa",
  "Black Panther (Shuri)": "https://www.marvel.com/characters/shuri",
  Okoye: "https://www.marvel.com/characters/okoye",
  "M'Baku": "https://www.marvel.com/characters/mbaku",
  Namor: "https://www.marvel.com/characters/namor",
  Namora: "https://www.marvel.com/characters/namora",
  Attuma: "https://www.marvel.com/characters/attuma",
  Ironheart: "https://www.marvel.com/characters/ironheart-riri-williams",
  "Star-Lord": "https://www.marvel.com/characters/star-lord-peter-quill",
  Gamora: "https://www.marvel.com/characters/gamora",
  Rocket: "https://www.marvel.com/characters/rocket",
  Groot: "https://www.marvel.com/characters/groot",
  Drax: "https://www.marvel.com/characters/drax",
  Nebula: "https://www.marvel.com/characters/nebula",
  Mantis: "https://www.marvel.com/characters/mantis",
  "Adam Warlock": "https://www.marvel.com/characters/adam-warlock",
  Daredevil: "https://www.marvel.com/characters/daredevil-matthew-murdock",
  "The Punisher": "https://www.marvel.com/characters/punisher-frank-castle",
  "Jessica Jones": "https://www.marvel.com/characters/jessica-jones",
  "Moon Knight": "https://www.marvel.com/characters/moon-knight-marc-spector",
  "She-Hulk": "https://www.marvel.com/characters/she-hulk-jennifer-walters",
  Echo: "https://www.marvel.com/characters/echo-maya-lopez",
  "Wonder Man": "https://www.marvel.com/characters/wonder-man-simon-williams",
  "Hawkeye (Kate Bishop)": "https://www.marvel.com/characters/hawkeye-kate-bishop",
  "Ms. Marvel": "https://www.marvel.com/characters/ms-marvel-kamala-khan",
  "America Chavez": "https://www.marvel.com/characters/miss-america-america-chavez",
  Wiccan: "https://www.marvel.com/characters/wiccan",
  "Yelena Belova": "https://www.marvel.com/characters/yelena-belova",
  "Red Guardian": "https://www.marvel.com/characters/red-guardian-alexei-shostakov",
  "U.S. Agent": "https://www.marvel.com/characters/us-agent-john-walker",
  Sentry: "https://www.marvel.com/characters/sentry-robert-reynolds",
  Loki: "https://www.marvel.com/characters/loki",
  Sylvie: "https://www.marvel.com/characters/sylvie",
  Mobius: "https://www.marvel.com/characters/agent-mobius",
  "Hunter B-15": "https://www.marvel.com/characters/hunter-b-15",
  "Mister Fantastic": "https://www.marvel.com/characters/mister-fantastic",
  "Invisible Woman": "https://www.marvel.com/characters/invisible-woman",
  "Human Torch": "https://www.marvel.com/characters/human-torch-johnny-storm",
  "The Thing": "https://www.marvel.com/characters/the-thing-benjamin-grimm",
  "Franklin Richards": "https://www.marvel.com/characters/franklin-richards",
  "Silver Surfer": "https://www.marvel.com/characters/silver-surfer",
  "Professor X": "https://www.marvel.com/characters/professor-x",
  Magneto: "https://www.marvel.com/characters/magneto-max-eisenhardt",
  Cyclops: "https://www.marvel.com/characters/cyclops-scott-summers",
  Mystique: "https://www.marvel.com/characters/mystique",
  Nightcrawler: "https://www.marvel.com/characters/nightcrawler",
  Beast: "https://www.marvel.com/characters/beast-henry-mccoy",
  Gambit: "https://www.marvel.com/characters/gambit",
  Wolverine: "https://www.marvel.com/characters/wolverine-logan",
  Deadpool: "https://www.marvel.com/characters/deadpool-wade-wilson",
};
/** Desktop shows four rows of five, the same count as a poster page. */
const PAGE_SIZE = 20;
const DESKTOP = "(min-width: 1101px)";

const statusClass = (s: string) =>
  /Died/.test(s) ? "dead" : /Rumored/.test(s) ? "rm" : /Set up/.test(s) ? "tz" : /Doomsday/.test(s) ? "dd" : "";

function pagerItems(page: number, pages: number): (number | "gap")[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const wanted = new Set<number>([1, pages, page]);
  if (page <= 2) {
    wanted.add(2);
    wanted.add(3);
  } else if (page >= pages - 1) {
    wanted.add(pages - 2);
    wanted.add(pages - 1);
  } else {
    wanted.add(page - 1);
    wanted.add(page + 1);
  }
  const sorted = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  for (const n of sorted) {
    const prev = items[items.length - 1];
    if (typeof prev === "number" && n - prev > 1) items.push("gap");
    items.push(n);
  }
  return items;
}

/** Character directory: search by name/role/actor/first appearance, filter by team. */
export function Directory() {
  const [t, setT] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [desktop, setDesktop] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = matchMedia(DESKTOP);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useSearchReveal("dir-", (target) => {
    setT("all");
    setQ("");
    const i = DIR.findIndex((c) => `dir-${slug(c.n)}` === target);
    setPage(i >= 0 ? Math.floor(i / PAGE_SIZE) + 1 : 1);
  });
  const needle = q.trim().toLowerCase();
  const matches = DIR.filter(
    (c) => (t === "all" || c.t === t) && (!needle || `${c.n} ${c.r} ${c.a} ${c.m}`.toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = desktop ? matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) : matches;
  const go = (next: number) => {
    setPage(next);
    grid.current?.scrollIntoView({ block: "start" });
  };
  return (
    <>
      <div className="ftools rv">
        <label className="finput">
          <Icon name="filter" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Find a character or actor… e.g. Shuri, Pedro Pascal"
            aria-label="Find a character or actor"
          />
        </label>
        <div className="fbar" style={{ marginTop: 0 }} role="group" aria-label="Filter by team">
          {[["all", `All (${DIR.length})`] as const, ...TEAMS.map((k) => [k, DIRT[k]] as const)].map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={t === k ? "fchip on" : "fchip"}
              aria-pressed={t === k}
              onClick={() => {
                setT(k);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {desktop && matches.length > 0 && (
        <p className="poster-note">
          {shown.length === matches.length
            ? `${matches.length} characters`
            : `${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, matches.length)} of ${matches.length}`}
        </p>
      )}
      <div className="dgrid" ref={grid}>
        {shown.map((c) => (
          <article key={c.n} className="dc rv" id={`dir-${slug(c.n)}`}>
            <Art
              artKey={`dir-${slug(c.n)}`}
              alt={c.r !== c.n ? `${c.n} (${c.r})` : c.n}
              label="Character art"
              icon="users"
              color={C.red}
              sizes="(max-width: 640px) 50vw, 20vw"
            />
            <div className="dtx">
              <span className="dteam">{DIRT[c.t]}</span>
              <h4>
                {MARVEL[c.n] ? (
                  <a href={MARVEL[c.n]} target="_blank" rel="noopener noreferrer">
                    {c.n}
                  </a>
                ) : (
                  c.n
                )}
              </h4>
              <div className="sub">
                {c.r !== c.n ? c.r + " · " : ""}
                {c.a}
              </div>
              <p>{c.d}</p>
              <div className="meet">
                <Icon name="film" />
                <span>Meet them in: {c.m}</span>
              </div>
              {c.s && <span className={`dstat ${statusClass(c.s)}`.trim()}>{c.s}</span>}
            </div>
          </article>
        ))}
      </div>
      {matches.length === 0 && <p className="empty">No characters match that search.</p>}
      {desktop && pages > 1 && (
        <nav className="poster-pages" aria-label="Character pages">
          <button type="button" className="poster-prev" onClick={() => go(current - 1)} disabled={current === 1} aria-label="Previous page">
            <Icon name="arrow-right" />
          </button>
          {pagerItems(current, pages).map((item, i) =>
            item === "gap" ? (
              <span key={`gap-${i}`} className="gap">
                …
              </span>
            ) : (
              <button key={item} type="button" className="n" aria-current={item === current ? "page" : undefined} onClick={() => go(item)}>
                {item}
              </button>
            ),
          )}
          <button type="button" onClick={() => go(current + 1)} disabled={current === pages} aria-label="Next page">
            <Icon name="arrow-right" />
          </button>
        </nav>
      )}
    </>
  );
}

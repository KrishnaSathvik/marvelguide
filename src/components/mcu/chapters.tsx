import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Lead, Row, Tag } from "@/components/ui";
import {
  C,
  EARTHS,
  EIGHT,
  ENC,
  ORDERS,
  slug,
  TEAMS_E,
  TIERS,
  VILLAINS,
  VROWS,
  type EncRow,
} from "@/content";
import { ConnectionMap, SacredTimeline } from "./Diagrams";
import { Directory } from "./Directory";
import { FilmsGrid } from "./FilmsGrid";
import { SeriesGrid } from "./SeriesGrid";

/** Encyclopedia rows (legacy `rowsH` / `erow`). */
function EncRows({ rows }: { rows: EncRow[] }) {
  return (
    <div className="chaps">
      {rows.map((r, i) => (
        <Row
          key={r.id}
          id={r.id}
          index={i}
          className="erow"
          media={
            <>
              <Art artKey={`enc-${r.id}`} alt={r.sub ? `${r.title}: ${r.sub}` : r.title} label="Scene still" icon="film" color={C.red} />
              {r.swatch && <span className="swatch" style={{ background: r.swatch }} />}
              <span className="cyr">{r.badge}</span>
            </>
          }
        >
          <div className="etop">
            <h3>{r.title}</h3>
            <Tag t={r.tag} />
          </div>
          {r.sub && (
            <span className="w">
              <Icon name="film" />
              {r.sub}
            </span>
          )}
          {r.blocks.map(([h, p]) => (
            <Fragment key={h}>
              <h5>{h}</h5>
              <p>{p}</p>
            </Fragment>
          ))}
          {r.lead && <Lead title={r.lead[0]}>{r.lead[1]}</Lead>}
        </Row>
      ))}
    </div>
  );
}

function Why({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="why rv">
      <b>{label}</b>
      {children}
    </div>
  );
}

const SCALE = { universal: C.red, cosmic: C.purple, global: C.orange, street: C.blue };

function Villains() {
  return (
    <>
      <EncRows rows={VROWS} />
      <h3 className="h3 rv" style={{ marginTop: 46 }}>
        <small>Editorial ranking</small>The threat index
      </h3>
      <div className="legend rv">
        <span>
          <i style={{ background: C.red }} />
          Universal
        </span>
        <span>
          <i style={{ background: C.purple }} />
          Cosmic
        </span>
        <span>
          <i style={{ background: C.orange }} />
          Global
        </span>
        <span>
          <i style={{ background: C.blue }} />
          Street / personal
        </span>
        <span>
          <Tag t="edit" />
        </span>
      </div>
      <div className="vlist">
        {VILLAINS.map((v, i) => (
          <div key={v.id} className="vrow rv" id={v.id}>
            <span className="rk">{i + 1}</span>
            <div>
              <b>{v.n}</b>
              <small>{v.p}</small>
            </div>
            <div className="vbar">
              <i style={{ "--w": `${v.w}%`, background: SCALE[v.sc] } as CSSProperties} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Teams() {
  return (
    <>
      <div className="grid g3">
        {TEAMS_E.map((t) => (
          <div key={t.id} className="box rv team-card team2" id={t.id} style={{ borderTop: `10px solid ${t.c}` }}>
            <Art artKey={`teamimg-${slug(t.n)}`} alt={t.n} label="Team" icon="users" color={t.c} sizes="(max-width: 640px) 100vw, 33vw" />
            <div className="top">
              <h4>{t.n}</h4>
              <span className="est" style={{ background: t.c }}>
                {t.e}
              </span>
            </div>
            <p>{t.p}</p>
            <div className="mem">{t.m}</div>
            <div style={{ marginTop: 12 }}>
              <Tag t={t.tg} />
            </div>
          </div>
        ))}
      </div>
      <Why label="Also">The Defenders (Daredevil, Jessica Jones, Luke Cage, Iron Fist) operate at street level.</Why>
    </>
  );
}

function Power() {
  return (
    <>
      <div className="tiers">
        {TIERS.map(([name, sub, col, who], i) => (
          <div
            key={name}
            className="tier rv"
            id={`tier-${6 - i}`}
            style={{ "--tc": col, transitionDelay: `${i * 0.06}s` } as CSSProperties}
          >
            <div className="tl">
              <b>{name}</b>
              <small>{sub}</small>
            </div>
            <div className="who">
              {who.map((n) => (
                <span key={n} className="pill">
                  {n}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Why label="Editorial">Placement reflects feats shown on screen. Tiers overlap, and tech or artifacts can shift a matchup.</Why>
    </>
  );
}

function Multiverse() {
  return (
    <>
      <div className="grid g3">
        {EARTHS.map((e) => {
          const name = /^\d/.test(e.n) ? "Earth-" + e.n : e.n;
          return (
            <div key={e.id} className="box rv earth earth2" id={e.id} style={{ "--ec": e.c } as CSSProperties}>
              <Art artKey={`earthimg-${slug(e.n)}`} alt={`${name}: ${e.t}`} label="Universe" icon="globe" color={e.c} sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="top">
                <span className="num">{name}</span>
                <Tag t={e.tg} />
              </div>
              <h4 style={{ marginTop: 8 }}>{e.t}</h4>
              <p>{e.p}</p>
            </div>
          );
        })}
      </div>
      <EncRows rows={ENC["e-multiverse-rows"]} />
    </>
  );
}

const caption: CSSProperties = {
  marginTop: 14,
  fontFamily: "var(--label)",
  fontSize: 13,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--mute)",
};

function Orders() {
  return (
    <>
      <div className="grid g3">
        {ORDERS.map((o) => (
          <div key={o.id} className="box rv" id={o.id} style={{ borderTop: `10px solid ${o.c}` }}>
            <div className="top">
              <h4>{o.n}</h4>
              <span className="tag edit">{o.s}</span>
            </div>
            <p>{o.p}</p>
          </div>
        ))}
      </div>
      <Why label="Only have a weekend?">
        The Doomsday Guide&apos;s{" "}
        <Link href="/guide/watch" style={{ color: "var(--yellow)" }}>
          watch list
        </Link>{" "}
        has the five-title sprint and Disney+&apos;s official 15, with progress tracking.
      </Why>
    </>
  );
}

function Road() {
  return (
    <>
      <div className="chk8">
        {EIGHT.map((e, i) => (
          <div key={e.id} className="box rv" id={e.id}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="top">
                <h4>{e.n}</h4>
                <Tag t={e.tg} />
              </div>
              <p>{e.p}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="feature rv" id="e-finale">
        <Art artKey="feature-doom" alt="Doctor Doom" label="Doctor Doom key art" icon="crown" color={C.green} />
        <div className="tx">
          <span className="kicker" style={{ background: "var(--green)" }}>
            <Icon name="layers" />
            The two-film finale
          </span>
          <h4 style={{ marginTop: 12 }}>Avengers: Doomsday</h4>
          <p>
            <b>December 18, 2026.</b> The Avengers, the Fantastic Four and the X-Men against Doom.
          </p>
          <h4 style={{ marginTop: 18, fontSize: 30 }}>Avengers: Secret Wars</h4>
          <p>
            <b>December 17, 2027.</b> The finale of Phase Six and the entire Multiverse Saga.
          </p>
          <div className="stats3">
            <div>
              <b>3</b>
              <small>Universes</small>
            </div>
            <div>
              <b>30</b>
              <small>Cast confirmed</small>
            </div>
            <div>
              <b>~149</b>
              <small>Minutes*</small>
            </div>
          </div>
          <p style={{ fontSize: 12.5, marginTop: 8, color: "var(--mute)" }}>
            *Reported by Omelete in November (2h 29m 36s). Disney hasn&apos;t confirmed it.
          </p>
        </div>
      </div>
      <div className="feature rv" id="e-tony" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <div className="tx">
          <span className="kicker">
            <Icon name="star" />
            Feature · character spotlight
          </span>
          <h4 style={{ marginTop: 12 }}>Tony Stark</h4>
          <p>
            A billionaire arms dealer is kidnapped, has a change of heart and builds a suit to escape. Over the next
            decade he turns selfishness into sacrifice, from a suit hand-built from scrap in a cave to the nanotech Mark
            85.
          </p>
          <p>
            In Endgame, Tony snaps away Thanos and dies saving the universe. It&apos;s the emotional heart the whole MCU
            keeps returning to.
          </p>
          <p>
            How Doom connects to Stark, if he does at all, is still a secret. <Tag t="theory" />
          </p>
        </div>
        <Art artKey="feature-tony" alt="Tony Stark" label="Suit plate" icon="shield" color={C.red} />
      </div>
    </>
  );
}

/** Chapter header (small kicker + title) and optional intro, from legacy CHT / CHL. */
export const CHAPTER_META: Record<string, { kick: string; title: string; lede?: string }> = {
  "e-mcu": { kick: "The foundation", title: "What is the MCU?" },
  "e-phases": { kick: "The shape of the story", title: "Phases & sagas" },
  "e-films": {
    kick: "On film",
    title: "Every MCU film",
    lede: "Forty theatrical films across six phases, in release order. Filter by saga or phase.",
  },
  "e-series": {
    kick: "On Disney+",
    title: "The Disney+ series",
    lede: "Since 2021 the streaming shows have been part of the story, plus three one-off Special Presentations. Animated shows like What If…?, Marvel Zombies and Your Friendly Neighborhood Spider-Man take place in alternate realities.",
  },
  "e-stones": { kick: "The six singularities", title: "The Infinity Stones" },
  "e-infinity": { kick: "The climax", title: "Thanos, the Snap & the Blip" },
  "e-heroes": {
    kick: "Who's who",
    title: "Character directory",
    lede: "Seventy-seven heroes, allies and newcomers from all three universes. Filter by team or search by name or actor.",
  },
  "e-villains": {
    kick: "The big bads",
    title: "Villains",
    lede: "The villains who shaped each phase, what they wanted and how it ended, plus our ranking of how dangerous they are.",
  },
  "e-teams": {
    kick: "Who fights together",
    title: "The teams",
    lede: "No hero wins alone. These are the alliances that shape every crisis, and the Multiverse Saga is building toward all of them fighting side by side.",
  },
  "e-power": {
    kick: "Who would win",
    title: "Power scale",
    lede: "Who would actually win? From street-level fighters to cosmic beings who outrank gods, each tier can generally overpower everything below it.",
  },
  "e-tva": {
    kick: "How time works",
    title: "The TVA & the timelines",
    lede: "The rules of time that the Loki series set up, and that the whole Multiverse Saga runs on.",
  },
  "e-multiverse": { kick: "A map of realities", title: "The multiverse" },
  "e-time": { kick: "The rules of the road", title: "Time travel" },
  "e-tech": { kick: "The building blocks", title: "Tech & artifacts" },
  "e-map": {
    kick: "How it all connects",
    title: "Connection map",
    lede: "Everything links to everything. This diagram shows the MCU's story engine and the threads that tie the whole universe together.",
  },
  "e-orders": {
    kick: "Choose your path",
    title: "Watch orders",
    lede: "There's no wrong order, just the one that suits your time and goals.",
  },
  "e-road": {
    kick: "Your checklist",
    title: "Road to Doomsday",
    lede: "Six recent developments the rest of the encyclopedia doesn't cover.",
  },
};

/** Chapter bodies by legacy chapter id. */
export const CHAPTER_BODY: Record<string, () => ReactNode> = {
  "e-mcu": () => <EncRows rows={ENC["e-mcu"]} />,
  "e-phases": () => (
    <>
      <div className="sagas rv">
        <div>
          <b>The Infinity Saga</b>
          <span>Phases 1–3 · 2008–2019 · ends with Endgame</span>
        </div>
        <div>
          <b>The Multiverse Saga</b>
          <span>Phases 4–6 · 2021–2027 · ends with Secret Wars</span>
        </div>
      </div>
      <EncRows rows={ENC["e-phases"]} />
    </>
  ),
  "e-films": () => <FilmsGrid />,
  "e-series": () => <SeriesGrid />,
  "e-stones": () => <EncRows rows={ENC["e-stones"]} />,
  "e-infinity": () => <EncRows rows={ENC["e-infinity"]} />,
  "e-heroes": () => <Directory />,
  "e-villains": () => <Villains />,
  "e-teams": () => <Teams />,
  "e-power": () => <Power />,
  "e-tva": () => (
    <>
      <SacredTimeline />
      <EncRows rows={ENC["e-tva"]} />
    </>
  ),
  "e-multiverse": () => <Multiverse />,
  "e-time": () => <EncRows rows={ENC["e-time"]} />,
  "e-tech": () => <EncRows rows={ENC["e-tech"]} />,
  "e-map": () => (
    <>
      <ConnectionMap />
      <p className="rv" style={caption}>
        Read 1 → 6. Each event sets up the next: the Time Heist cracks time open, and that opens the door to the
        multiverse.
      </p>
    </>
  ),
  "e-orders": () => <Orders />,
  "e-road": () => <Road />,
};

/** One chapter block: header, optional intro and body (legacy `.echap`). */
export function Chapter({ id }: { id: string }) {
  const meta = CHAPTER_META[id];
  const Body = CHAPTER_BODY[id];
  return (
    <div className="echap" id={id}>
      <h2 className="eh rv">
        <small>{meta.kick}</small>
        {meta.title}
      </h2>
      {meta.lede && <p className="lede rv">{meta.lede}</p>}
      <Body />
    </div>
  );
}

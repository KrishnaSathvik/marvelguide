"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { C, CAST, LANE, OFFICIAL, TRACKS, WATCH, type TrackKey } from "@/content";

/* Same storage keys as the legacy site. */
const KEY = "rtd-v3";
const TRACK_KEY = KEY + "-t";

/* Tiny localStorage-backed store so React reads it without hydration mismatches. */
const listeners = new Set<() => void>();
const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* private mode etc. */
  }
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    removeEventListener("storage", l);
  };
};
const useStored = (k: string) => useSyncExternalStore(subscribe, () => read(k), () => null);

const TABS: { k: TrackKey; b: string; s: string }[] = [
  { k: "weekend", b: "Weekend sprint", s: "5 titles · ~11.5 hrs" },
  { k: "official", b: "Official Disney+ 15", s: "14 films + Loki · ~41 hrs" },
  { k: "deep", b: "Deep cuts", s: "6 fan-favorite extras" },
];

const byId = Object.fromEntries(WATCH.map((x) => [x.id, x]));
const fmt = (m: number) => {
  const h = Math.floor(m / 60),
    mm = m % 60;
  return h ? `${h}h ${String(mm).padStart(2, "0")}m` : `${mm}m`;
};

export function WatchList() {
  const rawDone = useStored(KEY);
  const rawTrack = useStored(TRACK_KEY);
  const done = useMemo<Record<string, 1>>(() => {
    try {
      return JSON.parse(rawDone || "{}") || {};
    } catch {
      return {};
    }
  }, [rawDone]);
  const track: TrackKey = rawTrack && rawTrack in TRACKS ? (rawTrack as TrackKey) : "weekend";
  const ids = TRACKS[track].ids;

  // Staggered card entrance, re-run when the track changes (legacy: 70ms per card).
  const [shown, setShown] = useState<{ track: TrackKey; n: number }>({ track, n: 0 });
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = ids.map((_, i) => setTimeout(() => setShown({ track, n: i + 1 }), reduce ? 0 : 70 * i));
    return () => timers.forEach(clearTimeout);
  }, [track, ids]);
  const visible = shown.track === track ? shown.n : 0;

  const setDone = (next: Record<string, 1>) => write(KEY, JSON.stringify(next));
  const toggle = (id: string) => {
    const next = { ...done };
    if (next[id]) delete next[id];
    else next[id] = 1;
    setDone(next);
  };
  const reset = () => {
    const next = { ...done };
    ids.forEach((i) => delete next[i]);
    setDone(next);
  };

  const n = ids.filter((i) => done[i]).length;
  const total = ids.reduce((a, i) => a + (byId[i].m || 0), 0);
  const left = ids.filter((i) => !done[i]).reduce((a, i) => a + (byId[i].m || 0), 0);

  return (
    <>
      <div className="tabs" id="tabs" role="tablist" aria-label="Watch lists">
        {TABS.map((t) => (
          <button
            key={t.k}
            type="button"
            role="tab"
            aria-selected={track === t.k}
            className={track === t.k ? "tab on" : "tab"}
            onClick={() => write(TRACK_KEY, t.k)}
          >
            <b>{t.b}</b>
            <small>{t.s}</small>
          </button>
        ))}
      </div>
      <p className="trackdesc">{TRACKS[track].d}</p>
      <div className="legend">
        {(Object.keys(LANE) as (keyof typeof LANE)[]).map((k) => (
          <span key={k}>
            <i style={{ background: `var(--${k})` }} />
            {LANE[k]}
          </span>
        ))}
      </div>
      <div className="meter">
        <div className="mbar">
          <i style={{ width: `${(n / ids.length) * 100}%` }} />
        </div>
        <div className="mstat" aria-live="polite">
          {n === ids.length ? (
            <>
              <b>All {ids.length} done!</b> You&apos;re ready for Doom.
            </>
          ) : (
            <>
              <b>
                {n}/{ids.length}
              </b>{" "}
              watched · <b>{fmt(left)}</b> to go of ~{fmt(total)}
            </>
          )}
        </div>
        <button type="button" className="linkbtn" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="wgrid">
        {ids.map((id, i) => {
          const x = byId[id];
          const c = C[x.lane];
          const off = OFFICIAL.includes(id);
          const series = x.t.startsWith("Series");
          const cast = CAST["poster-" + id];
          return (
            <article
              key={id}
              id={`watch-${id}`}
              className={["wc", done[id] ? "done" : "", i < visible ? "show" : ""].filter(Boolean).join(" ")}
            >
              <div className="pw">
                <Art artKey={`poster-${id}`} alt={`${x.n} poster`} label="Poster" icon="film" color={c} sizes="(max-width: 640px) 100vw, 25vw" />
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {off && track !== "official" && (
                  <span className="off">
                    <Icon name="star" /> Official list
                  </span>
                )}
                <span className="lane" style={{ background: c }}>
                  {LANE[x.lane]}
                </span>
                <div className="stamp">
                  <span>WATCHED</span>
                </div>
              </div>
              <div className="body">
                <h3>{x.n}</h3>
                <div className="meta">
                  <span>
                    <Icon name="calendar" />
                    {x.y}
                  </span>
                  <span>
                    <Icon name={series ? "tv" : "film"} />
                    {x.t}
                  </span>
                  <span>
                    <Icon name="clock" />
                    {x.m ? (series ? "~" : "") + fmt(x.m) : series ? "Disney+" : "Theatrical"}
                  </span>
                </div>
                {cast && (
                  <div className="stars">
                    <Icon name="users" />
                    <span>Starring {cast.join(", ")}</span>
                  </div>
                )}
                <p>{x.why}</p>
                <div className="pills">
                  {x.ch.map((k) => (
                    <span key={k} className="pill">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="acts">
                  <button
                    type="button"
                    className={done[id] ? "wbtn on" : "wbtn"}
                    aria-pressed={!!done[id]}
                    onClick={() => toggle(id)}
                  >
                    <Icon name="check" />
                    {done[id] ? "Watched" : "Mark watched"}
                  </button>
                  {x.link && (
                    <a className="wbtn dplus" href={x.link} target="_blank" rel="noopener noreferrer">
                      <Icon name="play" />
                      {x.lt}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

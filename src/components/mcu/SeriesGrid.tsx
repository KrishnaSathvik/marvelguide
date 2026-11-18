"use client";

import { useState } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { C, dpl, SERIES, type Series } from "@/content";
import { useSearchReveal } from "@/lib/search-events";

type Kind = "all" | "live" | "anim" | "spc";
const CHIPS: [Kind, string][] = [
  ["all", "All series & specials"],
  ["live", "Live-action"],
  ["anim", "Animated"],
  ["spc", "Specials"],
];
const kind = (s: Series): Kind => (s.special ? "spc" : s.animated ? "anim" : "live");

export function SeriesGrid() {
  const [k, setK] = useState<Kind>("all");
  useSearchReveal("series-", () => setK("all"));
  return (
    <>
      <div className="fbar rv" role="group" aria-label="Filter series">
        {CHIPS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={k === key ? "fchip on" : "fchip"}
            aria-pressed={k === key}
            onClick={() => setK(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid g2">
        {SERIES.filter((s) => k === "all" || kind(s) === k).map((s) => (
          <div key={s.id} className="box sc" id={s.id}>
            <Art
              artKey={s.id}
              alt={`${s.n} poster`}
              label="Poster"
              icon="tv"
              color={C.purple}
              sizes="(max-width: 640px) 40vw, 240px"
            />
            <div className="sct">
              <h4>{s.n}</h4>
              <div className="scm">
                <span className="sub" style={{ margin: 0 }}>
                  {s.y}
                  {s.special ? " · Special" : s.animated ? " · Animated" : ""}
                </span>
              </div>
              <p>{s.p}</p>
              <div className="lk">
                <a className="wbtn dplus" href={dpl(s.id)} target="_blank" rel="noopener noreferrer">
                  <Icon name="play" />
                  Watch on Disney+
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

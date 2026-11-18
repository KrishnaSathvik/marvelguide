"use client";

import { useState, type CSSProperties } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { CH, DPLUS, TEAMS } from "@/content";

const tc = Object.fromEntries(TEAMS.map((t) => [t.k, t]));
/* Confirmed first, rumored last. */
const CARDS = [...CH.filter((h) => !h.rm), ...CH.filter((h) => h.rm)];
const CHIPS = [{ k: "all", n: `All (${CH.length})`, c: "#111" }, ...TEAMS, { k: "rm", n: "Rumored", c: "#888" }];

export function Roster() {
  const [k, setK] = useState("all");
  return (
    <>
      <div className="fbar" role="group" aria-label="Filter characters">
        {CHIPS.map((t) => (
          <button
            key={t.k}
            type="button"
            className={k === t.k ? "fchip on" : "fchip"}
            aria-pressed={k === t.k}
            onClick={() => setK(t.k)}
          >
            <i style={{ background: t.c }} />
            {t.n}
          </button>
        ))}
      </div>
      <div className="rgrid">
        {CARDS.map((h) => {
          const t = tc[h.tm];
          const hidden = k === "rm" ? !h.rm : k !== "all" && h.tm !== k;
          return (
            <article
              key={h.id}
              id={`char-${h.id}`}
              className={hidden ? "tc rv hide" : "tc rv"}
              style={{ "--tc": t.c } as CSSProperties}
            >
              <div className="team">
                <span>{t.n}</span>
                <Icon name="shield" />
              </div>
              <Art artKey={`char-${h.id}`} alt={h.n} label="Character art" icon="users" color={t.c} sizes="(max-width: 640px) 50vw, 20vw" />
              <div className="tx">
                {h.rm ? <span className="rmtag">Rumored</span> : null}
                <b className="nm">{h.n}</b>
                <div className="ac">
                  {h.a}
                  {h.s ? " · " + h.s : ""}
                </div>
                <div className="mt">
                  Meet them in: <em>{h.meet}</em>
                </div>
                <a className="lk" href={h.l} target="_blank" rel="noopener noreferrer">
                  <Icon name="external-link" />
                  {h.lp ? "Official profile" : h.l === DPLUS ? "Stream on Disney+" : "Official film page"}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

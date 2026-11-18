"use client";

import { useState } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { C, DIR, DIRT, slug } from "@/content";
import { useSearchReveal } from "@/lib/search-events";

const TEAMS = Object.keys(DIRT);
const statusClass = (s: string) =>
  /Died/.test(s) ? "dead" : /Rumored/.test(s) ? "rm" : /Doomsday/.test(s) ? "dd" : "";

/** Character directory: search by name/role/actor/first appearance, filter by team. */
export function Directory() {
  const [t, setT] = useState("all");
  const [q, setQ] = useState("");
  useSearchReveal("dir-", () => {
    setT("all");
    setQ("");
  });
  const needle = q.trim().toLowerCase();
  const visible = (c: (typeof DIR)[number]) =>
    (t === "all" || c.t === t) && (!needle || `${c.n} ${c.r} ${c.a} ${c.m}`.toLowerCase().includes(needle));
  const n = DIR.filter(visible).length;
  return (
    <>
      <div className="ftools rv">
        <label className="finput">
          <Icon name="filter" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
              onClick={() => setT(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="dgrid">
        {DIR.map((c) => (
          <article key={c.n} className="dc rv" data-hide={visible(c) ? undefined : ""} id={`dir-${slug(c.n)}`}>
            <Art
              artKey={`dir-${slug(c.n)}`}
              alt={c.r !== c.n ? `${c.n} (${c.r})` : c.n}
              label="Character art"
              icon="users"
              color={C.red}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="dtx">
              <span className="dteam">{DIRT[c.t]}</span>
              <h4>{c.n}</h4>
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
      {n === 0 && <p className="empty">No characters match that search.</p>}
    </>
  );
}

"use client";

import { useState } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { C, CAST, dpl, FILM_DESC, FILMS } from "@/content";

const FANDANGO = "https://www.fandango.com/avengersdoomsday";
const PCOL: Record<number, string> = { 1: C.red, 2: C.orange, 3: C.gold, 4: C.teal, 5: C.blue, 6: C.purple };
const CHIPS: [string, string][] = [
  ["all", "All 40"],
  ["inf", "Infinity Saga"],
  ["mul", "Multiverse Saga"],
  ...[1, 2, 3, 4, 5, 6].map((n): [string, string] => [String(n), "Phase " + n]),
];

const match = (f: string, ph: number) =>
  f === "all" || (f === "inf" && ph <= 3) || (f === "mul" && ph >= 4) || String(ph) === f;

/** Every MCU film with phase filters. No Essential/Recommended/Optional ratings on MCU pages. */
export function FilmsGrid() {
  const [f, setF] = useState("all");
  const shown = FILMS.filter((x) => match(f, x.ph)).length;
  return (
    <>
      <div className="ftools rv">
        <div className="fbar" style={{ marginTop: 0 }} role="group" aria-label="Filter films">
          {CHIPS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={f === k ? "fchip on" : "fchip"}
              aria-pressed={f === k}
              onClick={() => setF(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid g2">
        {FILMS.map((film) => {
          const link =
            film.id === "film-avengers-doomsday" ? (
              <a className="wbtn" href={FANDANGO} target="_blank" rel="noopener noreferrer">
                <Icon name="ticket" />
                Get tickets
              </a>
            ) : film.id === "film-avengers-secret-wars" ? (
              <span className="soon">
                <Icon name="calendar" />
                Dec 17, 2027
              </span>
            ) : film.id === "film-spider-man-brand-new-day" ? (
              <span className="soon">
                <Icon name="ticket" />
                Rent or buy digitally
              </span>
            ) : (
              <a className="wbtn dplus" href={dpl(film.id)} target="_blank" rel="noopener noreferrer">
                <Icon name="play" />
                Watch on Disney+
              </a>
            );
          const cast = film.id !== "film-avengers-secret-wars" ? CAST[film.id] : undefined;
          return (
            <article
              key={film.id}
              id={film.id}
              className={["box sc fm rv", film.up ? "up" : "", match(f, film.ph) ? "" : "hide"].filter(Boolean).join(" ")}
            >
              <Art
                artKey={film.id}
                alt={`${film.n} poster`}
                label="Poster"
                icon="film"
                color={PCOL[film.ph]}
                sizes="(max-width: 640px) 40vw, 240px"
              />
              <div className="sct">
                <h4>{film.n}</h4>
                <div className="scm">
                  <span className="sub" style={{ margin: 0 }}>
                    {film.y} · Phase {film.ph}
                  </span>
                </div>
                <p>{FILM_DESC[film.id]}</p>
                {cast && (
                  <div className="cs2">
                    <Icon name="users" />
                    <span>{cast.join(", ")}</span>
                  </div>
                )}
                <div className="lk">{link}</div>
              </div>
            </article>
          );
        })}
      </div>
      {shown === 0 && <p className="empty">No films match that filter.</p>}
      <p
        className="rv"
        style={{
          marginTop: 18,
          fontFamily: "var(--label)",
          fontSize: 13,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--mute)",
        }}
      >
        ★ = major team-up or saga milestone · release order per Marvel Studios
      </p>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

/** US release, local midnight (same target as legacy). */
const TARGET = new Date("2026-12-18T00:00:00");

type Parts = { d: string; h: string; m: string; s: string } | "now" | null;

function parts(): Parts {
  const ms = TARGET.getTime() - Date.now();
  if (ms <= 0) return "now";
  const s = Math.floor(ms / 1000);
  const pad = (v: number) => String(v).padStart(2, "0");
  return { d: String(Math.floor(s / 86400)), h: pad(Math.floor((s % 86400) / 3600)), m: pad(Math.floor((s % 3600) / 60)), s: pad(s % 60) };
}

/** Days/hours/mins/secs to Doomsday. Renders "--" on the server, then ticks every second. */
export function Countdown() {
  const [p, setP] = useState<Parts>(null);
  useEffect(() => {
    const tick = () => setP(parts());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  if (p === "now") {
    return (
      <div className="count">
        <div className="cbox">
          <b>NOW</b>
          <span>In theaters</span>
        </div>
      </div>
    );
  }
  const cells: [keyof Exclude<Parts, "now" | null>, string][] = [
    ["d", "Days"],
    ["h", "Hours"],
    ["m", "Mins"],
    ["s", "Secs"],
  ];
  return (
    <div className="count" role="timer" aria-label="Time until Avengers: Doomsday opens in the US">
      {cells.map(([k, label]) => {
        const v = p ? p[k] : "--";
        return (
          <div key={k} className="cbox">
            {/* Keyed by value so the flip animation replays on every change (disabled for reduced motion in CSS). */}
            <b key={v} className={p ? "flip" : undefined}>
              {v}
            </b>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

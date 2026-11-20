"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { posterPageHref, type PosterShot } from "@/lib/poster-pages";

const ORIGIN = "https://image.tmdb.org/t/p";

function shotSrc(shot: PosterShot, size: "w342" | "original") {
  return shot.src ?? `${ORIGIN}/${size}${shot.path}`;
}

function fileName(title: string, year: number, path: string) {
  const base = path.split("/").pop() || "poster.jpg";
  const name = `${title} ${year}`.replace(/[^\w.]+/g, "-").replace(/^-|-$/g, "");
  return `${name}-${base}`;
}

/** One page of the poster wall. Tap one for the original file, then step through this page or download it. */
export function PosterGallery({ shots }: { shots: readonly PosterShot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const startX = useRef(0);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const shot = open === null ? null : shots[open];

  const step = (dir: -1 | 1) => {
    setSaving(false);
    setOpen((cur) => (cur === null ? cur : (cur + dir + shots.length) % shots.length));
  };

  const save = async () => {
    if (!shot || saving) return;
    const src = shotSrc(shot, "original");
    setSaving(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName(shot.title, shot.year, shot.path);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank", "noopener,noreferrer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="poster-wall">
        {shots.map((p, i) => (
          <button key={`${p.mark ?? ""}-${p.path}`} id={p.mark} type="button" className="poster-open" onClick={() => setOpen(i)}>
            <img
              src={shotSrc(p, "w342")}
              alt={`${p.title}${p.textless ? ", no title text" : ""}`}
              width={p.w}
              height={p.h}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="poster-lightbox"
        aria-label={shot ? `${shot.title} poster` : "Poster"}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {shot && open !== null && (
          <div className="poster-stage">
            <div className="poster-bar">
              <span>
                {open + 1} / {shots.length}
              </span>
              <button type="button" className="poster-dl" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Download"}
              </button>
              <button type="button" className="poster-x" onClick={() => setOpen(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div
              className="poster-frame"
              onPointerDown={(e) => {
                startX.current = e.clientX;
              }}
              onPointerUp={(e) => {
                const dx = e.clientX - startX.current;
                if (dx > 48) step(-1);
                else if (dx < -48) step(1);
              }}
            >
              <img
                key={shot.path}
                className="poster-full"
                src={shotSrc(shot, "original")}
                alt={`${shot.title}${shot.textless ? ", no title text" : ""}`}
                width={shot.w}
                height={shot.h}
              />
            </div>
            <div className="poster-bar">
              <button type="button" className="poster-step" onClick={() => step(-1)} aria-label="Previous poster">
                <Icon name="arrow-right" />
              </button>
              <b>
                {shot.title}
                {shot.textless ? " · No text" : ""}
              </b>
              <button type="button" className="poster-step" onClick={() => step(1)} aria-label="Next poster">
                <Icon name="arrow-right" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** First, last, and the pages beside the current one. The rest stay behind an ellipsis. */
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

/** Previous, a short page list, and next. Twenty posters sit above this. */
export function PosterPager({ page, pages }: { page: number; pages: number }) {
  const step = (label: string, target: number, enabled: boolean, dir: -1 | 1) =>
    enabled ? (
      <Link className={dir < 0 ? "poster-prev" : undefined} href={posterPageHref(target)} aria-label={label}>
        <Icon name="arrow-right" />
      </Link>
    ) : (
      <span className={dir < 0 ? "off poster-prev" : "off"} aria-hidden="true">
        <Icon name="arrow-right" />
      </span>
    );

  return (
    <nav className="poster-pages" aria-label="Poster pages">
      {step("Previous page", page - 1, page > 1, -1)}
      {pagerItems(page, pages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="gap">
            …
          </span>
        ) : item === page ? (
          <span key={item} className="n" aria-current="page">
            {item}
          </span>
        ) : (
          <Link key={item} className="n" href={posterPageHref(item)}>
            {item}
          </Link>
        ),
      )}
      {step("Next page", page + 1, page < pages, 1)}
    </nav>
  );
}

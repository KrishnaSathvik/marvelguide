"use client";

import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SearchItem } from "@/lib/search-index";
import { requestReveal } from "@/lib/search-events";
import { Icon } from "./Icon";

type Indexed = SearchItem & { _t: string; _x: string };
type IndexModule = typeof import("@/lib/search-index");

const TRY = ["Doctor Doom", "Loki", "Incursion", "Earth-828", "Runtime", "Is Loki required?"];
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'");

/** Wrap matched words in <mark> (legacy `hl`), without building HTML strings. */
function highlight(s: string, words: string[]): ReactNode {
  const ws = words.filter((w) => w.length >= 2);
  if (!ws.length) return s;
  const re = new RegExp(`(${ws.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return s.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>));
}

/**
 * Wait for the target to be rendered and visible, asking the page to reveal it if a filter hides it.
 * With Cache Components, recently visited pages stay in the DOM (hidden), so the same id can exist
 * more than once: only an element that actually has a layout box counts.
 */
const visibleById = (id: string) =>
  [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((el) => el.getClientRects().length > 0) ??
  null;

async function reveal(id: string): Promise<{ el: HTMLElement | null; revealed: boolean }> {
  const visible = () =>
    [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find((el) => el.getClientRects().length > 0) ??
    null;
  const deadline = Date.now() + 3000;
  let asked = false;
  while (Date.now() < deadline) {
    const el = visible();
    if (el) return { el, revealed: asked };
    // Give a freshly navigated page a moment before assuming a filter hides the target.
    if (!asked && Date.now() > deadline - 2700) {
      requestReveal(id);
      asked = true;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return { el: null, revealed: asked };
}

/** Global search: opened by the header button, the hero box, "/" or Cmd/Ctrl+K. */
export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mod, setMod] = useState<IndexModule | null>(null);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQ("");
    setSel(0);
    setOpen(true);
    import("@/lib/search-index").then(setMod);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onOpen = () => show();
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((document.activeElement as HTMLElement | null)?.tagName ?? "");
      if (e.key === "Escape" && open) {
        close();
        return;
      }
      if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("search:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("search:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, show, close]);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 20);
  }, [open]);

  const index = useMemo<Indexed[]>(
    () => (mod ? mod.SEARCH_INDEX.map((it) => ({ ...it, _t: norm(it.title), _x: norm(it.text) })) : []),
    [mod],
  );

  const words = norm(q.trim()).split(/\s+/).filter(Boolean);
  const { list, total } = useMemo(() => {
    if (!mod) return { list: [] as Indexed[], total: 0 };
    const g = mod.SEARCH_GROUPS[group];
    const typed = index.filter((it) => !g || g.includes(it.type));
    let all: Indexed[];
    if (!words.length) all = typed;
    else {
      const whole = norm(q.trim());
      all = typed
        .map((it): [number, Indexed] | null => {
          let sc = 0;
          for (const w of words) {
            const inT = it._t.includes(w),
              inX = it._x.includes(w);
            if (!inT && !inX) return null;
            sc += inT ? (it._t.startsWith(w) ? 12 : 8) : 2;
          }
          if (it._t === whole) sc += 30;
          return [sc, it];
        })
        .filter((x): x is [number, Indexed] => x !== null)
        .sort((a, b) => b[0] - a[0])
        .map((x) => x[1]);
    }
    return { list: all.slice(0, 30), total: all.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod, index, group, q]);

  const go = async (it: SearchItem) => {
    close();
    if (it.path !== pathname) router.push(it.path);
    if (!it.target) {
      scrollTo({ top: 0 });
      return;
    }
    // Wait for the destination page to render (or the current one to reveal the target).
    if (it.path !== pathname) await new Promise((r) => setTimeout(r, 60));
    const r = await reveal(it.target);
    let el = r.el;
    if (!el) return;
    // A filter/list just changed: let it finish re-rendering (and staggered entrances) before flashing.
    if (r.revealed) {
      await new Promise((res) => setTimeout(res, 550));
      el = visibleById(it.target) ?? el;
    }
    history.replaceState(history.state, "", `${it.path}#${it.target}`);
    el.classList.add("in");
    // "start" (not center): some cards are taller than the screen. scroll-padding-top clears the header.
    el.scrollIntoView({ behavior: "instant", block: "start" });
    // Flash via the Web Animations API: React may rewrite the element's class list (e.g. staggered
    // entrances), which would cancel a class-based animation. Same keyframes as legacy `.flash`.
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.animate(
        [
          { outline: "5px solid #ffd23f", outlineOffset: "4px", boxShadow: "0 0 0 12px rgba(255,210,63,.45)" },
          { outline: "5px solid #ffd23f", outlineOffset: "4px", boxShadow: "0 0 0 12px rgba(255,210,63,.45)", offset: 0.3 },
          { outline: "5px solid transparent", outlineOffset: "12px" },
        ],
        { duration: 2200, easing: "ease" },
      );
    }
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!list.length) return;
      const next = (sel + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
      setSel(next);
      resRef.current?.querySelectorAll(".ri")[next]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (list[sel]) go(list[sel]);
    }
  };

  if (!open) return null;
  const groups = mod ? Object.keys(mod.SEARCH_GROUPS) : ["All"];
  const label = mod ? mod.typeLabel : (t: string) => t;

  return (
    <div className="search open" role="dialog" aria-modal="true" aria-label="Search">
      <div className="bg" onClick={close} />
      <div className="pnl">
        <div className="in">
          <Icon name="search" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search the MCU…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search the site"
            role="combobox"
            aria-expanded={list.length > 0}
            aria-controls="search-results"
            aria-activedescendant={list[sel] ? `sr-${sel}` : undefined}
          />
          <kbd onClick={close}>Esc</kbd>
        </div>
        <div className="chips">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              className={g === group ? "on" : undefined}
              aria-pressed={g === group}
              onClick={() => {
                setGroup(g);
                setSel(0);
                input.current?.focus();
              }}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="res" id="search-results" role="listbox" ref={resRef}>
          {!mod ? (
            <div className="none">Loading…</div>
          ) : !words.length && group === "All" ? (
            <div className="sempty">
              <p>Type a film, character, place or word you don&apos;t get. Or try one of these:</p>
              <div className="try">
                {TRY.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setQ(t);
                      setSel(0);
                      input.current?.focus();
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : !list.length ? (
            <div className="none">
              Nothing found for “{q.trim()}”.
              <br />
              Try a name or a simpler word.
            </div>
          ) : (
            <>
              {list.map((it, i) => (
                <div
                  key={`${it.path}#${it.target ?? ""}:${it.title}`}
                  id={`sr-${i}`}
                  className={i === sel ? "ri on" : "ri"}
                  role="option"
                  aria-selected={i === sel}
                  onMouseMove={() => setSel(i)}
                  onClick={() => go(it)}
                >
                  <span className="ti">
                    <Icon name={it.icon || "search"} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <b>{highlight(it.title, words)}</b>
                    {it.text && <small>{highlight(it.text, words)}</small>}
                  </div>
                  <span className="ty">{label(it.type)}</span>
                </div>
              ))}
              {total > list.length && (
                <div className="more">
                  Showing {list.length} of {total}. Type more to narrow it down.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

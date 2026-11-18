"use client";

import { useEffect, useRef } from "react";

/** Opens the global search modal from anywhere (hero box, header button). */
export const openSearch = () => window.dispatchEvent(new Event("search:open"));

/**
 * Search asks the page to make a result visible (e.g. a film hidden by a phase filter, or a watch-list
 * title in another list). Components holding that UI state listen and reset themselves.
 */
export const requestReveal = (id: string) => window.dispatchEvent(new CustomEvent("search:reveal", { detail: id }));

export function useSearchReveal(prefix: string, onReveal: (id: string) => void) {
  const cb = useRef(onReveal);
  useEffect(() => {
    cb.current = onReveal;
  });
  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id.startsWith(prefix)) cb.current(id);
    };
    window.addEventListener("search:reveal", h);
    return () => window.removeEventListener("search:reveal", h);
  }, [prefix]);
}

"use client";

import { useEffect, useState } from "react";
import { openSearch } from "@/lib/search-events";
import { Icon } from "./Icon";

const TIPS = [
  "Try “Loki”, “incursion”, “Earth-828”…",
  "Search any hero: “Shuri”, “Sentry”…",
  "Search a year: “2019”",
  "Search a question: “Spider-Man”",
];

/** The big search box on the home page (opens the global search). Placeholder rotates like legacy. */
export function HeroSearch() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % TIPS.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <button type="button" className="hsearch" onClick={openSearch} aria-label="Search the site">
      <Icon name="search" />
      <span>{TIPS[i]}</span>
      <kbd>/</kbd>
    </button>
  );
}

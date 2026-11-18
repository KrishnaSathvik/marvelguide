import MANIFEST from "../../images/manifest.json";

/**
 * Image key → URL. Keys are the legacy `data-art` keys (AGENTS.md §6).
 * Interim: images/ is copied to public/art/ by scripts/sync-images.mjs (runs before dev/build).
 * Phase 3 replaces this with the Supabase `art` table. Keys without a file show the placeholder.
 */
const FILES: Record<string, string> = Object.fromEntries(
  (MANIFEST as { key: string; file: string }[]).map((e) => [e.key, e.file.replace(/^images\//, "")]),
);

export function artSrc(key: string): string | null {
  const f = FILES[key];
  return f ? `/art/${f}` : null;
}

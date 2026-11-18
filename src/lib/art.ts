import MANIFEST from "../../images/manifest.json";

/**
 * Image key → URL. Keys are the legacy `data-art` keys (AGENTS.md §6).
 * Interim: images/ is copied to public/art/ by scripts/sync-images.mjs (runs before dev/build).
 * Phase 3 replaces this with the Supabase `art` table. Keys without a file show the placeholder.
 */
type Entry = { key: string; file: string; focus?: string };
const ENTRIES: Record<string, Entry> = Object.fromEntries((MANIFEST as Entry[]).map((e) => [e.key, e]));

export function artSrc(key: string): string | null {
  const e = ENTRIES[key];
  return e ? `/art/${e.file.replace(/^images\//, "")}` : null;
}

/**
 * Optional crop focus for an image (a CSS object-position such as "center 20%"), stored per image in
 * manifest.json because it depends on the photo, not the frame. Default is the center.
 */
export function artFocus(key: string): string | undefined {
  return ENTRIES[key]?.focus;
}

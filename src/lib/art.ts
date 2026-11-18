import { cacheLife, cacheTag } from "next/cache";
import MANIFEST from "../../images/manifest.json";

/**
 * Image key → { src, focus }. Keys are the legacy `data-art` keys (AGENTS.md §6).
 *
 * Source of truth is the Supabase `art` table (Phase 3, filled by scripts/import-images.mjs). It is read
 * once and cached ('use cache', tag "art"): the Phase 4 admin calls revalidateTag("art") after a change.
 * Without Supabase config (or if it is unreachable) we fall back to images/ via public/art/, which
 * scripts/sync-images.mjs copies before dev/build.
 */
export type ArtEntry = { src: string; focus?: string };
export type ArtMap = Record<string, ArtEntry>;

type ManifestEntry = { key: string; file: string; focus?: string };

export function localArtMap(): ArtMap {
  return Object.fromEntries(
    (MANIFEST as ManifestEntry[]).map((e) => [
      e.key,
      { src: `/art/${e.file.replace(/^images\//, "")}`, ...(e.focus ? { focus: e.focus } : {}) },
    ]),
  );
}

export async function getArtMap(): Promise<ArtMap> {
  "use cache";
  cacheLife("max");
  cacheTag("art");

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return localArtMap();
  try {
    const r = await fetch(`${base}/rest/v1/art?select=key,url,focus`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (!r.ok) throw new Error(`art table: HTTP ${r.status}`);
    const rows = (await r.json()) as { key: string; url: string; focus: string | null }[];
    if (!rows.length) throw new Error("art table is empty (run scripts/import-images.mjs)");
    return Object.fromEntries(rows.map((x) => [x.key, { src: x.url, ...(x.focus ? { focus: x.focus } : {}) }]));
  } catch (err) {
    console.warn(`[art] Supabase unavailable, using local images/: ${(err as Error).message}`);
    return localArtMap();
  }
}

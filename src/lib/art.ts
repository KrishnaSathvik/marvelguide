import { cacheLife, cacheTag } from "next/cache";

/**
 * Image key → { src, focus }. Keys are the legacy `data-art` keys (AGENTS.md §6).
 *
 * The only source is the Supabase `art` table (Storage bucket `art`). It is read once and cached
 * ('use cache', tag "art"); the Phase 4 admin calls revalidateTag("art") after a change.
 * There is deliberately no fallback: the result is cached for the life of a deployment, so a silent
 * "no images" would ship a site of empty frames. If the table can't be read the build fails instead,
 * and the previous deployment stays live.
 */
export type ArtEntry = { src: string; focus?: string };
export type ArtMap = Record<string, ArtEntry>;

export async function getArtMap(): Promise<ArtMap> {
  "use cache";
  cacheLife("max");
  cacheTag("art");

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) throw new Error("[art] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");

  const r = await fetch(`${base}/rest/v1/art?select=key,url,focus`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  if (!r.ok) throw new Error(`[art] Could not read the art table: HTTP ${r.status}`);
  const rows = (await r.json()) as { key: string; url: string; focus: string | null }[];
  if (!rows.length) throw new Error("[art] The art table is empty.");
  return Object.fromEntries(rows.map((x) => [x.key, { src: x.url, ...(x.focus ? { focus: x.focus } : {}) }]));
}

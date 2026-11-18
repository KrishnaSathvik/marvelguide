/**
 * Knowledge source #2 (AGENTS.md §8): context.dev web search on an allowlist of trusted domains,
 * returning relevant passages in the same call. Results are cached in Supabase `source_cache`
 * (24h for news, 7 days for reference) so repeat questions don't spend credits.
 */
import "server-only";
import { createHash } from "node:crypto";
import ContextDev from "context.dev";
import { LIMITS } from "./config";
import { sbSelect, sbUpsert } from "./supabase";

/** Source tiers. A lower tier never overrides a higher one; tier 3+ is interpretation, tier 4 is report/rumor. */
export const TIERS: Record<string, { tier: 1 | 2 | 3 | 4; label: string }> = Object.fromEntries([
  // Not youtube.com: a domain filter can't tell Marvel's channel from fan uploads (AGENTS.md: YouTube later, metadata only).
  ...["marvel.com", "disney.com", "disneyplus.com", "press.disneyplus.com", "thewaltdisneycompany.com"].map(
    (d) => [d, { tier: 1 as const, label: "Official" }],
  ),
  ...["hollywoodreporter.com", "variety.com", "deadline.com"].map((d) => [d, { tier: 2 as const, label: "Trade press" }]),
  ...["marvel.fandom.com", "comics.org"].map((d) => [d, { tier: 3 as const, label: "Reference (fan wiki/database)" }]),
  ...[
    "screenrant.com",
    "cbr.com",
    "thedirect.com",
    "murphysmultiverse.com",
    "comicbookmovie.com",
    "gamesradar.com",
    "fictionhorizon.com",
    "yahoo.com",
    "comicbasics.com",
    "slashfilm.com",
    "cinemablend.com",
    "superherohype.com",
    "comingsoon.net",
  ].map((d) => [d, { tier: 4 as const, label: "Entertainment site (report/unconfirmed)" }]),
]);

export type WebSource = { title: string; url: string; domain: string; tier: number; label: string; passages: string[] };

function tierOf(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const key = Object.keys(TIERS)
    .filter((d) => host === d || host.endsWith("." + d))
    .sort((a, b) => b.length - a.length)[0];
  return { domain: host, ...(key ? TIERS[key] : { tier: 5, label: "Other" }) };
}

let client: ContextDev | null = null;
const ctx = () => (client ??= new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY }));

export async function searchWeb(query: string, kind: "news" | "reference"): Promise<{ sources: WebSource[]; cached: boolean }> {
  const q = query.trim().replace(/\s+/g, " ").slice(0, 300);
  const key = createHash("sha256").update(`${kind}:${q.toLowerCase()}`).digest("hex");

  const hit = await sbSelect<{ results: WebSource[] }>(
    `source_cache?select=results&key=eq.${key}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,
  );
  if (hit?.[0]) return { sources: hit[0].results, cached: true };

  if (!process.env.CONTEXT_DEV_API_KEY) return { sources: [], cached: false };

  const res = await ctx().web.search({
    query: q,
    numResults: LIMITS.webResults,
    includeDomains: Object.keys(TIERS),
    languages: ["en"],
    ...(kind === "news" ? { freshness: "last_month" as const } : {}),
    highlightsOptions: { enabled: true, maxCharacters: LIMITS.webPassageChars },
  });

  const sources: WebSource[] = res.results
    .map((r) => ({
      title: r.title,
      url: r.url,
      ...tierOf(r.url),
      passages: r.highlights.code === "SUCCESS" && r.highlights.highlights ? r.highlights.highlights : r.description ? [r.description] : [],
    }))
    .filter((s) => s.passages.length)
    .sort((a, b) => a.tier - b.tier);

  const ttlMs = kind === "news" ? 24 * 3600_000 : 7 * 24 * 3600_000;
  await sbUpsert(
    "source_cache",
    { key, query: q, kind, results: sources, fetched_at: new Date().toISOString(), expires_at: new Date(Date.now() + ttlMs).toISOString() },
    "key",
  );
  return { sources, cached: false };
}

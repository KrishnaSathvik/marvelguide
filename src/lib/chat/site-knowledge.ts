/**
 * Knowledge source #1 (AGENTS.md §8): this site's own curated content.
 * Uses the global search index (every film, series, character, chapter row, FAQ and news item, each with
 * a page link) and ranks entries for a question with a small BM25 scorer. No embeddings yet (Phase 7).
 */
import "server-only";
import { NEWS, type NewsPara } from "@/content";
import { SEARCH_INDEX, type SearchItem } from "@/lib/search-index";

export type SiteDoc = SearchItem & { href: string };

const STOP = new Set(
  "a an the and or of to in on at for is are was were be been it its this that these those what who whom which why how when where do does did i you he she they we me my your his her their our with from by as about into than then so not no can could would should will just there here".split(
    " ",
  ),
);
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019']/g, "");
const tokens = (s: string) => norm(s).match(/[a-z0-9]+(?:-[a-z0-9]+)*/g)?.filter((t) => t.length > 1 && !STOP.has(t)) ?? [];

const paraText = (p: NewsPara) => (typeof p === "string" ? p : `${p.label} ${p.text}${p.tag ? ` (${p.tag})` : ""}`);

/** News cards with their full text and certainty tag (the search index only keeps keywords for them). */
const NEWS_DOCS: SiteDoc[] = NEWS.map((n) => ({
  type: n.section === "rumors" ? "Rumor" : "News",
  title: `${n.title} [${n.tag}]`,
  text: [n.source, ...n.body.map(paraText), ...(n.spoiler ?? []).map((p) => `(spoiler) ${paraText(p)}`), ...(n.spoilerList ?? []).map((s) => `(spoiler) ${s}`)]
    .filter(Boolean)
    .join(" "),
  path: "/news",
  target: n.id,
  icon: "zap",
  href: `/news#${n.id}`,
}));

const DOCS: SiteDoc[] = [
  ...SEARCH_INDEX.filter((it) => it.type !== "Latest" && it.type !== "Rumor").map((it) => ({
    ...it,
    href: it.target ? `${it.path}#${it.target}` : it.path,
  })),
  ...NEWS_DOCS,
];

/** Questions about what's new always get the site's news cards in context. */
export const isNewsQuestion = (q: string) => /\b(news|latest|recent|update|updates|announc\w*|this week|trailer|confirmed|rumou?rs?|leak\w*|box office|runtime)\b/i.test(q);
export const newsDocs = () => NEWS_DOCS;
const TOK = DOCS.map((d) => ({ title: tokens(d.title), body: tokens(`${d.title} ${d.text}`) }));
const N = DOCS.length;
const AVG = TOK.reduce((a, t) => a + t.body.length, 0) / N;
const DF = new Map<string, number>();
for (const t of TOK) for (const w of new Set(t.body)) DF.set(w, (DF.get(w) ?? 0) + 1);

function score(i: number, q: string[]): number {
  const { title, body } = TOK[i];
  const k1 = 1.2,
    b = 0.75;
  let s = 0;
  for (const w of q) {
    const df = DF.get(w);
    if (!df) continue;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const tf = body.filter((x) => x === w).length;
    s += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * body.length) / AVG));
    if (title.includes(w)) s += idf; // titles matter more
  }
  return s;
}

/** Top site entries for a query. */
export function searchSite(query: string, limit = 6): SiteDoc[] {
  const q = tokens(query);
  if (!q.length) return [];
  return DOCS.map((d, i) => [score(i, q), d] as const)
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, d]) => d);
}

/** Entries on the page the visitor is looking at (for "explain this"). */
export function pageDocs(path: string, hash?: string, limit = 4): SiteDoc[] {
  const target = hash?.replace(/^#/, "");
  const onPage = DOCS.filter((d) => d.path === path);
  const exact = target ? onPage.filter((d) => d.target === target) : [];
  return [...exact, ...onPage.filter((d) => !exact.includes(d))].slice(0, limit);
}

export function formatDocs(docs: SiteDoc[], maxChars = 900): string {
  return docs
    .map((d) => `- [${d.title}](${d.href}) (${d.type}): ${d.text.length > maxChars ? d.text.slice(0, maxChars) + "…" : d.text}`)
    .join("\n");
}

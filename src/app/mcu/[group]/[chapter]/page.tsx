import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chapter, CHAPTER_META } from "@/components/mcu/chapters";
import { Crumb, Pager } from "@/components/ui";
import { findGroup, MCU_GROUPS } from "@/lib/routes";
import { Reveal } from "@/components/Reveal";

/** Every chapter in reading order, for the Back/Next pager. */
const ALL = MCU_GROUPS.flatMap((g) => g.chapters.map((c) => ({ group: g, chapter: c })));

export function generateStaticParams() {
  return ALL.map(({ group, chapter }) => ({ group: group.slug, chapter: chapter.slug }));
}

async function resolve(params: PageProps<"/mcu/[group]/[chapter]">["params"]) {
  const { group: gs, chapter: cs } = await params;
  const group = findGroup(gs);
  const chapter = group?.chapters.find((c) => c.slug === cs);
  return group && chapter ? { group, chapter } : null;
}

export async function generateMetadata({ params }: PageProps<"/mcu/[group]/[chapter]">): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const meta = CHAPTER_META[r.chapter.legacyId];
  return { title: meta.title, description: meta.lede ?? r.group.description };
}

/** A single chapter on its own page (deep links, search results, chatbot links). */
export default function McuChapterPage({ params }: PageProps<"/mcu/[group]/[chapter]">) {
  // params are read inside <Suspense> so client navigations stay instant (Cache Components).
  return (
    <main>
      <Suspense fallback={<Fallback />}>
        <ChapterPage params={params} />
      </Suspense>
    </main>
  );
}

/** Shown only if a navigation arrives before the page's content (links prefetch it, so this is rare). */
function Fallback() {
  return (
    <section>
      <div className="wrap" style={{ minHeight: "60vh" }} />
    </section>
  );
}

async function ChapterPage({ params }: { params: PageProps<"/mcu/[group]/[chapter]">["params"] }) {
  const r = await resolve(params);
  if (!r) notFound();
  const i = ALL.findIndex((x) => x.chapter === r.chapter);
  const prev = ALL[i - 1];
  const next = ALL[i + 1];
  const href = (x: (typeof ALL)[number]) => `/mcu/${x.group.slug}/${x.chapter.slug}`;
  return (
    <section className="part egrp">
      <div className="wrap">
        <Reveal />
        <Crumb href={`/mcu/${r.group.slug}`} parent={`MCU Explained · ${r.group.title}`} label={r.chapter.title} />
        <Chapter id={r.chapter.legacyId} />
        <Pager
          prev={prev ? { href: href(prev), title: prev.chapter.title } : null}
          next={next ? { href: href(next), title: next.chapter.title } : null}
        />
      </div>
    </section>
  );
}

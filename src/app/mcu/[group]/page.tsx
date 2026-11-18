import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Chapter } from "@/components/mcu/chapters";
import { Crumb, Pager } from "@/components/ui";
import { findGroup, MCU_GROUPS } from "@/lib/routes";
import { Reveal } from "@/components/Reveal";

export function generateStaticParams() {
  return MCU_GROUPS.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mcu/[group]">): Promise<Metadata> {
  const group = findGroup((await params).group);
  return group ? pageMeta({ title: group.title, description: group.description, path: `/mcu/${group.slug}` }) : {};
}

/** A group page holds all of its chapters, read top to bottom (legacy `.part.egrp`). */
export default function McuGroupPage({ params }: PageProps<"/mcu/[group]">) {
  // params are read inside <Suspense> so client navigations stay instant (Cache Components).
  return (
    <main>
      <Suspense fallback={<Fallback />}>
        <Group params={params} />
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

async function Group({ params }: { params: PageProps<"/mcu/[group]">["params"] }) {
  const group = findGroup((await params).group);
  if (!group) notFound();
  const i = MCU_GROUPS.indexOf(group);
  const prev = MCU_GROUPS[i - 1];
  const next = MCU_GROUPS[i + 1];
  return (
    <section className="part egrp" id={group.legacyId}>
      <div className="wrap">
        <Reveal />
        <Crumb href="/mcu" parent="MCU Explained" label={`Section ${i + 1} of ${MCU_GROUPS.length}`} />
        <span className="kicker rv">
          <Icon name={group.icon} />
          <em style={{ color: "#fff" }}>{group.chapters.length} chapters</em>
        </span>
        <h1 className="h2 rv">{group.title}</h1>
        <p className="lede rv">{group.description}</p>
        <nav className="jump rv" aria-label="Chapters">
          {group.chapters.map((c, ci) => (
            <Link key={c.slug} href={`#${c.legacyId}`}>
              <em>{ci + 1}</em>
              {c.title}
            </Link>
          ))}
        </nav>
        {group.chapters.map((c) => (
          <Chapter key={c.slug} id={c.legacyId} />
        ))}
        <Pager
          prev={prev ? { href: `/mcu/${prev.slug}`, title: prev.title } : null}
          next={next ? { href: `/mcu/${next.slug}`, title: next.title } : null}
        />
      </div>
    </section>
  );
}

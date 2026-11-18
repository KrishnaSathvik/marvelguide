import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageStub } from "@/components/PageStub";
import { findGroup, MCU_GROUPS } from "@/lib/routes";

export function generateStaticParams() {
  return MCU_GROUPS.flatMap((g) => g.chapters.map((c) => ({ group: g.slug, chapter: c.slug })));
}

async function resolve(params: PageProps<"/mcu/[group]/[chapter]">["params"]) {
  const { group: gs, chapter: cs } = await params;
  const group = findGroup(gs);
  const chapter = group?.chapters.find((c) => c.slug === cs);
  return group && chapter ? { group, chapter } : null;
}

export async function generateMetadata({ params }: PageProps<"/mcu/[group]/[chapter]">): Promise<Metadata> {
  const r = await resolve(params);
  return r ? { title: r.chapter.title } : {};
}

export default async function McuChapterPage({ params }: PageProps<"/mcu/[group]/[chapter]">) {
  const r = await resolve(params);
  if (!r) notFound();
  return (
    <PageStub
      crumbs={[
        { href: "/mcu", label: "MCU Explained" },
        { href: `/mcu/${r.group.slug}`, label: r.group.title },
      ]}
      kicker={r.group.title}
      title={r.chapter.title}
    />
  );
}

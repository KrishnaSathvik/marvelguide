import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardGrid, PageStub } from "@/components/PageStub";
import { findGroup, MCU_GROUPS } from "@/lib/routes";

export function generateStaticParams() {
  return MCU_GROUPS.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mcu/[group]">): Promise<Metadata> {
  const group = findGroup((await params).group);
  return group ? { title: group.title, description: group.description } : {};
}

export default async function McuGroupPage({ params }: PageProps<"/mcu/[group]">) {
  const group = findGroup((await params).group);
  if (!group) notFound();
  return (
    <PageStub
      crumbs={[{ href: "/mcu", label: "MCU Explained" }]}
      kicker={`Part ${MCU_GROUPS.indexOf(group) + 1} of ${MCU_GROUPS.length}`}
      title={group.title}
      lede={group.description}
    >
      <CardGrid
        items={group.chapters.map((c, i) => ({
          href: `/mcu/${group.slug}/${c.slug}`,
          tag: `Chapter ${i + 1}`,
          title: c.title,
        }))}
      />
    </PageStub>
  );
}

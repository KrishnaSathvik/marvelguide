import type { Metadata } from "next";
import { CardGrid, PageStub } from "@/components/PageStub";
import { MCU_GROUPS } from "@/lib/routes";

export const metadata: Metadata = { title: "MCU Explained" };

export default function McuPage() {
  return (
    <PageStub kicker="MCU Explained" title="The whole MCU, explained">
      <CardGrid
        items={MCU_GROUPS.map((g, i) => ({
          href: `/mcu/${g.slug}`,
          tag: `${i + 1} · ${g.chapters.length} chapters`,
          title: g.title,
          text: g.description,
        }))}
      />
    </PageStub>
  );
}

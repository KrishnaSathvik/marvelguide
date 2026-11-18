import type { Metadata } from "next";
import { CardGrid, PageStub } from "@/components/PageStub";
import { GUIDE_STEPS } from "@/lib/routes";

export const metadata: Metadata = { title: "Doomsday Guide" };

export default function GuidePage() {
  return (
    <PageStub kicker="Doomsday Guide" title="Get ready in 4 steps">
      <CardGrid
        items={GUIDE_STEPS.map((s, i) => ({
          href: `/guide/${s.slug}`,
          tag: `Step ${i + 1} of ${GUIDE_STEPS.length}`,
          title: s.title,
        }))}
      />
    </PageStub>
  );
}

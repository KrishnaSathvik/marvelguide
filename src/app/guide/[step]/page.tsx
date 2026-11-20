import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense, type ComponentType } from "react";
import { CharactersStep } from "@/components/guide/CharactersStep";
import { StoryStep } from "@/components/guide/StoryStep";
import { UniversesStep } from "@/components/guide/UniversesStep";
import { WatchStep } from "@/components/guide/WatchStep";
import { Crumb, Pager } from "@/components/ui";
import { findStep, GUIDE_STEPS, MCU_HOME } from "@/lib/routes";
import { Reveal } from "@/components/Reveal";

const STEP: Record<string, { Body: ComponentType; alt?: boolean; description: string }> = {
  story: {
    Body: StoryStep,
    description: "Seven chapters from Endgame to Doom: what happened, why it matters and how it leads to Doomsday.",
  },
  watch: {
    Body: WatchStep,
    alt: true,
    description:
      "Three lists of what to watch before Avengers: Doomsday: a five-title weekend, Disney+'s official 15, and a longer deep cut.",
  },
  universes: {
    Body: UniversesStep,
    description: "Earth-616, Earth-828 and Earth-10005: the three universes colliding in Doomsday.",
  },
  characters: {
    Body: CharactersStep,
    alt: true,
    description:
      "The Avengers: Doomsday cast: Doctor Doom, the confirmed roster, who is set up on screen, and who is only rumored.",
  },
};

/** Search titles. Visible headings stay the short step names. The layout template adds " · Marvel Guide". */
const SEO_TITLE: Partial<Record<(typeof GUIDE_STEPS)[number]["slug"], string>> = {
  watch: "Watch Lists Before Avengers: Doomsday",
  characters: "Avengers: Doomsday Cast",
};

export function generateStaticParams() {
  return GUIDE_STEPS.map((s) => ({ step: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[step]">): Promise<Metadata> {
  const step = findStep((await params).step);
  return step
    ? pageMeta({
        title: SEO_TITLE[step.slug] ?? step.title,
        description: STEP[step.slug].description,
        path: `/guide/${step.slug}`,
      })
    : {};
}

export default function GuideStepPage({ params, searchParams }: PageProps<"/guide/[step]">) {
  // params are read inside <Suspense> so client navigations stay instant (Cache Components).
  return (
    <main>
      <Suspense fallback={<Fallback />}>
        <Step params={params} searchParams={searchParams} />
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

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function Step({
  params,
  searchParams,
}: {
  params: PageProps<"/guide/[step]">["params"];
  searchParams: PageProps<"/guide/[step]">["searchParams"];
}) {
  const step = findStep((await params).step);
  if (!step) notFound();
  const i = GUIDE_STEPS.indexOf(step);
  const prev = GUIDE_STEPS[i - 1];
  const next = GUIDE_STEPS[i + 1];
  const { Body, alt } = STEP[step.slug];
  const list = step.slug === "watch" ? one((await searchParams).list) : undefined;
  return (
    <section id={step.legacyId} className={alt ? "alt" : undefined}>
      <div className="wrap">
        <Reveal />
        <Crumb
          href="/guide/story"
          parent="Doomsday Guide"
          label={`Step ${i + 1} of ${GUIDE_STEPS.length}`}
          path={`/guide/${step.slug}`}
        />
        {step.slug === "watch" ? <WatchStep list={list} /> : <Body />}
        <Pager
          prev={prev ? { href: `/guide/${prev.slug}`, title: prev.title } : null}
          next={
            next
              ? { href: `/guide/${next.slug}`, title: next.title }
              : { href: MCU_HOME, top: "Done? Go deeper →", title: "MCU Explained" }
          }
        />
      </div>
    </section>
  );
}

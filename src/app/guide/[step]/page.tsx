import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { CharactersStep } from "@/components/guide/CharactersStep";
import { StoryStep } from "@/components/guide/StoryStep";
import { UniversesStep } from "@/components/guide/UniversesStep";
import { WatchStep } from "@/components/guide/WatchStep";
import { Crumb, Pager } from "@/components/ui";
import { findStep, GUIDE_STEPS } from "@/lib/routes";

const STEP: Record<string, { Body: ComponentType; alt?: boolean; description: string }> = {
  story: { Body: StoryStep, description: "Seven chapters from Endgame to Doom: what happened, why it matters and how it leads to Doomsday." },
  watch: { Body: WatchStep, alt: true, description: "Three watch lists for Avengers: Doomsday, with every title linked to its Disney+ page." },
  universes: { Body: UniversesStep, description: "Earth-616, Earth-828 and Earth-10005: the three universes colliding in Doomsday." },
  characters: { Body: CharactersStep, alt: true, description: "Doctor Doom and the confirmed Avengers: Doomsday roster, plus the rumored extras." },
};

export function generateStaticParams() {
  return GUIDE_STEPS.map((s) => ({ step: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[step]">): Promise<Metadata> {
  const step = findStep((await params).step);
  return step ? { title: step.title, description: STEP[step.slug].description } : {};
}

export default async function GuideStepPage({ params }: PageProps<"/guide/[step]">) {
  const step = findStep((await params).step);
  if (!step) notFound();
  const i = GUIDE_STEPS.indexOf(step);
  const prev = GUIDE_STEPS[i - 1];
  const next = GUIDE_STEPS[i + 1];
  const { Body, alt } = STEP[step.slug];
  return (
    <main>
      <section id={step.legacyId} className={alt ? "alt" : undefined}>
        <div className="wrap">
          <Crumb href="/guide" parent="Doomsday Guide" label={`Step ${i + 1} of ${GUIDE_STEPS.length}`} />
          <Body />
          <Pager
            prev={prev ? { href: `/guide/${prev.slug}`, title: prev.title } : null}
            next={
              next
                ? { href: `/guide/${next.slug}`, title: next.title }
                : { href: "/mcu", top: "Done? Go deeper →", title: "MCU Explained" }
            }
          />
        </div>
      </section>
    </main>
  );
}

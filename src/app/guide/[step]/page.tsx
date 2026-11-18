import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageStub } from "@/components/PageStub";
import { findStep, GUIDE_STEPS } from "@/lib/routes";

export function generateStaticParams() {
  return GUIDE_STEPS.map((s) => ({ step: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[step]">): Promise<Metadata> {
  const step = findStep((await params).step);
  return step ? { title: step.title } : {};
}

export default async function GuideStepPage({ params }: PageProps<"/guide/[step]">) {
  const { step: slug } = await params;
  const step = findStep(slug);
  if (!step) notFound();
  const n = GUIDE_STEPS.indexOf(step) + 1;
  return (
    <PageStub
      crumbs={[{ href: "/guide", label: "Doomsday Guide" }]}
      kicker={`Step ${n} of ${GUIDE_STEPS.length}`}
      title={step.title}
    />
  );
}

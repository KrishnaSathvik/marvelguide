import type { Metadata } from "next";
import { pageMeta, jsonLd } from "@/lib/seo";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Spoiler } from "@/components/Spoiler";
import { FAQ } from "@/content";
import { faqParts, faqPlain, isFaqLink, type FaqPart } from "@/lib/faq";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = pageMeta({
  title: "Avengers: Doomsday FAQ",
  description:
    "Answers fans ask before Avengers: Doomsday, including what to watch and whether Doctor Doom is a Tony Stark variant.",
  path: "/faq",
});

const groups = [...new Set(FAQ.map((q) => q.g))];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((q) => ({
    "@type": "Question",
    name: q.q,
    acceptedAnswer: { "@type": "Answer", text: faqPlain(q.a) },
  })),
};

function FaqAnchor({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** First time a destination appears it stays a link. Later copies are plain text. */
function firstTime(seen: Set<string>, href: string) {
  if (seen.has(href)) return false;
  seen.add(href);
  return true;
}

function AnswerText({ parts, seen }: { parts: FaqPart[]; seen: Set<string> }) {
  return parts.map((part, i) =>
    part.type === "link" && firstTime(seen, part.href) ? (
      <FaqAnchor key={i} href={part.href}>
        {part.label}
      </FaqAnchor>
    ) : (
      <Fragment key={i}>{part.type === "link" ? part.label : part.text}</Fragment>
    ),
  );
}

export default function FaqPage() {
  return (
    <main>
      <script type="application/ld+json">{jsonLd(faqSchema)}</script>
      <section id="faq">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv">
            <Icon name="circle-help" />
            <em style={{ color: "#fff" }}>Fan questions</em>
          </span>
          <h1 className="h2 rv">
            Your questions, <span className="r">answered</span>
          </h1>
          <p className="lede rv">
            The things fans keep asking on Reddit and social media before Doomsday, answered with what Marvel has
            actually said.
          </p>
          <div id="qas">
            <FaqAnswers />
          </div>
        </div>
      </section>
    </main>
  );
}

function FaqAnswers() {
  const seen = new Set<string>();
  return groups.map((g) => (
    <Fragment key={g}>
      <h2 className="qg rv">{g}</h2>
      <div className="grid g2">
        {FAQ.map((q, i) =>
          q.g !== g ? null : (
            <article key={q.q} className="qa rv" id={`faq-${i + 1}`}>
              <h3 className="qh">
                <Icon name="circle-help" />
                <span>{q.q}</span>
              </h3>
              <Answer q={q} seen={seen} />
            </article>
          ),
        )}
      </div>
    </Fragment>
  ));
}

/**
 * Spoiler answers stay blurred. Their links sit under the spoiler so a link is not nested inside the reveal button.
 * A destination already linked higher on the page is left out.
 */
function Answer({ q, seen }: { q: (typeof FAQ)[number]; seen: Set<string> }) {
  const parts = faqParts(q.a);
  if (!q.sp) {
    return (
      <p>
        <AnswerText parts={parts} seen={seen} />
      </p>
    );
  }
  const links = parts.filter(isFaqLink).filter((part) => firstTime(seen, part.href));
  return (
    <>
      <Spoiler style={{ margin: "14px 18px 16px" }}>
        <p style={{ padding: 0 }}>{faqPlain(q.a)}</p>
      </Spoiler>
      {links.length > 0 && (
        <p>
          {links.map((part, i) => (
            <Fragment key={part.href}>
              {i > 0 && " · "}
              <FaqAnchor href={part.href}>{part.label}</FaqAnchor>
            </Fragment>
          ))}
        </p>
      )}
    </>
  );
}

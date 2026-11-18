import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = pageMeta({
  title: "Doomsday Guide",
  description:
    "Ready for Avengers: Doomsday in 4 steps: the story so far, what to watch, the 3 universes and the characters.",
  path: "/guide",
});

const STEPS = [
  { href: "/guide/story", b: "Catch up on the story", s: "Seven chapters, from Endgame to Doom" },
  { href: "/guide/watch", b: "Pick what to watch", s: "5, 15 or 21 titles" },
  { href: "/guide/universes", b: "Learn the 3 universes", s: "Who's colliding" },
  { href: "/guide/characters", b: "Meet the characters", s: "Doom, 32 confirmed, Scarlet Witch set up on screen and 2 rumored" },
];

export default function GuidePage() {
  return (
    <main>
      <section id="guide-top" className="gintro">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv">
            <Icon name="flame" />
            The Doomsday Guide
          </span>
          <h1 className="h2 rv">
            Ready for Doomsday in <span className="r">4 steps</span>
          </h1>
          <p className="lede rv">
            Each step is its own short page. Start at 1 and use Next, or jump to the step you need. It&apos;s
            spoiler-light: anything that gives away recent shows is hidden until you tap it.
          </p>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.href} className="rv">
                <Link href={s.href} prefetch>
                  <span className="n">{i + 1}</span>
                  <b>{s.b}</b>
                  <small>{s.s}</small>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

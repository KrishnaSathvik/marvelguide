import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { MCU_GROUPS } from "@/lib/routes";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "MCU Explained",
  description:
    "The MCU reference library in five sections: basics, the Infinity Saga, characters, the multiverse and a toolkit of tech, maps and watch orders.",
};

const SURE = [
  {
    t: "canon",
    l: "Canon",
    b: "It's official",
    p: "It happened on screen, or Marvel Studios said it officially. Treat it as fact.",
    e: "Example: Thanos snapped away half of all life.",
  },
  {
    t: "soft",
    l: "Soft canon",
    b: "Strongly hinted",
    p: "Shown in passing, implied or confirmed outside the films, but never fully spelled out on screen.",
    e: "Example: exactly how people cross between universes.",
  },
  {
    t: "theory",
    l: "Theory",
    b: "A reasoned guess",
    p: "What fans, or we, expect based on the clues. Marvel hasn't confirmed it.",
    e: "Example: the Young Avengers forming.",
  },
  {
    t: "edit",
    l: "Editorial",
    b: "Our opinion",
    p: "Our own rankings and judgment calls, like power tiers and villain threat levels.",
    e: "Example: ranking Thanos above Galactus.",
  },
];

export default function McuPage() {
  return (
    <main>
      <section id="encyclopedia" className="gintro">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv">
            <Icon name="library" />
            MCU Explained
          </span>
          <h1 className="h2 rv">
            The MCU, <span className="r">explained</span>
          </h1>
          <p className="lede rv">
            The Guide tells you what to watch before Doomsday. This is the reference library for everything else, split
            into five sections. Open any one and read it like a chapter.
          </p>
          <ol className="steps steps5">
            {MCU_GROUPS.map((g) => (
              <li key={g.slug} className="rv">
                <Link href={`/mcu/${g.slug}`} prefetch>
                  <span className="n">
                    <Icon name={g.icon} />
                  </span>
                  <b>{g.title}</b>
                  <small>{g.description}</small>
                  <em>{g.chapters.map((c) => c.title).join(" · ")}</em>
                </Link>
              </li>
            ))}
          </ol>
          <div className="sure rv">
            <h3>How sure are we?</h3>
            <p>Every fact in MCU Explained carries one of four labels, so you always know how solid it is.</p>
            <div className="sure4">
              {SURE.map((s) => (
                <div key={s.t}>
                  <span className={`tag ${s.t}`}>{s.l}</span>
                  <b>{s.b}</b>
                  <p>{s.p}</p>
                  <small>{s.e}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { LINKS } from "@/content";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Official links",
  description: "Official Avengers: Doomsday links: Marvel.com, the trailer, tickets, Disney+ and TMDB.",
};

export default function LinksPage() {
  return (
    <main>
      <section id="official">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv">
            <Icon name="star" />
            Straight from the source
          </span>
          <h1 className="h2 rv">
            Official <span className="r">links</span>
          </h1>
          <p className="lede rv">Everything you need, in one place.</p>
          <div className="grid g5">
            {LINKS.map((l, i) => (
              <a key={l.u} className="lc rv" id={`link-${i}`} href={l.u} target="_blank" rel="noopener noreferrer">
                <span className="ib">
                  <Icon name={l.i} />
                </span>
                <small>{l.k}</small>
                <b>{l.b}</b>
                <span>{l.s}</span>
                <span className="u">
                  Open <Icon name="external-link" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

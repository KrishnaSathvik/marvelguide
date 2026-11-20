import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Art } from "@/components/Art";
import { Countdown } from "@/components/Countdown";
import { HeroSearch } from "@/components/HeroSearch";
import { Icon } from "@/components/Icon";

const HOME_TITLE = "What to Watch Before Avengers: Doomsday · Marvel Guide";
const home = pageMeta({
  description:
    "What to watch before Avengers: Doomsday, plus the MCU timeline, the cast, and how the multiverse fits together.",
  path: "/",
});

// The root page shares the layout's segment, so the "%s · Marvel Guide" template does not apply here.
export const metadata: Metadata = {
  ...home,
  title: { absolute: HOME_TITLE },
  openGraph: { ...home.openGraph, title: HOME_TITLE },
  twitter: { ...home.twitter, title: HOME_TITLE },
};

export default function HomePage() {
  return (
    <main>
      <section id="hero" className="hero">
        <div className="speed" />
        <div className="wrap hero-grid">
          <div>
            <h1>
              <span className="l1">Before you see</span>
              <span className="l2">Doomsday</span>
              <span className="l3">Know the whole MCU.</span>
            </h1>
            <p className="sub">What to watch, who&apos;s back, and what all the multiverse jargon means. Search anything:</p>
            <HeroSearch />
            <Countdown />
            <div className="facts">
              <div className="fact">
                <Icon name="clapperboard" />
                <b>Dir. Anthony &amp; Joe Russo</b>
              </div>
              <div className="fact">
                <Icon name="flame" />
                <b>RDJ as Doctor Doom</b>
              </div>
              <div className="fact">
                <Icon name="layers" />
                <b>Secret Wars · Dec 17, 2027</b>
              </div>
            </div>
            <div className="ctas">
              <Link className="btn red" href="/guide/story">
                <Icon name="flame" />
                Start the guide
              </Link>
              <a className="btn" href="https://www.youtube.com/watch?v=irVNGjRFZGk" target="_blank" rel="noopener noreferrer">
                <Icon name="play" />
                Official trailer
              </a>
              <a className="btn yellow" href="https://www.fandango.com/avengersdoomsday" target="_blank" rel="noopener noreferrer">
                <Icon name="ticket" />
                Tickets
              </a>
            </div>
          </div>
          <div className="hero-art">
            <span className="burst">Doom is coming!</span>
            <Art artKey="hero-poster" alt="Avengers: Doomsday key art" label="Key art" sizes="(max-width: 900px) 86vw, 420px" />
            <span className="tag2">DEC 18</span>
          </div>
        </div>
      </section>
    </main>
  );
}

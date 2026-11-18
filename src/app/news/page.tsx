import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Icon } from "@/components/Icon";
import { Spoiler } from "@/components/Spoiler";
import { Tag } from "@/components/ui";
import { NEWS, type NewsItem, type NewsPara } from "@/content";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = pageMeta({
  title: "News",
  description:
    "The latest Avengers: Doomsday news, sourced and labelled Official, Canon, Report or Unconfirmed.",
  path: "/news",
});

const TAG_CLASS: Record<NewsItem["tag"], string> = {
  Official: "canon",
  Canon: "canon",
  Report: "rumor",
  Unconfirmed: "rumor",
  Rumor: "rumor",
};


function Para({ p }: { p: NewsPara }) {
  if (typeof p === "string") return <p>{p}</p>;
  return (
    <p>
      <b style={{ color: "var(--yellow)" }}>{p.label}</b> {p.text} {p.tag && <Tag t={p.tag} />}
    </p>
  );
}

function Sources({ links }: { links: NewsItem["links"] }) {
  if (!links.length) return null;
  return (
    <div className="src">
      Sources:{" "}
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
          {l.name}
        </a>
      ))}
    </div>
  );
}

function Card({ n }: { n: NewsItem }) {
  return (
    <article className={n.big ? "nc big rv" : "nc rv"} id={n.id}>
      <div className="top">
        <small className="d">{n.source}</small>
        <span className={`tag ${TAG_CLASS[n.tag]}`}>{n.tag}</span>
      </div>
      <h3>{n.title}</h3>
      {n.body.map((p, i) => (
        <Para key={i} p={p} />
      ))}
      {n.spoiler && (
        <Spoiler>
          {n.spoiler.map((p, i) => (
            <Para key={i} p={p} />
          ))}
        </Spoiler>
      )}
      {n.spoilerList && (
        <Spoiler>
          <ul>
            {n.spoilerList.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        </Spoiler>
      )}
      <Sources links={n.links} />
    </article>
  );
}

const section = (s: NewsItem["section"]) => NEWS.filter((n) => n.section === s);

export default function NewsPage() {
  return (
    <main>
      <section id="latest" className="newspage">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv" style={{ background: "var(--red)" }}>
            <Icon name="zap" />
            Latest news
          </span>
          <h1 className="h2 rv">
            Breaking: <span className="r">the final countdown</span>
          </h1>
          <p className="lede rv">
            Thirty days out, the last trailer is due, the runtime has leaked, and Endgame: Encore is on Disney+. Below
            that, the VisionQuest finale, whose post-credits scene leads straight into Doomsday.
          </p>
          <div className="news">
            {section("latest").map((n) => (
              <Card key={n.id} n={n} />
            ))}
          </div>
          <h2 className="h3 rv">
            <small>Episode 8 “Forever”</small>The VisionQuest finale
          </h2>
          <div className="alert rv">
            <Icon name="eye" />
            Spoilers for VisionQuest and the Doomsday tease are hidden. Tap a striped box to reveal
          </div>
          <div className="news">
            {section("visionquest").map((n) => (
              <Card key={n.id} n={n} />
            ))}
          </div>
          <h2 className="h3 rv">
            <small>Unconfirmed · same week</small>The rumor mill
          </h2>
          <div className="rumors">
            {section("rumors").map((n) => (
              <div key={n.id} className="rm rv" id={n.id}>
                <span className="tag rumor">{n.tag}</span>
                <h3 className="rmh">{n.title}</h3>
                {n.body.map((p, i) => (
                  <Para key={i} p={p} />
                ))}
                <Sources links={n.links} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { Spoiler } from "@/components/Spoiler";
import { Tag } from "@/components/ui";
import { NEWS, type NewsItem, type NewsPara } from "@/content";

export const metadata: Metadata = {
  title: "News",
  description: "The latest Avengers: Doomsday news, dated and sourced, each labelled Official, Canon, Report or Unconfirmed.",
};

const TAG_CLASS: Record<NewsItem["tag"], string> = {
  Official: "canon",
  Canon: "canon",
  Report: "rumor",
  Unconfirmed: "rumor",
  Rumor: "rumor",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-11-13" → "Nov 13" (parsed by hand so the server's time zone can't shift the day). */
const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};
const dateline = (n: NewsItem) => [n.date && shortDate(n.date), n.source].filter(Boolean).join(" · ");

function Para({ p }: { p: NewsPara }) {
  if (typeof p === "string") return <p>{p}</p>;
  return (
    <p>
      <b style={{ color: "var(--yellow)" }}>{p.label}</b> {p.text} {p.tag && <Tag t={p.tag} />}
    </p>
  );
}

function Card({ n }: { n: NewsItem }) {
  return (
    <article className={n.big ? "nc big rv" : "nc rv"} id={n.id}>
      <div className="top">
        <small className="d">{n.date ? <time dateTime={n.date}>{dateline(n)}</time> : dateline(n)}</small>
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
      {n.links.length > 0 && (
        <div className="src">
          Sources:{" "}
          {n.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
              {l.name}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

const section = (s: NewsItem["section"]) => NEWS.filter((n) => n.section === s);

export default function NewsPage() {
  return (
    <main>
      <section id="latest" className="newspage">
        <div className="wrap">
          <span className="kicker rv" style={{ background: "var(--red)" }}>
            <Icon name="zap" />
            Week of Nov 16, 2026
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
            <small>Nov 10 · Episode 8 “Forever”</small>The VisionQuest finale
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

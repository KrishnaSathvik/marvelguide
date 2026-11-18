import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/* Small shared building blocks that mirror legacy markup/classes. */

const TAGS: Record<string, [string, string]> = {
  canon: ["canon", "Canon"],
  soft: ["soft", "Soft canon"],
  theory: ["theory", "Theory"],
  edit: ["edit", "Editorial"],
  rumor: ["rumor", "Rumor"],
};

/** Certainty label (legacy `tagH`). */
export function Tag({ t }: { t?: string }) {
  const v = t && TAGS[t];
  if (!v) return null;
  return <span className={`tag ${v[0]}`}>{v[1]}</span>;
}

/** Kicker + big heading + lede at the top of a section (legacy `.kicker` / `.h2` / `.lede`). */
export function SectionHead({
  icon,
  kicker,
  title,
  accent,
  after,
  lede,
}: {
  icon: string;
  kicker: string;
  /** Heading text before the red accent. */
  title: string;
  /** Red part of the heading. */
  accent?: string;
  /** Heading text after the red accent. */
  after?: string;
  lede?: ReactNode;
}) {
  return (
    <>
      <span className="kicker rv">
        <Icon name={icon} />
        <em style={{ color: "#fff" }}>{kicker}</em>
      </span>
      <h1 className="h2 rv">
        {title}
        {accent && (
          <>
            {" "}
            <span className="r">{accent}</span>
          </>
        )}
        {after && <> {after}</>}
      </h1>
      {lede && <p className="lede rv">{lede}</p>}
    </>
  );
}

/** Breadcrumb: parent link › current label (legacy `.crumb`). */
export function Crumb({ href, parent, label }: { href: string; parent: string; label: string }) {
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      <Link href={href}>{parent}</Link>
      <span aria-hidden="true">›</span>
      <span>{label}</span>
    </nav>
  );
}

type PagerLink = { href: string; title: string; top?: string } | null;

/** Back / Next pager at the bottom of each step (legacy `.pager`). */
export function Pager({ prev, next }: { prev: PagerLink; next: PagerLink }) {
  return (
    <nav className="pager" aria-label="Pages">
      {prev ? (
        <Link className="pv" href={prev.href} prefetch>
          <small>{prev.top ?? "← Back"}</small>
          <b>{prev.title}</b>
        </Link>
      ) : (
        <span className="pv sp" aria-hidden="true">
          <small>.</small>
          <b>.</b>
        </span>
      )}
      {next ? (
        <Link className="nx" href={next.href} prefetch>
          <small>{next.top ?? "Next →"}</small>
          <b>{next.title}</b>
        </Link>
      ) : (
        <span className="nx sp" aria-hidden="true">
          <small>.</small>
          <b>.</b>
        </span>
      )}
    </nav>
  );
}

/**
 * Alternating image/text row (legacy `.chap`): image on one side, text on the other, flipped on odd rows.
 * `media` is the image column contents (an <Art/> plus any badges).
 */
export function Row({
  id,
  index,
  className,
  style,
  media,
  children,
}: {
  id?: string;
  index: number;
  className?: string;
  style?: React.CSSProperties;
  media: ReactNode;
  children: ReactNode;
}) {
  return (
    <article id={id} className={["chap rv", className, index % 2 ? "flip" : ""].filter(Boolean).join(" ")} style={style}>
      <div className="cimg">{media}</div>
      <div className="ctx">{children}</div>
    </article>
  );
}

/** "How it leads to Doomsday" style callout inside a row (legacy `.lead`). */
export function Lead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="lead">
      <Icon name="arrow-right" />
      <div>
        <b>{title}</b>
        <p>{children}</p>
      </div>
    </div>
  );
}

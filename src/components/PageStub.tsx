import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href: string; label: string };

/** Phase 1 placeholder: real content is ported from legacy/index.html in Phase 2. */
export function PageStub({
  crumbs,
  kicker,
  title,
  lede,
  children,
}: {
  crumbs?: Crumb[];
  kicker: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <main className="wrap w-full py-14 sm:py-20">
      {crumbs && crumbs.length > 0 && (
        <nav className="crumb" aria-label="Breadcrumb">
          {crumbs.map((c) => (
            <span key={c.href} className="contents">
              <Link href={c.href}>{c.label}</Link>
              <span aria-hidden="true">›</span>
            </span>
          ))}
          <span>{title}</span>
        </nav>
      )}
      <span className="kicker">{kicker}</span>
      <h1 className="mt-4 font-head text-5xl leading-none uppercase sm:text-7xl">{title}</h1>
      {lede && <p className="mt-4 max-w-2xl text-lg text-ink2">{lede}</p>}
      {children}
    </main>
  );
}

export function CardGrid({ items }: { items: { href: string; title: string; text?: string; tag?: string }[] }) {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.href}>
          <Link
            href={it.href}
            className="box block h-full no-underline transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            {it.tag && (
              <span className="font-label text-xs font-bold tracking-[0.14em] text-red uppercase">{it.tag}</span>
            )}
            <h2 className="font-head text-3xl leading-none uppercase">{it.title}</h2>
            {it.text && <p className="mt-2 text-ink2">{it.text}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

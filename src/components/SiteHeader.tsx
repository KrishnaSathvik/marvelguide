"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GUIDE_STEPS, MCU_GROUPS, mcuGroupHref, TABS } from "@/lib/routes";
import { openSearch } from "@/lib/search-events";
import { Icon } from "./Icon";

const isActiveTab = (pathname: string, href: string, match?: string) => {
  const base = match ?? href;
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(base + "/");
};

type SubItem = { href: string; label: string; active: boolean };

/** Sub-nav only inside a section (never on the hub/overview pages). */
function subnavFor(pathname: string): { items: SubItem[] } | null {
  const [, section, first] = pathname.split("/");
  if (section === "guide" && first) {
    return {
      items: GUIDE_STEPS.map((s, i) => ({
        href: `/guide/${s.slug}`,
        label: `${i + 1} ${s.label}`,
        active: s.slug === first,
      })),
    };
  }
  if (section === "mcu" && first) {
    return {
      items: MCU_GROUPS.map((g, i) => ({
        href: mcuGroupHref(g),
        label: `${i + 1} ${g.title}`,
        active: g.slug === first,
      })),
    };
  }
  return null;
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const sub = subnavFor(pathname);
  const subRef = useRef<HTMLElement>(null);
  // Keep the active sub-nav item visible on phones, where the sub-nav scrolls sideways (as in legacy).
  useEffect(() => {
    const sn = subRef.current;
    const a = sn?.querySelector<HTMLElement>("a[aria-current]");
    if (sn && a) sn.scrollLeft = a.offsetLeft - sn.clientWidth / 2 + a.offsetWidth / 2;
  }, [pathname]);
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Marvel Guide home">
            <Image src="/brand/wordmark.png" alt="Marvel Guide" width={640} height={135} priority sizes="200px" />
          </Link>
          <nav className="tabsnav" aria-label="Pages">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={"homeOnly" in t ? "hm" : undefined}
                aria-current={isActiveTab(pathname, t.href, "match" in t ? t.match : undefined) ? "page" : undefined}
              >
                {"short" in t ? (
                  <>
                    <span className="lg">{t.label}</span>
                    <span className="sm">{t.short}</span>
                  </>
                ) : (
                  t.label
                )}
              </Link>
            ))}
          </nav>
          <button type="button" className="hdr-search" onClick={openSearch} aria-label="Search (press /)" title="Search (/)">
            <Icon name="search" />
          </button>
        </div>
      </header>
      {sub && (
        <nav className="subnav" aria-label="Sections" ref={subRef}>
          <div className="wrap">
            {sub.items.map((it) => (
              <Link key={it.href} href={it.href} prefetch aria-current={it.active ? "page" : undefined}>
                {it.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

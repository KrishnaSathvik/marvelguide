"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDE_STEPS, MCU_GROUPS, TABS } from "@/lib/routes";

const isActiveTab = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

type SubItem = { href: string; label: string; active: boolean };

/** Sub-nav only inside a section (never on the hub/overview pages). */
function subnavFor(pathname: string): { label: string; items: SubItem[] } | null {
  const [, section, first] = pathname.split("/");
  if (section === "guide" && first) {
    return {
      label: "Doomsday Guide",
      items: GUIDE_STEPS.map((s, i) => ({
        href: `/guide/${s.slug}`,
        label: `${i + 1} ${s.label}`,
        active: s.slug === first,
      })),
    };
  }
  if (section === "mcu" && first) {
    return {
      label: "MCU Explained",
      items: MCU_GROUPS.map((g, i) => ({
        href: `/mcu/${g.slug}`,
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
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Road to Doomsday home">
            <b>ROAD TO</b>
            <i>DOOMSDAY</i>
          </Link>
          <nav className="tabsnav" aria-label="Pages">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={"homeOnly" in t ? "hm" : undefined}
                aria-current={isActiveTab(pathname, t.href) ? "page" : undefined}
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
        </div>
      </header>
      {sub && (
        <nav className="subnav" aria-label="Sections">
          <div className="wrap">
            <span className="lbl">{sub.label}</span>
            {sub.items.map((it) => (
              <Link key={it.href} href={it.href} aria-current={it.active ? "page" : undefined}>
                {it.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}

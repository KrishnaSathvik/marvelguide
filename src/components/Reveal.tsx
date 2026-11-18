"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal for `.rv` (and the Sacred Timeline `.tsvg`) elements, like legacy.
 * Rendered inside each page (not the layout): React runs this effect only after the page's own
 * hydration commits, so it never touches server HTML that React has not hydrated yet.
 * Marks revealed elements with a `data-in` attribute rather than a class: React ignores attributes it
 * does not manage, so this never causes hydration mismatches or gets wiped when className changes.
 * `.rv` is only hidden when <html> has the `js` class (set inline in the layout), so content
 * is visible without JavaScript. Reduced motion is handled in CSS.
 */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".rv:not([data-in]), .tsvg:not([data-in])").forEach((n) => io.observe(n));
    scan();
    // Filters and tabs render new cards after mount.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}

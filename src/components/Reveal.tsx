"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal for `.rv` (and the Sacred Timeline `.tsvg`) elements, like legacy.
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
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".rv:not(.in), .tsvg:not(.in)").forEach((n) => io.observe(n));
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

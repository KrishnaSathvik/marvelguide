import { createElement } from "react";
import ICONS_ from "@data/site/ICONS.json";

/** Each icon is a list of [tag, attributes] shapes (Lucide icons extracted from the legacy site). */
const ICONS = ICONS_ as unknown as Record<string, [string, Record<string, string>][]>;
const SHAPES = new Set(["path", "circle", "line", "rect"]);

/** Inline icon with the same markup/classes as legacy `ico()`. Unknown names render an empty box. */
export function Icon({ name }: { name: string }) {
  const shapes = ICONS[name] ?? [];
  return (
    <span className="ico" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {shapes.map(([tag, attrs], i) => (SHAPES.has(tag) ? createElement(tag, { key: i, ...attrs }) : null))}
      </svg>
    </span>
  );
}

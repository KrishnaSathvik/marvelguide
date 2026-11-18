import type { CSSProperties } from "react";
import { artSrc } from "@/lib/art";
import { Icon } from "./Icon";

/**
 * An image frame keyed by the legacy `data-art` key. Shows the image when one exists,
 * otherwise the halftone placeholder with an icon and label (legacy `.art` / `.ph`).
 * `alt` must name what is pictured (film or character name), never a generic word like "Poster".
 */
export function Art({
  artKey,
  alt,
  label = "Image",
  icon = "image",
  color,
  className,
}: {
  artKey: string;
  alt: string;
  label?: string;
  icon?: string;
  color?: string;
  className?: string;
}) {
  const src = artSrc(artKey);
  const style = color ? ({ "--c": `${color}55`, "--c2": color } as CSSProperties) : undefined;
  return (
    <div className={["art", src ? "has" : "", className ?? ""].join(" ").trim()} data-art={artKey} style={style}>
      {src ? (
        // Phase 3 switches this to next/image once images come from Supabase Storage.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <div className="ph" role="img" aria-label={alt}>
          <Icon name={icon} />
          <small>{label}</small>
        </div>
      )}
    </div>
  );
}

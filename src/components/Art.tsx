import Image from "next/image";
import type { CSSProperties } from "react";
import { artFocus, artSrc } from "@/lib/art";
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
  sizes = "(max-width: 640px) 100vw, 50vw",
}: {
  artKey: string;
  alt: string;
  label?: string;
  icon?: string;
  color?: string;
  className?: string;
  /** Rendered width hint for next/image (defaults to half the viewport on desktop). */
  sizes?: string;
}) {
  const src = artSrc(artKey);
  const focus = artFocus(artKey);
  const style = color ? ({ "--c": `${color}55`, "--c2": color } as CSSProperties) : undefined;
  return (
    <div className={["art", src ? "has" : "", className ?? ""].join(" ").trim()} data-art={artKey} style={style}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} style={focus ? { objectPosition: focus } : undefined} />
      ) : (
        <div className="ph" role="img" aria-label={alt}>
          <Icon name={icon} />
          <small>{label}</small>
        </div>
      )}
    </div>
  );
}

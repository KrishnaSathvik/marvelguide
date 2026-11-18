"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useArt } from "./ArtProvider";
import { Icon } from "./Icon";

/**
 * An image frame keyed by the legacy `data-art` key. Shows the image when one exists,
 * otherwise the halftone placeholder with an icon and label (legacy `.art` / `.ph`).
 * `alt` must name what is pictured (film or character name), never a generic word like "Poster".
 * The key → URL map comes from <ArtProvider/> (Supabase `art` table, or images/ locally).
 */
export function Art({
  artKey,
  alt,
  label = "Image",
  icon = "image",
  color,
  className,
  sizes = "(max-width: 640px) 100vw, 50vw",
  fit = "cover",
}: {
  artKey: string;
  alt: string;
  label?: string;
  icon?: string;
  color?: string;
  className?: string;
  /** Rendered width hint for next/image (defaults to half the viewport on desktop). */
  sizes?: string;
  /**
   * "cover" fills the frame and crops. "contain" shows the whole picture and fills the leftover space with a
   * blurred copy of it, for frames whose shape follows the text beside them (side-by-side rows on desktop).
   */
  fit?: "cover" | "contain";
}) {
  const art = useArt(artKey);
  const style = color ? ({ "--c": `${color}55`, "--c2": color } as CSSProperties) : undefined;
  return (
    <div
      className={["art", art ? "has" : "", fit === "contain" ? "contain" : "", className ?? ""].filter(Boolean).join(" ")}
      data-art={artKey}
      style={style}
    >
      {art && fit === "contain" && (
        // Same src and sizes as the main image, so the browser reuses the download.
        <Image src={art.src} alt="" aria-hidden="true" fill sizes={sizes} className="bd" />
      )}
      {art ? (
        <Image
          src={art.src}
          alt={alt}
          fill
          sizes={sizes}
          style={art.focus ? { objectPosition: art.focus } : undefined}
        />
      ) : (
        <div className="ph" role="img" aria-label={alt}>
          <Icon name={icon} />
          <small>{label}</small>
        </div>
      )}
    </div>
  );
}

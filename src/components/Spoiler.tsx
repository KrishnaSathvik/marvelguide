"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

/** Blurred until tapped (legacy `.spoil` / `.sv`). Keyboard: Enter or Space reveals. */
export function Spoiler({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={open ? "spoil open" : "spoil"}
      style={style}
      role={open ? undefined : "button"}
      tabIndex={open ? undefined : 0}
      aria-label={open ? undefined : "Spoiler, activate to reveal"}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (!open && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      <div className="sv" aria-hidden={!open}>
        {children}
      </div>
    </div>
  );
}

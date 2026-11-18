"use client";

import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const FLAG = "mg-human-until";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export const turnstileOn = Boolean(SITE_KEY);

/** Whether this tab has passed the check recently (the real proof is the HttpOnly cookie on the server). */
export function humanVerified(): boolean {
  if (!SITE_KEY) return true;
  try {
    return Number(sessionStorage.getItem(FLAG) ?? 0) > Date.now();
  } catch {
    return false;
  }
}
export function forgetHuman() {
  try {
    sessionStorage.removeItem(FLAG);
  } catch {
    /* ignore */
  }
}

let loading: Promise<Turnstile> | null = null;
function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to load")));
    s.onerror = () => {
      loading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Cloudflare Turnstile widget. Calls onVerified once the server has accepted the token. */
export function HumanCheck({ onVerified }: { onVerified: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "checking" | "error">("loading");
  const done = useRef(onVerified);
  useEffect(() => {
    done.current = onVerified;
  });

  useEffect(() => {
    let id: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then((ts) => {
        if (cancelled || !box.current) return;
        id = ts.render(box.current, {
          sitekey: SITE_KEY,
          theme: "light",
          size: "flexible",
          action: "chat",
          callback: async (token: string) => {
            setState("checking");
            const r = await fetch("/api/chat/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            }).catch(() => null);
            if (r?.ok) {
              const { expiresIn = 3600 } = (await r.json()) as { expiresIn?: number };
              try {
                sessionStorage.setItem(FLAG, String(Date.now() + (expiresIn - 60) * 1000));
              } catch {
                /* ignore */
              }
              done.current();
            } else setState("error");
          },
          "error-callback": () => setState("error"),
          "expired-callback": () => setState("ready"),
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  return (
    <div className="chat-human">
      <p>Quick check before you ask (keeps the guide free for everyone):</p>
      <div ref={box} />
      {state === "loading" && <p className="chat-tool">Loading check…</p>}
      {state === "checking" && <p className="chat-tool">Verifying…</p>}
      {state === "error" && <p className="chat-error">The check didn&apos;t go through. Reload the page and try again.</p>}
    </div>
  );
}

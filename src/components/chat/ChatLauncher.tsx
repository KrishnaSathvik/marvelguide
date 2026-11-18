"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icon";
import { ChatBox } from "./ChatBox";

const noop = () => () => {};
/** True only in the browser after hydration (the chat keeps its history in sessionStorage). */
export const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/** Floating "Ask" button + panel on every page except /ask (AGENTS.md §7). */
export function ChatLauncher() {
  const pathname = usePathname();
  const isClient = useIsClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  if (!isClient || pathname === "/ask") return null;

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Ask the Marvel guide">
          <div className="chat-head">
            <b>Ask the guide</b>
            <Link href="/ask" onClick={() => setOpen(false)}>
              Full page
            </Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <Icon name="x" />
            </button>
          </div>
          <ChatBox autoFocus />
        </div>
      )}
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Ask the Marvel guide">
          <Icon name="sparkles" />
          Ask
        </button>
      )}
    </>
  );
}

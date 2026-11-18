"use client";

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

/** Floating "Ask" button + chat panel on every page except /ask (AGENTS.md §7). */
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

  return open ? (
    <div className="cb-panel-wrap" role="dialog" aria-label="Ask the Watcher">
      <ChatBox variant="panel" autoFocus onClose={() => setOpen(false)} />
    </div>
  ) : (
    <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Ask the Watcher">
      <Icon name="message-circle" />
      Ask the Watcher
    </button>
  );
}

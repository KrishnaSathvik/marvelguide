"use client";

import { ChatBox } from "./ChatBox";
import { useIsClient } from "./ChatLauncher";

/** Full-page chat on /ask (client-only: the conversation lives in sessionStorage). */
export function AskPageChat() {
  const isClient = useIsClient();
  return isClient ? <ChatBox variant="page" autoFocus /> : <div className="cb cb-page" aria-busy="true" />;
}

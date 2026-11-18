"use client";

import { ChatBox } from "./ChatBox";
import { useIsClient } from "./ChatLauncher";

/** Full-page chat on /ask (client-only: the conversation lives in sessionStorage). */
export function AskPageChat() {
  const isClient = useIsClient();
  return <div className="chat-page">{isClient ? <ChatBox autoFocus /> : null}</div>;
}

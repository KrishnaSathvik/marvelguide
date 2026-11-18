"use client";

import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

/**
 * One conversation shared by the floating panel and /ask, kept in sessionStorage (no accounts).
 * Each request sends the last 20 messages plus the page the visitor is on (page-aware answers).
 */
const KEY = "mg-chat-v1";
const MAX_SENT = 20;

function load(): UIMessage[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: UIMessage[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-40)));
  } catch {
    /* storage full or blocked: the chat still works for this page view */
  }
}

let chat: Chat<UIMessage> | null = null;

/** Client-only: call after mount. */
export function getChat(): Chat<UIMessage> {
  chat ??= new Chat<UIMessage>({
    id: "marvel-guide",
    messages: load(),
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages: messages.slice(-MAX_SENT),
          page: { path: location.pathname, title: document.title.replace(/ · Marvel Guide$/, ""), hash: location.hash || undefined },
        },
      }),
    }),
  });
  return chat;
}

/** True when the server rejected the request because the Turnstile check is missing or expired. */
export function needsVerification(err: Error | undefined): boolean {
  if (!err) return false;
  try {
    return Boolean((JSON.parse(err.message) as { needsVerification?: boolean }).needsVerification);
  } catch {
    return false;
  }
}

/** The route returns `{ "error": "…" }` for refusals like rate limits; show that text when present. */
export function friendlyError(err: Error | undefined): string | null {
  if (!err) return null;
  try {
    const parsed = JSON.parse(err.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return "Something went wrong. Please try again.";
}

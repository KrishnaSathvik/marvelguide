"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "@/components/Icon";
import { friendlyError, getChat, saveMessages } from "./chat-store";

const SUGGESTIONS = [
  "Why did Doctor Strange give Thanos the Time Stone?",
  "Explain the Sacred Timeline",
  "What should I watch before Doomsday?",
  "Is Doctor Doom a variant of Tony Stark?",
];
const MAX_CHARS = 800;

/** Links in answers: site pages stay in the app, everything else opens in a new tab. */
function MdLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function ToolNote({ type, state }: { type: string; state?: string }) {
  if (state === "output-available" || state === "output-error") return null;
  const label = type === "tool-search_web" ? "Checking trusted sources…" : "Looking through the guide…";
  return <p className="chat-tool">{label}</p>;
}

function Message({ m }: { m: UIMessage }) {
  return (
    <div className={`chat-msg ${m.role}`}>
      {m.parts.map((p, i) => {
        if (p.type === "text")
          return m.role === "assistant" ? (
            <ReactMarkdown key={i} components={{ a: MdLink }}>
              {p.text}
            </ReactMarkdown>
          ) : (
            <p key={i}>{p.text}</p>
          );
        if (p.type.startsWith("tool-")) return <ToolNote key={i} type={p.type} state={(p as { state?: string }).state} />;
        return null;
      })}
    </div>
  );
}

/** The conversation itself; used in the floating panel and on /ask. Render only after mount. */
export function ChatBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ chat: getChat() });
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => saveMessages(messages), [messages]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, status]);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    clearError();
    sendMessage({ text: t.slice(0, MAX_CHARS) });
    setInput("");
  };

  const waiting = status === "submitted" || (busy && messages[messages.length - 1]?.role === "user");
  const errText = friendlyError(error);

  return (
    <div className="chat-box">
      <div className="chat-list" ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Ask anything about Marvel: the films, the lore, the comics, or what&apos;s coming in Doomsday.</p>
            <div className="chat-suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} m={m} />
        ))}
        {waiting && <p className="chat-tool">Thinking…</p>}
        {errText && (
          <p className="chat-error" role="alert">
            {errText}
          </p>
        )}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask about the MCU…"
          aria-label="Your question"
          maxLength={MAX_CHARS}
          rows={2}
        />
        {busy ? (
          <button type="button" className="chat-send" onClick={() => stop()} aria-label="Stop">
            <Icon name="x" />
          </button>
        ) : (
          <button type="submit" className="chat-send" disabled={!input.trim()} aria-label="Send">
            <Icon name="arrow-right" />
          </button>
        )}
      </form>
      <div className="chat-foot">
        <span>Unofficial fan guide. It can be wrong; rumors are labelled.</span>
        {messages.length > 0 && !busy && (
          <button type="button" onClick={() => setMessages([])}>
            Clear chat
          </button>
        )}
      </div>
    </div>
  );
}

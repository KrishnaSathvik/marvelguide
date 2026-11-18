"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "@/components/Icon";
import { friendlyError, getChat, needsVerification, saveMessages } from "./chat-store";
import { HumanCheck, humanVerified } from "./HumanCheck";

const STARTERS: { icon: string; text: string }[] = [
  { icon: "hourglass", text: "Why did Doctor Strange give Thanos the Time Stone?" },
  { icon: "git-branch", text: "Explain the Sacred Timeline" },
  { icon: "monitor-play", text: "What should I watch before Doomsday?" },
  { icon: "crown", text: "Is Doctor Doom a variant of Tony Stark?" },
];
const MAX_CHARS = 800;

/** The Watcher's avatar: the mascot in a comic badge. */
export function GuideAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={`cb-avatar ${size}`} aria-hidden="true">
      <Image src="/brand/watcher.png" alt="" width={256} height={256} sizes={size === "lg" ? "64px" : "34px"} />
    </span>
  );
}

/** Links in answers: site pages stay in the app, everything else opens in a new tab. */
function MdLink({ href = "", children }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const textOf = (m: UIMessage) =>
  m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n\n");

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="cb-act"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      aria-label={copied ? "Copied" : "Copy answer"}
      title={copied ? "Copied" : "Copy"}
    >
      <Icon name={copied ? "check" : "copy"} />
    </button>
  );
}

function Row({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  return (
    <div className={`cb-row ${role}`}>
      {role === "assistant" && <GuideAvatar />}
      <div className="cb-content">{children}</div>
    </div>
  );
}

/** Live status while the guide works: typing dots, or what it's looking up. */
function Working({ m }: { m?: UIMessage }) {
  const tool = m?.parts.findLast((p) => p.type.startsWith("tool-")) as { type: string; state?: string } | undefined;
  const looking = tool && tool.state !== "output-available" && tool.state !== "output-error";
  return (
    <Row role="assistant">
      {looking ? (
        <span className="cb-status">
          <span className="cb-spin" />
          {tool.type === "tool-search_web" ? "Searching trusted sources…" : "Looking through the guide…"}
        </span>
      ) : (
        <span className="cb-typing" aria-label="The Watcher is typing">
          <i />
          <i />
          <i />
        </span>
      )}
    </Row>
  );
}

function Empty({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="cb-empty">
      <GuideAvatar size="lg" />
      <h2>Ask the Watcher</h2>
      <p>Films, lore, comics and the road to Doomsday. Answers come from this guide first, then trusted sources.</p>
      <div className="cb-starters">
        {STARTERS.map((s) => (
          <button key={s.text} type="button" onClick={() => onPick(s.text)}>
            <Icon name={s.icon} />
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The chat app, shared by the floating panel (variant "panel") and /ask (variant "page").
 * Client-only: render after mount (history lives in sessionStorage).
 */
export function ChatBox({
  variant,
  autoFocus = false,
  onClose,
}: {
  variant: "panel" | "page";
  autoFocus?: boolean;
  onClose?: () => void;
}) {
  const { messages, sendMessage, status, error, stop, setMessages, clearError, regenerate } = useChat({
    chat: getChat(),
  });
  const [input, setInput] = useState("");
  const [human, setHuman] = useState(humanVerified);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => saveMessages(messages), [messages]);

  // Follow new text only while the reader is at the bottom (don't yank them back up the page).
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Grow the input with its content (1-6 lines).
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 6 * 24 + 20)}px`;
  }, [input]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    clearError();
    stick.current = true;
    sendMessage({ text: t.slice(0, MAX_CHARS) });
    setInput("");
  };

  // Show the check when this tab hasn't passed it, or the server says the 12h cookie is missing/expired.
  const expired = needsVerification(error);
  const showCheck = !human || expired;
  const errText = expired ? null : friendlyError(error);
  const last = messages[messages.length - 1];
  const working = busy && (last?.role === "user" || !textOf(last));

  return (
    <div className={`cb cb-${variant}`}>
      <header className="cb-head">
        <GuideAvatar />
        <div className="cb-who">
          <b>The Watcher</b>
          <span>
            <i className="cb-dot" />
            {busy ? "Typing…" : "Fan guide · labels rumors as rumors"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            className="cb-act"
            onClick={() => {
              stop();
              clearError();
              setMessages([]);
              inputRef.current?.focus();
            }}
            aria-label="New chat"
            title="New chat"
          >
            <Icon name="square-pen" />
          </button>
        )}
        {variant === "panel" && (
          <>
            <Link href="/ask" className="cb-act" aria-label="Open full page" title="Full page" onClick={onClose}>
              <Icon name="maximize-2" />
            </Link>
            <button type="button" className="cb-act" onClick={onClose} aria-label="Close" title="Close">
              <Icon name="x" />
            </button>
          </>
        )}
      </header>

      <div
        className="cb-list"
        ref={listRef}
        aria-live="polite"
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        <div className="cb-inner">
          {messages.length === 0 && <Empty onPick={send} />}
          {messages.map((m, i) => {
            const text = textOf(m);
            if (m.role === "user")
              return (
                <Row key={m.id} role="user">
                  <p className="cb-bubble">{text}</p>
                </Row>
              );
            if (!text) return null;
            const streaming = busy && i === messages.length - 1;
            return (
              <Row key={m.id} role="assistant">
                <div className="cb-answer">
                  <ReactMarkdown components={{ a: MdLink }}>{text}</ReactMarkdown>
                </div>
                {!streaming && (
                  <div className="cb-tools">
                    <CopyButton text={text} />
                  </div>
                )}
              </Row>
            );
          })}
          {working && <Working m={last?.role === "assistant" ? last : undefined} />}
          {errText && (
            <Row role="assistant">
              <div className="cb-error" role="alert">
                <span>{errText}</span>
                {!busy && last?.role === "user" && (
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      regenerate();
                    }}
                  >
                    <Icon name="rotate-ccw" /> Try again
                  </button>
                )}
              </div>
            </Row>
          )}
        </div>
      </div>

      <div className="cb-dock">
        {showCheck ? (
          <HumanCheck
            onVerified={() => {
              clearError();
              setHuman(true);
            }}
          />
        ) : (
          <form
            className="cb-compose"
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
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about the MCU…"
              aria-label="Your question"
              maxLength={MAX_CHARS}
              rows={1}
            />
            {busy ? (
              <button type="button" className="cb-send stop" onClick={() => stop()} aria-label="Stop answering">
                <Icon name="square" />
              </button>
            ) : (
              <button type="submit" className="cb-send" disabled={!input.trim()} aria-label="Send">
                <Icon name="send" />
              </button>
            )}
          </form>
        )}
        <p className="cb-note">Unofficial fan guide. It can make mistakes, and rumors are labelled as rumors.</p>
      </div>
    </div>
  );
}

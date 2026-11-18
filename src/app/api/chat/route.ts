/**
 * POST /api/chat — the Marvel guide chatbot (AGENTS.md §8, Phase 5).
 *
 * Order of operations: availability gate → input validation → rate limit → daily spend cap →
 * site knowledge → stream from the primary model (tools: search_site, search_web) → fall back to the
 * secondary model if the primary errors or ends without writing any text → log usage and add to today's spend.
 */
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";
import { chatAvailability, costUsd, FALLBACK_MODEL, LIMITS, PRIMARY_MODEL } from "@/lib/chat/config";
import { isHuman, turnstileEnabled } from "@/lib/chat/human";
import { contextBlock, SYSTEM_PROMPT } from "@/lib/chat/prompt";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import { formatDocs, isNewsQuestion, newsDocs, pageDocs, searchSite } from "@/lib/chat/site-knowledge";
import { sbRpc, sbSelect, sbUpsert } from "@/lib/chat/supabase";
import { searchWeb } from "@/lib/chat/web";

export const maxDuration = 60;

const Body = z.object({
  messages: z.array(z.custom<UIMessage>((m) => typeof m === "object" && m !== null && "role" in m && "parts" in m)).min(1),
  page: z
    .object({ path: z.string().max(200), title: z.string().max(200).optional(), hash: z.string().max(120).optional() })
    .optional(),
});

const json = (status: number, error: string, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json", ...extra } });

const textOf = (m: UIMessage) =>
  m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();

export async function POST(req: Request) {
  const started = Date.now();

  const availability = chatAvailability();
  if (!availability.open) return json(503, availability.reason);

  // Rate limit before doing any work, so malformed or oversized requests count too.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const limited = await checkRateLimit(ip);
  if (!limited.ok)
    return json(429, "You're asking faster than I can keep up. Try again in a moment.", {
      "Retry-After": String(limited.retryAfterSec),
    });

  // Turnstile: the visitor must have passed the check (signed cookie from /api/chat/verify).
  if (turnstileEnabled() && !isHuman(req.headers.get("cookie")))
    return new Response(JSON.stringify({ error: "Please confirm you're human first.", needsVerification: true }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return json(400, "Bad request.");
  }
  const history = body.messages.slice(-LIMITS.maxHistory);
  const last = history[history.length - 1];
  const question = last?.role === "user" ? textOf(last) : "";
  if (!question) return json(400, "Ask a question.");
  if (question.length > LIMITS.maxInputChars) return json(413, `Keep questions under ${LIMITS.maxInputChars} characters.`);

  const today = new Date().toISOString().slice(0, 10);
  const spend = await sbSelect<{ usd: string }>(`chat_spend?select=usd&day=eq.${today}`);
  // Production fails closed: without a readable spend counter there is no spend cap.
  if (spend === null && process.env.NODE_ENV === "production" && process.env.CHAT_FORCE_ENABLED !== "true")
    return json(503, "The guide is offline right now.");
  if (spend?.[0] && Number(spend[0].usd) >= LIMITS.dailySpendCapUsd)
    return json(503, "The guide has answered all it can for today. Come back tomorrow.");

  // Knowledge source #1: this site. Use the last few turns so follow-ups ("why?") still retrieve.
  const recent = history
    .slice(-4)
    .map(textOf)
    .join(" ");
  const found = searchSite(recent, 6);
  const siteHits = isNewsQuestion(question) ? [...newsDocs(), ...found.filter((d) => !newsDocs().includes(d))].slice(0, 14) : found;
  const onPage = body.page ? pageDocs(body.page.path, body.page.hash) : [];
  const system = `${SYSTEM_PROMPT}\n\n---\n\n${contextBlock({
    today,
    page: body.page,
    pageDocs: formatDocs(onPage, 400),
    siteDocs: formatDocs(siteHits.filter((d) => !onPage.includes(d))),
  })}`;

  // What the model was given up front vs. what it went and looked up; links it cited are added at log time.
  const provided = [...new Set([...siteHits, ...onPage].map((d) => d.href))];
  const searched = new Set<string>();
  const tools = {
    search_site: tool({
      description:
        "Search this site's own guide and encyclopedia (films, series, characters, lore, FAQ, news). Use it when the provided site context doesn't cover the question.",
      inputSchema: z.object({ query: z.string().min(2).max(200).describe("What to look up") }),
      execute: async ({ query }) => {
        const docs = searchSite(query, 5);
        docs.forEach((d) => searched.add(d.href));
        return docs.map((d) => ({ title: d.title, link: d.href, type: d.type, text: d.text.slice(0, 900) }));
      },
    }),
    search_web: tool({
      description:
        "Search trusted Marvel sources on the web (official Marvel/Disney first, then trade press, reference wikis, then entertainment sites). Use for recent news, casting, release info, or facts the site doesn't cover. Each result has a tier and label: tier 1 is official, tier 2 is trade press, tier 3 is fan reference, tier 4 is report/rumor.",
      inputSchema: z.object({
        query: z.string().min(2).max(200).describe("Search query"),
        kind: z.enum(["news", "reference"]).describe("news for recent developments, reference for established lore"),
      }),
      execute: async ({ query, kind }) => {
        try {
          const { sources: found } = await searchWeb(query, kind);
          found.forEach((s) => searched.add(s.url));
          return found.length ? found : "No results from trusted sources.";
        } catch (err) {
          console.error("[chat] web search failed", err);
          return "Web search is unavailable right now. Answer from the site context and your own knowledge, and say so if unsure.";
        }
      },
    }),
  };

  const messages = await convertToModelMessages(history);
  const run = (which: "primary" | "fallback") =>
    streamText({
      model: which === "primary" ? openai(PRIMARY_MODEL) : anthropic(FALLBACK_MODEL),
      system,
      messages,
      tools,
      stopWhen: isStepCount(LIMITS.maxSteps),
      maxOutputTokens: LIMITS.maxOutputTokens[which],
      maxRetries: 1,
      providerOptions: {
        openai: { reasoningEffort: LIMITS.effort, reasoningSummary: null },
        anthropic: { effort: LIMITS.effort },
      },
      onError: ({ error }) => console.error(`[chat] ${which} model error`, error),
    });
  const toUI = (r: ReturnType<typeof run>) => toUIMessageStream({ stream: r.stream, sendReasoning: false });

  let model = PRIMARY_MODEL;
  let fellBack = false;
  let failure: string | undefined;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let result = run("primary");
      // Hold the primary's output until its first text arrives; if it errors before that, switch
      // models invisibly. Once text has streamed we stay on the primary (a mid-answer switch would
      // read as two answers).
      const reader = toUI(result).getReader();
      const held: UIMessageChunk[] = [];
      let committed = false;
      let errored = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (committed) {
          writer.write(value);
          continue;
        }
        if (value.type === "error") {
          errored = true;
          break;
        }
        held.push(value);
        if (value.type === "text-delta") {
          committed = true;
          held.splice(0).forEach((c) => writer.write(c));
        }
      }
      // No text from the primary, whether it errored or just ended empty (reasoning used up the output
      // budget, or every step went to tool calls): answer with the fallback instead of a blank reply.
      if (!committed) {
        await reader.cancel().catch(() => {});
        console.warn(`[chat] primary gave no text (${errored ? "error" : "empty"}); using fallback`);
        model = FALLBACK_MODEL;
        fellBack = true;
        result = run("fallback");
        writer.merge(toUI(result));
      }

      try {
        const [usage, steps] = await Promise.all([result.totalUsage, result.steps]);
        const answer = steps.map((s) => s.text).join("\n");
        const cited = [...new Set([...answer.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]))];
        const cost = costUsd(model, usage.inputTokens ?? 0, usage.outputTokens ?? 0);
        await Promise.all([
          sbRpc("add_chat_spend", { p_usd: cost }),
          sbUpsert("chat_log", {
            question: question.slice(0, 500),
            page: body.page?.path ?? null,
            model,
            fell_back: fellBack,
            latency_ms: Date.now() - started,
            input_tokens: usage.inputTokens ?? null,
            output_tokens: usage.outputTokens ?? null,
            cost_usd: cost,
            sources: { cited, searched: [...searched], provided },
            error: failure ?? null,
          }),
        ]);
      } catch (err) {
        failure = String(err);
        await sbUpsert("chat_log", {
          question: question.slice(0, 500),
          page: body.page?.path ?? null,
          model,
          fell_back: fellBack,
          latency_ms: Date.now() - started,
          error: failure.slice(0, 500),
        });
      }
    },
    onError: (err) => {
      console.error("[chat] stream error", err);
      return "Sorry, the guide couldn't answer that just now. Please try again.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}

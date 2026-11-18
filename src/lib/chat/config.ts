/**
 * Chatbot settings (AGENTS.md §8). Everything tunable lives here.
 * Server-only: reads secrets from the environment.
 */
import "server-only";

export const PRIMARY_MODEL = process.env.PRIMARY_MODEL || "gpt-6.2-sol";
export const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "claude-opus-5-5";

/** USD per 1M tokens, for the spend cap and logs. Update when prices change. */
const PRICES: Record<string, { input: number; output: number }> = {
  "gpt-6.2-sol": { input: 2, output: 10 },
  "claude-opus-5-5": { input: 4, output: 20 },
};
export function costUsd(model: string, inputTokens = 0, outputTokens = 0): number {
  // Unknown model: assume the more expensive known rate so the cap errs on the safe side.
  const p = PRICES[model] ?? { input: 4, output: 20 };
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

export const LIMITS = {
  /** Longest question accepted, in characters. */
  maxInputChars: 800,
  /** Messages of history sent to the model (user + assistant). */
  maxHistory: 20,
  /** Output cap per answer. Includes reasoning tokens, which both models spend even when hidden. */
  maxOutputTokens: { primary: 4_000, fallback: 4_000 },
  /** How hard the models think before answering. "low" gave shallow lore answers; "medium" is the floor for "why/how" questions. */
  effort: (process.env.CHAT_EFFORT || "medium") as "low" | "medium" | "high",
  /** Model calls per answer (tool round-trips + final text). */
  maxSteps: 4,
  /** Per-IP rate limits. */
  perMinute: 6,
  perDay: 60,
  /** Daily spend cap in USD; the bot pauses for the rest of the UTC day once reached. */
  dailySpendCapUsd: Number(process.env.DAILY_SPEND_CAP_USD || 10),
  /** Web results per search and passage length per result. */
  webResults: 6,
  webPassageChars: 1_200,
};

export const SUPABASE = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, ""),
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

/**
 * Production stays closed until the abuse protections exist (Turnstile + Upstash rate limiting).
 * Development is always open (with an in-memory rate limit). Set CHAT_FORCE_ENABLED=true to override.
 */
export function chatAvailability(): { open: true } | { open: false; reason: string } {
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return { open: false, reason: "No model API keys are configured." };
  }
  if (process.env.CHAT_FORCE_ENABLED === "true" || process.env.NODE_ENV !== "production") return { open: true };
  const protectedEnough =
    process.env.TURNSTILE_SECRET_KEY && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  return protectedEnough ? { open: true } : { open: false, reason: "Chat isn't open yet." };
}

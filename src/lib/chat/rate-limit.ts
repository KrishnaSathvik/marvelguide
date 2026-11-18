/**
 * Per-IP rate limits (AGENTS.md §8). Uses Upstash Redis (REST) when configured; otherwise an in-memory
 * counter, which is fine for local dev but not across serverless instances (production stays closed
 * without Upstash, see chatAvailability).
 */
import "server-only";
import { LIMITS } from "./config";

type Verdict = { ok: true } | { ok: false; retryAfterSec: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryHit(key: string, limit: number, windowSec: number): Verdict {
  const now = Date.now();
  const cur = memory.get(key);
  if (!cur || cur.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true };
  }
  cur.count++;
  return cur.count <= limit ? { ok: true } : { ok: false, retryAfterSec: Math.ceil((cur.resetAt - now) / 1000) };
}

async function upstashHit(key: string, limit: number, windowSec: number): Promise<Verdict> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const r = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
      ["TTL", key],
    ]),
  });
  if (!r.ok) return { ok: true }; // fail open on limiter outage; the spend cap still applies
  const [incr, , ttlRes] = (await r.json()) as { result: number }[];
  const count = incr.result;
  const ttl = ttlRes.result;
  return count <= limit ? { ok: true } : { ok: false, retryAfterSec: Math.max(1, Number(ttl) || windowSec) };
}

export async function checkRateLimit(ip: string): Promise<Verdict> {
  const hit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? upstashHit : async (k: string, l: number, w: number) => memoryHit(k, l, w);
  const minute = await hit(`chat:m:${ip}`, LIMITS.perMinute, 60);
  if (!minute.ok) return minute;
  return hit(`chat:d:${ip}`, LIMITS.perDay, 86_400);
}

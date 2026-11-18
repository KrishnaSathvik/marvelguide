/**
 * POST /api/chat/verify { token } — checks a Turnstile token with Cloudflare and, if valid, sets the
 * signed `mg_human` cookie that /api/chat requires. Rate limited like the chat itself.
 */
import { HUMAN_COOKIE, HUMAN_TTL_SEC, makeHumanCookie, turnstileEnabled, verifyTurnstile } from "@/lib/chat/human";
import { checkRateLimit } from "@/lib/chat/rate-limit";

const json = (status: number, body: object, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });

export async function POST(req: Request) {
  if (!turnstileEnabled()) return json(200, { ok: true });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const limited = await checkRateLimit(ip);
  if (!limited.ok) return json(429, { error: "Too many attempts. Try again in a moment." }, { "Retry-After": String(limited.retryAfterSec) });

  let token = "";
  try {
    token = String(((await req.json()) as { token?: unknown }).token ?? "");
  } catch {
    /* fall through */
  }
  if (!token || token.length > 2048) return json(400, { error: "Missing verification." });
  if (!(await verifyTurnstile(token, ip))) return json(403, { error: "Verification failed. Please try again." });

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return json(
    200,
    { ok: true, expiresIn: HUMAN_TTL_SEC },
    { "Set-Cookie": `${HUMAN_COOKIE}=${makeHumanCookie()}; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=${HUMAN_TTL_SEC}${secure}` },
  );
}

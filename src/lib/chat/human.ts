/**
 * Cloudflare Turnstile (AGENTS.md §8: "Turnstile before first message").
 * The visitor solves the widget once; /api/chat/verify checks the token with Cloudflare and sets a signed,
 * HttpOnly cookie. /api/chat then only needs to check the cookie, so later messages need no new challenge.
 */
import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const HUMAN_COOKIE = "mg_human";
export const HUMAN_TTL_SEC = 12 * 3600;

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

// Separate signing key derived from the Turnstile secret, so the raw secret is never used as an HMAC key.
const signingKey = () => createHash("sha256").update(`mg-human-cookie:${process.env.TURNSTILE_SECRET_KEY}`).digest();
const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("base64url");

export function makeHumanCookie(): string {
  const payload = `${Math.floor(Date.now() / 1000) + HUMAN_TTL_SEC}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function isHuman(cookieHeader: string | null): boolean {
  const raw = cookieHeader
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${HUMAN_COOKIE}=`))
    ?.slice(HUMAN_COOKIE.length + 1);
  if (!raw) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  const expected = Buffer.from(sign(`${exp}.${nonce}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(exp) > Date.now() / 1000;
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
  if (ip && ip !== "local") body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = (await r.json()) as { success?: boolean };
    return j.success === true;
  } catch {
    return false;
  }
}

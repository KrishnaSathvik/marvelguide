/**
 * Minimal Supabase REST helpers for the chat route (service role, server-only).
 * Every helper fails soft: if Supabase is missing or a table doesn't exist yet, the chat still works,
 * it just doesn't cache, log or enforce the spend cap from the database.
 */
import "server-only";
import { SUPABASE } from "./config";

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE.serviceKey!,
    Authorization: `Bearer ${SUPABASE.serviceKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

const configured = () => Boolean(SUPABASE.url && SUPABASE.serviceKey);

export async function sbSelect<T>(path: string): Promise<T[] | null> {
  if (!configured()) return null;
  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/${path}`, { headers: headers(), cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T[];
  } catch {
    return null;
  }
}

export async function sbUpsert(table: string, row: object, onConflict?: string): Promise<boolean> {
  if (!configured()) return false;
  try {
    const q = onConflict ? `?on_conflict=${onConflict}` : "";
    const r = await fetch(`${SUPABASE.url}/rest/v1/${table}${q}`, {
      method: "POST",
      headers: headers({ Prefer: `${onConflict ? "resolution=merge-duplicates," : ""}return=minimal` }),
      body: JSON.stringify(row),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function sbRpc<T>(fn: string, args: object): Promise<T | null> {
  if (!configured()) return null;
  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(args),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

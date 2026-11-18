/**
 * Image key → URL. Keys are the legacy `data-art` keys (AGENTS.md §6).
 * Phase 3 fills this from the Supabase `art` table; until then every frame shows its placeholder.
 */
export function artSrc(_key: string): string | null {
  void _key;
  return null;
}

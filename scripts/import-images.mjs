// Phase 3: upload images/ to Supabase Storage and fill the `art` table.
//
//   node --env-file=.env.local scripts/import-images.mjs            # upload + upsert rows
//   node --env-file=.env.local scripts/import-images.mjs --dry-run  # show what would happen
//   node --env-file=.env.local scripts/import-images.mjs --prune    # also delete rows whose key left manifest.json
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only; never ship it to the client).
// Files are stored once per unique content (sha256-named), so keys that share an image share one object.
// Safe to re-run: objects that already exist are skipped and rows are upserted.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes("--dry-run");
const PRUNE = process.argv.includes("--prune");
const BUCKET = "art";
const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif" };

if (!URL_ || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local.");
  process.exit(1);
}
const auth = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// The public bucket can be created with the service key (the table needs SQL: supabase/migrations/0001_art.sql).
async function ensureBucket() {
  const r = await fetch(`${URL_}/storage/v1/bucket/${BUCKET}`, { headers: auth });
  if (r.ok) return;
  if (DRY) return console.log(`bucket "${BUCKET}" missing (would create)`);
  const c = await fetch(`${URL_}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!c.ok) throw new Error(`create bucket: ${c.status} ${await c.text()}`);
  console.log(`created public bucket "${BUCKET}"`);
}

const manifest = JSON.parse(readFileSync("images/manifest.json", "utf8"));

// One object per unique file content.
const objects = new Map(); // file -> { path, sha256, type, bytes }
for (const e of manifest) {
  if (objects.has(e.file)) continue;
  const bytes = readFileSync(e.file);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const ext = e.file.split(".").pop().toLowerCase();
  if (!TYPES[ext]) throw new Error(`Unsupported image type: ${e.file}`);
  objects.set(e.file, { path: `${sha256}.${ext}`, sha256, type: TYPES[ext], bytes });
}
const unique = new Map([...objects.values()].map((o) => [o.path, o]));
console.log(`${manifest.length} keys, ${objects.size} files, ${unique.size} unique objects`);

const publicUrl = (path) => `${URL_}/storage/v1/object/public/${BUCKET}/${path}`;

async function exists(path) {
  const r = await fetch(publicUrl(path), { method: "HEAD" });
  return r.ok;
}

async function upload(o) {
  const r = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${o.path}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": o.type, "Cache-Control": "max-age=31536000, immutable", "x-upsert": "false" },
    body: o.bytes,
  });
  // 409/400 "Duplicate" means another run already stored identical content: fine.
  if (!r.ok && r.status !== 409 && !(await r.text()).includes("Duplicate")) throw new Error(`upload ${o.path}: ${r.status}`);
}

// Small worker pool so we don't hammer the API.
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

await ensureBucket();

let uploaded = 0,
  skipped = 0;
await pool([...unique.values()], 6, async (o) => {
  if (await exists(o.path)) return void skipped++;
  if (!DRY) await upload(o);
  uploaded++;
  if (uploaded % 25 === 0) console.log(`  uploaded ${uploaded}…`);
});
console.log(`objects: ${uploaded} ${DRY ? "would upload" : "uploaded"}, ${skipped} already there`);

const rows = manifest.map((e) => {
  const o = objects.get(e.file);
  return { key: e.key, path: o.path, url: publicUrl(o.path), focus: e.focus ?? null, source: e.source, sha256: o.sha256, updated_at: new Date().toISOString() };
});

const table = await fetch(`${URL_}/rest/v1/art?select=key&limit=1`, { headers: auth });
if (table.status === 404) {
  console.error(
    "\nThe `art` table doesn't exist yet. Run supabase/migrations/0001_art.sql once in the Supabase dashboard\n" +
      "(SQL Editor → New query → paste → Run), then re-run this script. Uploaded files are kept; re-runs skip them.",
  );
  process.exit(2);
}
if (!DRY) {
  const r = await fetch(`${URL_}/rest/v1/art?on_conflict=key`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`upsert rows: ${r.status} ${await r.text()}`);
}
console.log(`rows: ${rows.length} ${DRY ? "would be upserted" : "upserted"}`);

if (PRUNE) {
  const keys = new Set(rows.map((r) => r.key));
  const r = await fetch(`${URL_}/rest/v1/art?select=key`, { headers: auth });
  const stale = (await r.json()).map((x) => x.key).filter((k) => !keys.has(k));
  if (stale.length && !DRY) {
    const q = `key=in.(${stale.map((k) => `"${k}"`).join(",")})`;
    const d = await fetch(`${URL_}/rest/v1/art?${q}`, { method: "DELETE", headers: auth });
    if (!d.ok) throw new Error(`prune: ${d.status}`);
  }
  console.log(`prune: ${stale.length} stale row(s) ${DRY ? "would be " : ""}deleted`, stale);
}
console.log("Done. New images show up after the next build (or after the art cache is revalidated).");

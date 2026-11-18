// Copies images/ (owner export) into public/art/ so Next can serve them.
// Interim until Phase 3 moves images to Supabase Storage. public/art/ is git-ignored.
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("public/art", { recursive: true, force: true });
mkdirSync("public/art", { recursive: true });
cpSync("images", "public/art", {
  recursive: true,
  filter: (src) => !src.endsWith("manifest.json") && !src.endsWith(".DS_Store"),
});
console.log("sync-images: images/ -> public/art/");

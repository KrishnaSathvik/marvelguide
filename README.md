# Marvel Guide (marvelguide.app)

Fan-made Avengers: Doomsday guide + MCU encyclopedia + built-in Marvel chatbot.
Unofficial fan project, not affiliated with Marvel or Disney.

## Start here
1. Read **AGENTS.md** (full plan, data map, design system, chatbot spec, build order).
2. Open `legacy/index.html` in a browser to see the current site (a frozen snapshot).
3. Images are already exported into `images/` (with `manifest.json`).
4. Follow the phases in AGENTS.md §9.

## Folders
- `legacy/` – current single-file site (source of truth for look + copy)
- `data/site/` – all site content as JSON
- `data/tmdb/` – TMDB metadata, fetch scripts, 98 poster/backdrop images
- `docs/planning/` – chatbot architecture, response engine, source engine
- `docs/reference/` – reference material
- `images/` – owner image export + `manifest.json`

Keys go in `.env.local` (never commit). See AGENTS.md §8 for the full list.

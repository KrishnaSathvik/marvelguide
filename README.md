# Marvel Guide

**[marvelguide.app](https://marvelguide.app)** · A fan-made watch guide for *Avengers: Doomsday* and a plain-English guide to the whole MCU, with a built-in Q&A chatbot.

> Unofficial fan project. Not affiliated with Marvel or Disney.

## What's inside

- **Doomsday Guide.** Get ready in four short steps:
  - **The story so far:** seven chapters from *Endgame* to Doom.
  - **What to watch:** three watch lists, from a weekend sprint to deep cuts, each title linked to Disney+.
  - **The three universes:** Earth-616, 828 and 10005, and how they collide.
  - **The characters:** who's confirmed, who's set up on screen, and who's only rumored.
- **MCU Explained.** Every film and series, a directory of 77 characters, villains, teams and power levels, the TVA and the Sacred Timeline, the multiverse, time travel, tech, and watch orders.
- **News.** Sourced cards labelled *Official*, *Canon*, *Report* or *Unconfirmed*. Spoilers stay blurred until you tap them.
- **Ask the Watcher.** A chatbot that answers from this guide first, then from trusted sources. It keeps the MCU and the comics apart and labels rumors as rumors.
- **Search.** Find any film, character, term or news story from any page.

## Built with

[Next.js](https://nextjs.org) on [Vercel](https://vercel.com). Images and chat data live in [Supabase](https://supabase.com). The chatbot uses the [AI SDK](https://ai-sdk.dev) with OpenAI, falling back to Anthropic, and searches the web with [context.dev](https://context.dev). It's protected by [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) and per-visitor rate limits in [Upstash](https://upstash.com).

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev                  # http://localhost:3000
```

The pages need the two public Supabase keys, because all images come from Supabase Storage. The chatbot also needs the model, search and protection keys listed in `.env.example`.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Posters and backdrops come from [TMDB](https://www.themoviedb.org).

Marvel, the Avengers and all related characters and names belong to Marvel and Disney. This site is a fan project made for fun and has no affiliation with them.

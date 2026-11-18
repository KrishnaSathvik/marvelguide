import posthog from "posthog-js";

/**
 * PostHog product analytics, web analytics and session replay. Runs before the app becomes interactive.
 * Off until NEXT_PUBLIC_POSTHOG_KEY is set. Events go through /ingest on our own domain (rewrites in
 * next.config.ts) so ad blockers don't drop them.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    // Pinned defaults snapshot (includes pageviews on client-side navigation).
    defaults: "2026-08-30",
    // Anonymous visitors don't get person profiles; there are no accounts on this site.
    person_profiles: "identified_only",
    session_recording: {
      maskAllInputs: true,
      // What visitors ask the Watcher never shows up in replays (AGENTS.md: no PII).
      maskTextSelector: ".cb-bubble",
    },
  });
  // Dev only: lets you inspect it from the browser console (window.posthog).
  if (process.env.NODE_ENV === "development") (window as unknown as { posthog: typeof posthog }).posthog = posthog;
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AskPageChat } from "@/components/chat/AskPageChat";
import { chatAvailability } from "@/lib/chat/config";

export const metadata: Metadata = pageMeta({
  title: "Ask the Watcher",
  description:
    "Ask anything about the MCU and Avengers: Doomsday. An unofficial fan guide that labels rumors.",
  path: "/ask",
});

/** Full-screen chat app under the site header. */
export default function AskPage() {
  const availability = chatAvailability();
  return (
    <main className="ask-app">
      <h1 className="sr-only">Ask the Watcher</h1>
      {availability.open ? (
        <AskPageChat />
      ) : (
        <div className="cb cb-page">
          <p className="cb-closed">{availability.reason}</p>
        </div>
      )}
    </main>
  );
}

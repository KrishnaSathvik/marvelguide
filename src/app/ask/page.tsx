import type { Metadata } from "next";
import { AskPageChat } from "@/components/chat/AskPageChat";
import { Icon } from "@/components/Icon";
import { chatAvailability } from "@/lib/chat/config";

export const metadata: Metadata = {
  title: "Ask the guide",
  description: "Ask anything about the MCU and Avengers: Doomsday. An unofficial fan guide that labels rumors.",
};

export default function AskPage() {
  const availability = chatAvailability();
  return (
    <main>
      <section id="ask">
        <div className="wrap">
          <span className="kicker">
            <Icon name="sparkles" />
            Ask the guide
          </span>
          <h1 className="h2">
            Ask about the <span className="r">MCU</span>
          </h1>
          <p className="lede">
            Films, lore, comics and the road to Doomsday. Answers come from this guide first, then trusted sources,
            with rumors labelled as rumors.
          </p>
          {availability.open ? <AskPageChat /> : <p className="chat-error">{availability.reason}</p>}
        </div>
      </section>
    </main>
  );
}

import { CardGrid, PageStub } from "@/components/PageStub";

export default function HomePage() {
  return (
    <PageStub kicker="Dec 18, 2026 in the US" title="Road to Doomsday" lede="Everything you need before Avengers: Doomsday.">
      <CardGrid
        items={[
          { href: "/guide", tag: "4 steps", title: "Doomsday Guide", text: "Story, what to watch, the universes and the characters." },
          { href: "/mcu", tag: "5 groups", title: "MCU Explained", text: "Every film, series, character and concept." },
          { href: "/news", tag: "Latest", title: "News", text: "Dated, sourced and labelled." },
        ]}
      />
    </PageStub>
  );
}

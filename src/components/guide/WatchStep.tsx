import { SectionHead } from "@/components/ui";
import { WatchList } from "./WatchList";

export function WatchStep() {
  return (
    <>
      <SectionHead
        icon="monitor-play"
        kicker="Step 2 · What to watch"
        title="The"
        accent="watch list"
        lede="All official titles stream on Disney+ in the “Countdown to Avengers: Doomsday” collection. Mark titles as watched to track your progress."
      />
      <WatchList />
    </>
  );
}

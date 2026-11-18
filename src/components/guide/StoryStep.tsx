import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Lead, Row, SectionHead } from "@/components/ui";
import { C, STORY } from "@/content";

export function StoryStep() {
  return (
    <>
      <SectionHead
        icon="book-open"
        kicker="Step 1 · The story so far"
        title="How we got to"
        accent="the end of worlds"
        lede="Seven years of movies and shows in seven chapters. Each one covers what happened, why it mattered and how it pushed the story toward Doomsday. Read them in order and the ending of the Multiverse Saga will make sense."
      />
      <div className="chaps">
        {STORY.map((s, i) => (
          <Row
            key={s.h}
            id={`story-${i + 1}`}
            index={i}
            media={
              <>
                <Art
                  artKey={`story-${i + 1}`}
                  fit="contain"
                  alt={`${s.w}: ${s.h}`}
                  label="Scene still"
                  icon={s.i}
                  color={i === 6 ? C.green : C.red}
                />
                <span className="cnum">{String(i + 1).padStart(2, "0")}</span>
                <span className="cyr">{s.y}</span>
              </>
            }
          >
            <h3>{s.h}</h3>
            <span className="w">
              <Icon name="film" />
              {s.w}
            </span>
            <h5>What happened</h5>
            <p>{s.what}</p>
            <h5>Why it matters</h5>
            <p>{s.why}</p>
            <Lead title="How it leads to Doomsday">{s.lead}</Lead>
          </Row>
        ))}
      </div>
    </>
  );
}

import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { SectionHead } from "@/components/ui";
import { Roster } from "./Roster";

export function CharactersStep() {
  return (
    <>
      <SectionHead
        icon="users"
        kicker="Step 4 · Characters"
        title="The"
        accent="confirmed roster"
        lede="Marvel's confirmed cast, Scarlet Witch (set up on screen in VisionQuest's finale), two strongly rumored extras (marked Rumored, at the end), and where to meet each character first."
      />
      <div className="doom rv" id="char-doom">
        <Art artKey="char-doom" alt="Doctor Doom" label="Doctor Doom" />
        <div className="tx">
          <span className="kicker">
            <Icon name="crown" />
            The threat
          </span>
          <h3>Doctor Doom</h3>
          <p>
            <b style={{ color: "#fff" }}>Robert Downey Jr.</b> plays Victor von Doom, a completely new role for the actor
            who played Tony Stark. In the comics Doom is Reed Richards&apos; great rival, which is why{" "}
            <em>The Fantastic Four: First Steps</em> matters so much here: its mid-credits scene was his first tease.
          </p>
          <div className="acts" style={{ marginTop: 22 }}>
            <a
              className="btn"
              href="https://www.marvel.com/characters/doctor-doom-victor-von-doom"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external-link" />
              Official profile
            </a>
            <a
              className="btn"
              href="https://www.marvel.com/movies/the-fantastic-four-first-steps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="film" />
              Meet him in First Steps
            </a>
          </div>
        </div>
      </div>
      <Roster />
    </>
  );
}

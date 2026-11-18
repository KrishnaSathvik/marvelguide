import type { CSSProperties } from "react";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icon";
import { Lead, Row, SectionHead } from "@/components/ui";
import { C, COLLIDE, UNIS } from "@/content";

export function UniversesStep() {
  return (
    <>
      <SectionHead
        icon="orbit"
        kicker="Step 3 · Three universes"
        title="Who's"
        accent="colliding"
        lede="Marvel gives every universe a number so you can tell them apart. Doomsday pulls heroes from three of them. Here's what each one is, who comes from it, and how they ended up heading toward each other."
      />
      <div className="chaps">
        {UNIS.map((u, i) => (
          <Row
            key={u.k}
            id={`uni-${u.k}`}
            index={i}
            className="uchap"
            style={{ "--uc": C[u.c] } as CSSProperties}
            media={
              <>
                <Art fit="contain" artKey={`uni-${u.k}`} alt={`${u.code}: ${u.tag}`} label="Banner" icon="globe" color={C[u.c]} />
                <span className="ucode2">
                  <b>{u.code}</b>
                  <span>{u.tag}</span>
                </span>
              </>
            }
          >
            <h3>{u.h}</h3>
            <span className="w">
              <Icon name="film" />
              {u.seen}
            </span>
            <h5>What it is</h5>
            <p>{u.what}</p>
            <h5>Who&apos;s from here</h5>
            <p>{u.who}</p>
            <Lead title="Where things stand">{u.now}</Lead>
          </Row>
        ))}
      </div>
      <div className="collide rv" id="collide-box">
        <h3>How they end up colliding</h3>
        <ol id="collide">
          {COLLIDE.map((c, i) => (
            <li key={c.h} className="rv">
              <span className="n">{i + 1}</span>
              <div>
                <b>{c.h}</b>
                <span className={`tag ${c.t === "Canon" ? "canon" : "soft"}`}>{c.t}</span>
                <p>{c.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

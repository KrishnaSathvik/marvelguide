import type { Metadata } from "next";
import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { Spoiler } from "@/components/Spoiler";
import { FAQ } from "@/content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "The things fans keep asking before Avengers: Doomsday, answered with what Marvel has actually said.",
};

const groups = [...new Set(FAQ.map((q) => q.g))];

export default function FaqPage() {
  return (
    <main>
      <section id="faq">
        <div className="wrap">
          <span className="kicker rv">
            <Icon name="circle-help" />
            <em style={{ color: "#fff" }}>Fan questions</em>
          </span>
          <h1 className="h2 rv">
            Your questions, <span className="r">answered</span>
          </h1>
          <p className="lede rv">
            The things fans keep asking on Reddit and social media before Doomsday, answered with what Marvel has
            actually said.
          </p>
          <div id="qas">
            {groups.map((g) => (
              <Fragment key={g}>
                <h2 className="qg rv">{g}</h2>
                <div className="grid g2">
                  {FAQ.map((q, i) =>
                    q.g !== g ? null : (
                      <article key={q.q} className="qa rv" id={`faq-${i + 1}`}>
                        <h3 className="qh">
                          <Icon name="circle-help" />
                          <span>{q.q}</span>
                        </h3>
                        {q.sp ? (
                          <Spoiler style={{ margin: "14px 18px 16px" }}>
                            <p style={{ padding: 0 }}>{q.a}</p>
                          </Spoiler>
                        ) : (
                          <p>{q.a}</p>
                        )}
                      </article>
                    ),
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/** Inline links in FAQ answers: [label](/path) or an official https link on Marvel, Disney+, Fandango, or YouTube. */

const FAQ_LINK =
  /\[([^\]]+)\]\(((?:https?:\/\/(?:www\.)?(?:marvel\.com|disneyplus\.com|fandango\.com|youtube\.com)[^)\s]*)|\/[^)\s]*)\)/g;

export type FaqPart = { type: "text"; text: string } | { type: "link"; label: string; href: string };

export function isFaqLink(part: FaqPart): part is Extract<FaqPart, { type: "link" }> {
  return part.type === "link";
}

/** Answer text with the link markup removed, for search and structured data. */
export function faqPlain(answer: string): string {
  return answer.replace(FAQ_LINK, "$1");
}

/** Split an answer into text and links, in order. */
export function faqParts(answer: string): FaqPart[] {
  const parts: FaqPart[] = [];
  const re = new RegExp(FAQ_LINK.source, "g");
  let last = 0;
  for (const match of answer.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: "text", text: answer.slice(last, index) });
    parts.push({ type: "link", label: match[1], href: match[2] });
    last = index + match[0].length;
  }
  if (last < answer.length) parts.push({ type: "text", text: answer.slice(last) });
  return parts;
}

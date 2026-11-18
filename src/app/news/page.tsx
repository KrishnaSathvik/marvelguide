import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return <PageStub kicker="Latest news" title="News" lede="Dated, sourced and labelled: Official, Report or Unconfirmed." />;
}

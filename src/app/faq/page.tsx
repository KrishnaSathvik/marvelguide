import type { Metadata } from "next";
import { PageStub } from "@/components/PageStub";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return <PageStub kicker="Fan questions" title="FAQ" />;
}

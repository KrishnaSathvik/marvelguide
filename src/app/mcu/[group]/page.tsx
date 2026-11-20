import { notFound, permanentRedirect } from "next/navigation";
import { findGroup, MCU_GROUPS, mcuGroupHref } from "@/lib/routes";

export function generateStaticParams() {
  return MCU_GROUPS.map((g) => ({ group: g.slug }));
}

/** The section nav already lists the five parts. Each part opens on its first chapter. */
export default async function McuGroupPage({ params }: PageProps<"/mcu/[group]">) {
  const group = findGroup((await params).group);
  if (!group) notFound();
  permanentRedirect(mcuGroupHref(group));
}

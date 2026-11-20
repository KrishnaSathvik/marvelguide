import { permanentRedirect } from "next/navigation";

/** The four steps are in the section nav. Opening Guide goes straight to the first one. */
export default function GuidePage() {
  permanentRedirect("/guide/story");
}

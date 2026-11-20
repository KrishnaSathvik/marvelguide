import { permanentRedirect } from "next/navigation";
import { MCU_HOME } from "@/lib/routes";

/** The five sections are in the section nav. Opening MCU goes straight to the first chapter. */
export default function McuPage() {
  permanentRedirect(MCU_HOME);
}

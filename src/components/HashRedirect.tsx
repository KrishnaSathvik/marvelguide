"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { legacyHashTarget } from "@/lib/routes";

/**
 * The legacy site was one page with hash routes (#watch, #g-basics …).
 * Hashes never reach the server, so old links are redirected here, on the home page only.
 */
export function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (location.pathname !== "/") return;
    const target = legacyHashTarget(location.hash);
    if (target === undefined) return;
    if (target === null || target === "/") {
      history.replaceState(null, "", "/");
      return;
    }
    router.replace(target);
  }, [router]);
  return null;
}

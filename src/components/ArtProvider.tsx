"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ArtEntry, ArtMap } from "@/lib/art";

const ArtContext = createContext<ArtMap>({});

/** Makes the image map (loaded once on the server, see getArtMap) available to every <Art/>. */
export function ArtProvider({ map, children }: { map: ArtMap; children: ReactNode }) {
  return <ArtContext.Provider value={map}>{children}</ArtContext.Provider>;
}

export function useArt(key: string): ArtEntry | undefined {
  return useContext(ArtContext)[key];
}

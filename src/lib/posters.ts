import "server-only";
import { POSTERS, type PosterFilm } from "@/content";
import type { ArtMap } from "./art";
import { DOOM_POSTERS, POSTER_PAGE_SIZE, postersNewestFirst, type PosterShot } from "./poster-pages";

export { POSTER_PAGE_SIZE, posterPageHref } from "./poster-pages";
export type { PosterShot } from "./poster-pages";

/** The eleven Doomsday posters, ahead of the movie one-sheets. Skips a key the art table does not have. */
export function doomPosterShots(art: ArtMap): PosterShot[] {
  return DOOM_POSTERS.flatMap((poster) => {
    const src = art[poster.id]?.src;
    if (!src) return [];
    return [{ path: poster.id, src, w: 768, h: 1024, textless: false, title: poster.title, year: 2026, mark: poster.id }];
  });
}

/** Every poster in one list. The first poster of a movie keeps that movie's id for search. */
export function posterShots(films: readonly PosterFilm[] = POSTERS): PosterShot[] {
  return postersNewestFirst(films).flatMap((film) =>
    film.posters.map((poster, index) => ({
      ...poster,
      title: film.title,
      year: film.year,
      mark: index === 0 ? film.id : undefined,
    })),
  );
}

export function posterPageCount(total = posterShots().length): number {
  return Math.max(1, Math.ceil(total / POSTER_PAGE_SIZE));
}

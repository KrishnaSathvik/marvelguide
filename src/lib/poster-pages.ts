export const POSTER_PAGE_SIZE = 20;

export type PosterShot = {
  path: string;
  /** Set when the file is not on TMDB, such as the eleven Doomsday posters. */
  src?: string;
  w: number;
  h: number;
  textless: boolean;
  title: string;
  year: number;
  mark?: string;
};

/** The eleven Marvel Studios Doomsday posters, in the order they were posted. */
export const DOOM_POSTERS = [
  { id: "doom-poster-doom", title: "Doctor Doom" },
  { id: "doom-poster-reed-xavier", title: "Reed & Xavier" },
  { id: "doom-poster-bucky-shangchi", title: "Bucky & Shang-Chi" },
  { id: "doom-poster-mbaku-nightcrawler", title: "M'Baku & Nightcrawler" },
  { id: "doom-poster-thor-steve", title: "Thor & Steve" },
  { id: "doom-poster-magneto-shuri", title: "Magneto & Shuri" },
  { id: "doom-poster-sam-cyclops", title: "Sam & Cyclops" },
  { id: "doom-poster-sue-namor", title: "Sue & Namor" },
  { id: "doom-poster-gambit-yelena", title: "Gambit & Yelena" },
  { id: "doom-poster-guardian-antman", title: "Red Guardian & Ant-Man" },
  { id: "doom-poster-loki-mystique", title: "Loki & Mystique" },
] as const;

export function posterPageHref(page: number): string {
  return page <= 1 ? "/posters" : `/posters?page=${page}`;
}

/** Newest movies first. Same year keeps the later release ahead of the earlier one. */
export function postersNewestFirst<T extends { year: number }>(films: readonly T[]): T[] {
  return films
    .map((film, index) => ({ film, index }))
    .sort((a, b) => b.film.year - a.film.year || b.index - a.index)
    .map((row) => row.film);
}

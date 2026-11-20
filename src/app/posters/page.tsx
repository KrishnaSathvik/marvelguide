import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PosterGallery, PosterPager } from "@/components/PosterGallery";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { doomPosterShots, POSTER_PAGE_SIZE, posterPageCount, posterPageHref, posterShots } from "@/lib/posters";
import { getArtMap } from "@/lib/art";
import { pageMeta } from "@/lib/seo";
import type { PosterShot } from "@/lib/poster-pages";

const movieShots = posterShots();

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const total = doomPosterShots(await getArtMap()).length + movieShots.length;
  const { page } = pageFrom((await searchParams).page, posterPageCount(total));
  return pageMeta({
    title: page > 1 ? `Posters, page ${page}` : "Posters",
    description: `${total} HD Marvel movie posters. Tap one to open the full file, then download it.`,
    path: posterPageHref(page),
  });
}

function pageFrom(raw: string | string[] | undefined, pages: number): { page: number; canonical: boolean } {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return { page: 1, canonical: true };
  const n = /^[1-9]\d*$/.test(value) ? Number(value) : 1;
  const page = Math.min(Math.max(n, 1), pages);
  return { page, canonical: String(page) === value && page !== 1 };
}

function PosterBlock({ page, shots, pages }: { page: number; shots: readonly PosterShot[]; pages: number }) {
  const start = (page - 1) * POSTER_PAGE_SIZE;
  const visible = shots.slice(start, start + POSTER_PAGE_SIZE);
  const from = start + 1;
  const to = start + visible.length;
  return (
    <>
      <p className="lede rv">
        {from}–{to} of {shots.length}. Tap one to open the full file.
      </p>
      <PosterGallery shots={visible} />
      <PosterPager page={page} pages={pages} />
    </>
  );
}

async function PosterRequest({ searchParams, shots, pages }: Props & { shots: readonly PosterShot[]; pages: number }) {
  const { page, canonical } = pageFrom((await searchParams).page, pages);
  if (!canonical) redirect(posterPageHref(page));
  return <PosterBlock page={page} shots={shots} pages={pages} />;
}

export default async function PostersPage({ searchParams }: Props) {
  const shots = [...doomPosterShots(await getArtMap()), ...movieShots];
  const pages = posterPageCount(shots.length);
  return (
    <main>
      <section className="poster-page">
        <div className="wrap">
          <Reveal />
          <span className="kicker rv">
            <Icon name="film" /> Full size
          </span>
          <h1 className="h2 rv">
            Movie <span className="r">posters</span>
          </h1>
          <Suspense fallback={<PosterBlock page={1} shots={shots} pages={pages} />}>
            <PosterRequest searchParams={searchParams} shots={shots} pages={pages} />
          </Suspense>
          <p className="disclaimer rv">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </section>
    </main>
  );
}

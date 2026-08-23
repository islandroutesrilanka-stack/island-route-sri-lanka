/**
 * Experience discovery (homepage §04).
 *
 * Editorial hierarchy rather than a uniform grid: two large features carry the
 * section and show their sub-activities, and the rest sit beneath as a quiet
 * typographic index.
 *
 * Only *published* categories appear — a category is published when at least
 * one journey carries its theme. This is the same derivation the /experiences
 * index and sitemap use (`publishedExperiences`), so the homepage can never
 * advertise a category whose detail page 404s. Add a themed tour and the
 * category appears here automatically; no list to maintain.
 *
 * Links go to /experiences/<slug> — the destination page for the axis — rather
 * than /tours?theme=<slug>, which skipped straight past the editorial content
 * to a filtered catalogue.
 *
 * This shipped with no photography, on the grounds that a category image would
 * mean unverified stock — and it said the tiles would take images "with no
 * change to this component" once real photography existed. It now does:
 * `lib/media/experiences.ts` carries a location-checked asset for all twelve
 * categories, and /experiences has been using them. These two features were the
 * last place on the site where a gradient stood in for a photograph on purpose,
 * which on the homepage meant the largest block above the fold after the hero
 * was two coloured rectangles. `requireVerifiedLocation` stays on, so the
 * contour treatment is still what an unchecked asset falls back to.
 *
 * Self-fetching so the homepage stays untouched: `getTours` is React.cache-
 * wrapped, so this shares the homepage's existing query rather than adding one.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import type { MediaAsset } from "@/lib/media/types";
import { slotAsset } from "@/lib/media/slots";
import { getSettings, getTours } from "@/lib/data";
import {
  publishedExperiences,
  type PublishedExperience,
} from "@/lib/experiences";

function Feature({
  experience: { category, tours },
  index,
  tall = false,
  asset,
}: {
  experience: PublishedExperience;
  index: number;
  tall?: boolean;
  /* Resolved by the caller — see the note on ExperienceCard's `asset`. */
  asset: MediaAsset | null;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/experiences/${category.slug}`} className="group block">
        <div
          className={`img-frame relative ${
            tall
              ? "aspect-[4/5] md:aspect-[3/4]"
              : "aspect-[4/5] md:aspect-[4/3]"
          }`}
        >
          <Img
            asset={asset}
            /* Off, and staying off — same rule as ExperienceCard: an unchecked
               asset here would put a photograph of somewhere else behind a
               category name on the homepage. */
            requireVerifiedLocation
            sizes={
              tall
                ? "(min-width: 768px) 42vw, 100vw"
                : "(min-width: 768px) 58vw, 100vw"
            }
            fallbackTone={index % 2 === 0 ? "moss" : "deep"}
            fallbackPattern="contour"
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          {/*
            NOTE — this component is not currently mounted by any page. The
            homepage was cut from ten sections to five and this was one of the
            sections removed; it is kept because it is not badly made and the
            axis may come back.

            Which is the only reason it still carries a full-frame scrim. The
            stops used to be shared with ExperienceCard's grid tile, and that
            tile has since moved its copy out of the photograph entirely and
            dropped its scrim — see the note there for why. If this section is
            ever remounted, it should be rebuilt the same way rather than
            re-tuned: the copy fills roughly the bottom three-quarters of a 4/3
            or 3/4 frame, which is a geometry no scrim can serve without
            painting the picture out.

            The colour is at least correct now. It was rgba(11,31,25) — the
            `deep` of two palettes ago — on a ground that has been #032722
            since the tropical pass.
          */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,39,34,0.95)_0%,rgba(3,39,34,0.85)_40%,rgba(3,39,34,0.62)_70%,rgba(3,39,34,0.45)_85%,rgba(3,39,34,0.15)_100%)]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-sand/60">
              {tours.length} {tours.length === 1 ? "journey" : "journeys"}
            </p>
            <h3 className="h-display mt-2 text-3xl text-sand md:text-4xl">
              {category.name}
            </h3>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-sand/70">
              {category.blurb}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-sand/15 pt-4">
              {category.activities.map((a) => (
                <li
                  key={a}
                  className="text-[11px] uppercase tracking-[0.14em] text-sand/55"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function ExperienceRail() {
  const [tours, settings] = await Promise.all([getTours(), getSettings()]);
  const published = publishedExperiences(tours);
  if (published.length === 0) return null;
  const pictureFor = (slug: string) =>
    slotAsset(settings.images, `experience-${slug}`);

  // Two features only when there are enough to spare; otherwise everything
  // that remains would be an index of one, which reads like an oversight.
  const featureCount =
    published.length >= 4 ? 2 : Math.min(published.length, 1);
  const features = published.slice(0, featureCount);
  const rest = published.slice(featureCount);

  return (
    <>
      <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-12 md:gap-6">
        <div
          className={features.length > 1 ? "md:col-span-7" : "md:col-span-12"}
        >
          <Feature
            experience={features[0]}
            index={0}
            asset={pictureFor(features[0].category.slug)}
          />
        </div>
        {features[1] && (
          <div className="md:col-span-5 md:pt-12">
            <Feature
              experience={features[1]}
              index={1}
              tall
              asset={pictureFor(features[1].category.slug)}
            />
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(({ category: c, tours }) => (
            <li key={c.slug} className="border-b border-ink/10">
              <Link
                href={`/experiences/${c.slug}`}
                className="group flex items-baseline justify-between gap-4 py-5"
              >
                <span>
                  <span className="font-display text-xl text-ink transition-colors group-hover:text-copper-deep">
                    {c.name}
                  </span>
                  <span className="mt-1 block text-[12px] uppercase tracking-[0.12em] text-ink/65">
                    {tours.length} {tours.length === 1 ? "journey" : "journeys"}
                    {" · "}
                    {c.activities.slice(0, 2).join(" · ")}
                  </span>
                </span>
                <ArrowRight
                  size={15}
                  aria-hidden
                  className="shrink-0 translate-y-1 text-ink/60 transition-all group-hover:translate-x-1 group-hover:text-copper-deep"
                />
                <span className="sr-only">— {c.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Reveal index={2}>
        <p className="mt-10 text-[15px] text-ink/70">
          <Link href="/experiences" className="link-line text-copper-deep">
            See all experiences
          </Link>
        </p>
      </Reveal>
    </>
  );
}

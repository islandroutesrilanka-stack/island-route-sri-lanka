import Link from "next/link";
import { HeroLine, Reveal } from "@/components/motion";
import { SectionHeading, TourCard, DestinationCard } from "@/components/ui";
import VideoHero from "@/components/media/VideoHero";
import IslandMap from "@/components/patterns/IslandMap";
import ExperienceRail from "@/components/patterns/ExperienceRail";
import FleetStrip from "@/components/patterns/FleetStrip";
import GuideFeature, {
  type FeaturedGuide,
} from "@/components/patterns/GuideFeature";
import TrustBand from "@/components/patterns/TrustBand";
import JourneyStory, {
  buildFeaturedJourney,
} from "@/components/patterns/JourneyStory";
import PlannerEntry from "@/components/patterns/PlannerEntry";
import FaqPreview from "@/components/patterns/FaqPreview";
import { HOMEPAGE_FAQS } from "@/lib/faqs";
import Img from "@/components/media/Img";
import GradientPanel from "@/components/media/GradientPanel";
import { fromCmsUrl } from "@/lib/media/registry";
import { resolveHero } from "@/lib/media/hero";
import { regions } from "@/lib/regions";
import {
  getSettings,
  getFeaturedTours,
  getTours,
  getDestinations,
  getPosts,
  getFleet,
  getReviews,
} from "@/lib/data";
import { formatDate, toIsoDate } from "@/utils/format";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featuredTours, tours, destinations, posts, fleet, reviews] =
    await Promise.all([
      getSettings(),
      getFeaturedTours(),
      getTours(),
      getDestinations(),
      getPosts(),
      getFleet(),
      getReviews(),
    ]);

  const hero = resolveHero(settings);

  /* Guide — rendered only when real content exists. Never invented. */
  const guide: FeaturedGuide | null = settings.featuredGuideName.trim()
    ? {
        name: settings.featuredGuideName.trim(),
        role: settings.featuredGuideRole.trim(),
        note: settings.featuredGuideNote.trim(),
        imageUrl: settings.featuredGuideImage.trim(),
      }
    : null;

  const featuredJourney = buildFeaturedJourney(tours, settings, reviews);

  /* FAQPage structured data, matching what is actually on the page. */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ══════════════════ 01 — CINEMATIC HERO ══════════════════
          Full height on phones, where a tall frame is the natural shape.
          On large screens it settles to roughly 21:9 — a film aspect — while
          never collapsing below 42rem or exceeding the viewport. */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-deep lg:min-h-0 lg:h-[max(42rem,min(94svh,calc(100vw*9/21)))]">
        <VideoHero
          video={hero.video}
          slides={hero.slides}
          slideshow={hero.slideshow}
        />

        <div className="relative z-20 mx-auto w-full max-w-wrap px-5 pb-14 pt-32 sm:pb-16 sm:pt-40 md:px-8 md:pb-20">
          <HeroLine delay={0.1}>
            {/* Editorial index rule — a quiet piece of magazine furniture that
                anchors the type block without adding UI decoration. */}
            <p className="flex items-center gap-4 text-copper-light">
              <span aria-hidden className="h-px w-10 bg-copper-light/50" />
              <span className="eyebrow">Private journeys · Sri Lanka</span>
            </p>
          </HeroLine>

          <HeroLine delay={0.25}>
            {/* Break authored after the comma — a two-beat statement, not
                left to text-wrap:balance to guess at. */}
            <h1 className="h-display mt-4 max-w-4xl text-[clamp(2.75rem,10vw,7rem)] leading-[0.95] text-sand">
              {hero.headline.includes(",") ? (
                <>
                  {hero.headline.split(",")[0]},
                  <br />
                  <span className="text-copper-light">
                    {hero.headline.split(",").slice(1).join(",").trim()}
                  </span>
                </>
              ) : (
                hero.headline
              )}
            </h1>
          </HeroLine>

          {/* Subcopy and CTAs sit on one editorial line at desktop width, which
              keeps the hero's lower edge calm and lets the media breathe. */}
          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
            <HeroLine delay={0.45}>
              <p className="max-w-[42ch] leading-relaxed text-sand/75 md:text-lg">
                {hero.subcopy}
              </p>
            </HeroLine>

            <HeroLine delay={0.6}>
              <div className="flex flex-col gap-4 sm:flex-row md:shrink-0">
                <Link
                  href={hero.ctaPrimary.href}
                  className="bg-copper-deep px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
                >
                  {hero.ctaPrimary.label}
                </Link>
                <Link
                  href={hero.ctaSecondary.href}
                  className="border border-sand/40 px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-sand hover:text-deep"
                >
                  {hero.ctaSecondary.label}
                </Link>
              </div>
            </HeroLine>
          </div>
        </div>

        {/* The four claims moved out of the hero into their own band below —
            crowded under the headline they read as feature bullets. */}
      </section>

      {/* ══════════════════ WHY ISLAND ROUTE — three pillars ══════════════════ */}
      <TrustBand />

      {/* ══════════════════ 02 — EXPLORE SRI LANKA ══════════════════ */}
      <section
        id="explore"
        className="grain relative scroll-mt-20 overflow-hidden bg-deep py-24 md:py-36"
      >
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            dark
            eyebrow="Explore Sri Lanka"
            title="One island, seven very different countries"
            intro="Two opposing monsoons and a central mountain range mean the island is never doing only one thing at once. Choose a region and see what it does best."
          />
          <div className="mt-14">
            {/* #regions is the region explorer on /destinations — that page now
                leads with it, so a click here lands on the matching tab instead
                of on the hero above it. */}
            <IslandMap hash="#regions" />
          </div>
        </div>
      </section>

      {/* ══════════════════ 03 — DESTINATIONS ══════════════════ */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Destinations"
              title="Places worth the drive"
              intro="Ancient capitals, tea terraces, leopard country and the long southern coast — often within a single week."
            />
            <Reveal>
              <Link
                href="/destinations"
                className="link-line text-[13px] uppercase tracking-[0.16em] text-copper-deep"
              >
                All destinations →
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {destinations.slice(0, 8).map((d, i) => (
              <DestinationCard key={d.slug} d={d} index={i} />
            ))}
          </div>

          {/* Regions as an editorial index beneath the places */}
          <div className="mt-14 border-t border-ink/10 pt-10">
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/destinations?region=${r.slug}#regions`}
                    className="group block"
                  >
                    <p className="font-display text-lg text-ink transition-colors group-hover:text-copper-deep">
                      {r.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink/65">
                      {r.character}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════════════════ 04 — EXPERIENCES ══════════════════ */}
      <section id="experiences" className="scroll-mt-20 bg-dune/50 py-24 md:py-36">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Experiences"
              title="Travel by what moves you"
              intro="Wildlife at dawn, a working tea estate, a swell that only arrives in July. Start with the feeling and we'll build the route around it."
            />
          </div>
          <ExperienceRail />
        </div>
      </section>

      {/* ══════════════════ 05 — SIGNATURE TOURS (+ fleet strip) ══════════════════ */}
      <section className="grain relative overflow-hidden bg-deep py-24 md:py-36">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              dark
              eyebrow="Signature journeys"
              title="Routes we've refined over years"
              intro="Starting points, not fixed departures. Every one of these is reshaped around your dates, pace and interests."
            />
            <Reveal>
              <Link
                href="/tours"
                className="link-line text-[13px] uppercase tracking-[0.16em] text-copper-light"
              >
                All journeys →
              </Link>
            </Reveal>
          </div>

          {/* Hierarchy, not four identical tiles: one lead journey at editorial
              scale on its own row, three supporting beneath. Kept as separate
              rows rather than a side column so the heights can't fight each
              other — a 16:11 feature beside three stacked 4:5 cards is a
              three-to-one mismatch at desktop width. */}
          {featuredTours.length > 0 && (
            <>
              <div className="mt-14 md:mt-16">
                <TourCard tour={featuredTours[0]} index={0} variant="feature" dark />
              </div>
              {featuredTours.length > 1 && (
                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                  {featuredTours.slice(1, 4).map((t, i) => (
                    <TourCard key={t.slug} tour={t} index={i + 1} dark />
                  ))}
                </div>
              )}
            </>
          )}

          <FleetStrip fleet={fleet} />
        </div>
      </section>

      {/* ══════════════════ 06 — WHY ISLAND ROUTE (+ guide) ══════════════════ */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <GuideFeature guide={guide} />
        </div>
      </section>

      {/* ══════════════════ 07 — FEATURED JOURNEY ══════════════════ */}
      {featuredJourney && (
        <section className="bg-dune/50 py-24 md:py-36">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <JourneyStory feature={featuredJourney} />
          </div>
        </section>
      )}

      {/* ══════════════════ 08 — JOURNAL ══════════════════ */}
      {posts.length > 0 && (
        <section className="py-24 md:py-36">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Sri Lanka stories"
                title="Notes from the road"
              />
              <Reveal>
                <Link
                  href="/blog"
                  className="link-line text-[13px] uppercase tracking-[0.16em] text-copper-deep"
                >
                  All stories →
                </Link>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {posts.slice(0, 3).map((p, i) => {
                const cover = fromCmsUrl(p.image, p.title);
                return (
                  <Reveal key={p.slug} index={i}>
                    <Link href={`/blog/${p.slug}`} className="group block">
                      <div className="img-frame relative aspect-[16/10]">
                        {cover ? (
                          <Img
                            asset={cover}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="transition-transform duration-[1.4s] group-hover:scale-105"
                          />
                        ) : (
                          <GradientPanel tone="dune" className="h-full w-full" />
                        )}
                      </div>
                      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                        <time dateTime={toIsoDate(p.date)}>{formatDate(p.date)}</time>
                        {p.readTime && ` · ${p.readTime}`}
                      </p>
                      <h3 className="mt-2 font-display text-2xl leading-snug text-ink transition-colors group-hover:text-copper-deep">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">
                        {p.excerpt}
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ 09 — PLAN YOUR JOURNEY (+ FAQ) ══════════════════ */}
      <section className="grain relative overflow-hidden bg-deep py-24 md:py-36">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <PlannerEntry tours={tours} />
          <FaqPreview />
        </div>
      </section>
    </>
  );
}

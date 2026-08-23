import Link from "next/link";
import { HeroLine, Reveal } from "@/components/motion";
import { SectionHeading, TourCard, DestinationCard, CTABand } from "@/components/ui";
import VideoHero from "@/components/media/VideoHero";
import TrustBand from "@/components/patterns/TrustBand";
import { resolveHero } from "@/lib/media/hero";
import { getSettings, getFeaturedTours, getDestinations } from "@/lib/data";

export const revalidate = 60;

/**
 * The homepage.
 *
 * Five sections: the film, the argument, the journeys, the places, the ask.
 *
 * It carried ten before — an island map, an experience rail, a fleet strip, a
 * guide profile, a long-form featured journey, three blog posts, a two-column
 * planner and an FAQ preview. None of it was badly made and all of it is still
 * in the codebase; the problem was that a visitor deciding whether to trust a
 * stranger with two weeks of their holiday had to scroll past eight arguments
 * to reach the four journeys that are the actual product. Everything cut here
 * has a page of its own already reachable from the nav, which is where someone
 * who wants that depth is going anyway.
 *
 * The grounds alternate dark, light, dark, light, dark. With ten sections that
 * rhythm was inaudible; with five it does the work of separating them, which is
 * why none of these sections needs a divider or a container edge to be legible.
 */
export default async function HomePage() {
  const [settings, featuredTours, destinations] = await Promise.all([
    getSettings(),
    getFeaturedTours(),
    getDestinations(),
  ]);

  const hero = resolveHero(settings);

  return (
    <>
      {/* ══════════════════ 01 — CINEMATIC HERO ══════════════════
          Full height on phones, where a tall frame is the natural shape. On
          large screens it settles to roughly 21:9 — a film aspect — while never
          collapsing below 42rem or exceeding the viewport. */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-deep lg:min-h-0 lg:h-[max(42rem,min(94svh,calc(100vw*9/21)))]">
        <VideoHero
          video={hero.video}
          slides={hero.slides}
          slideshow={hero.slideshow}
        />

        <div className="relative z-20 mx-auto w-full max-w-wrap px-5 pb-14 pt-32 sm:pb-16 sm:pt-40 md:px-8 md:pb-20">
          <HeroLine delay={0.1}>
            {/* Editorial index rule — a quiet piece of magazine furniture that
                anchors the type block without adding UI decoration.

                The label is sand, not copper. Copper-light is a mid-tone
                (relative luminance 0.32), so over a mid-tone frame it cannot
                reach 4.5:1 at any scrim short of blacking the image out — it
                measured 1.19:1 against the poster's misty band. Sand clears the
                threshold under a scrim gentle enough to leave the film intact.
                The rule keeps the copper, because a 1px decorative line carries
                no text contrast requirement. */}
            <p className="flex items-center gap-4 text-sand">
              <span aria-hidden className="h-px w-10 bg-copper-light/70" />
              <span className="eyebrow">Private journeys · Sri Lanka</span>
            </p>
          </HeroLine>

          <HeroLine delay={0.25}>
            {/* Break authored after the comma — a two-beat statement, rather
                than leaving text-wrap:balance to guess at it. */}
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

          {/* Subcopy and CTA share one editorial line at desktop width, which
              keeps the hero's lower edge calm and lets the film breathe. */}
          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
            <HeroLine delay={0.45}>
              <p className="max-w-[42ch] leading-relaxed text-sand/75 md:text-lg">
                {hero.subcopy}
              </p>
            </HeroLine>

            <HeroLine delay={0.6}>
              {/*
                One button, and one text link that is not competing with it.

                These were two filled-and-outlined buttons side by side, which
                is the arrangement that makes a visitor choose before they have
                read anything — and the second only scrolled further down the
                page, so it was spending a primary-CTA slot on something a thumb
                already does for free. The link keeps that route for anyone who
                wants it while leaving exactly one thing to press.

                It renders only when a label is set, so clearing the field in
                the admin removes it rather than leaving an empty control.
              */}
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8 md:shrink-0">
                <Link
                  href={hero.ctaPrimary.href}
                  className="bg-copper-deep px-9 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
                >
                  {hero.ctaPrimary.label}
                </Link>
                {hero.ctaSecondary.label && (
                  <Link
                    href={hero.ctaSecondary.href}
                    className="link-line text-[13px] uppercase tracking-[0.16em] text-sand/80 transition-colors hover:text-sand"
                  >
                    {hero.ctaSecondary.label}
                  </Link>
                )}
              </div>
            </HeroLine>
          </div>
        </div>
      </section>

      {/* ══════════════════ 02 — WHY ISLAND ROUTE ══════════════════ */}
      <TrustBand />

      {/* ══════════════════ 03 — SIGNATURE JOURNEYS ══════════════════
          The product, and the reason the two sections above are kept short. */}
      <section
        id="journeys"
        className="grain relative scroll-mt-20 overflow-hidden bg-deep section"
      >
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              dark
              eyebrow="Signature journeys"
              title="Routes we have refined over years"
              intro="Starting points, not fixed departures — every one is reshaped around you."
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
              rows rather than a feature-plus-side-column, because a 16:11
              feature beside three stacked 4:5 cards is a three-to-one height
              mismatch at desktop width. */}
          {featuredTours.length > 0 && (
            <>
              <div className="section-body">
                <TourCard
                  tour={featuredTours[0]}
                  index={0}
                  variant="feature"
                  dark
                />
              </div>
              {featuredTours.length > 1 && (
                <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                  {featuredTours.slice(1, 4).map((t, i) => (
                    <TourCard key={t.slug} tour={t} index={i + 1} dark />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ══════════════════ 04 — DESTINATIONS ══════════════════
          Four in one row, where there were eight over two rows above a
          seven-region editorial index. The homepage's job here is to establish
          that there is range and then hand the question to /destinations, which
          is built to answer it. Four also matches what DestinationCard's own
          `sizes` attribute is written for. */}
      <section className="section">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Destinations"
              title="Places worth the drive"
              intro="Ancient capitals, tea terraces, leopard country, the long southern coast — often in a single week."
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

          <div className="section-body grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {destinations.slice(0, 4).map((d, i) => (
              <DestinationCard key={d.slug} d={d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 05 — BEGIN THE JOURNEY ══════════════════
          The same closing band as every other page on the site. The homepage
          used to end on a bespoke two-column planner instead, which meant the
          one page most likely to be a visitor's first had the one ending they
          would never see again. */}
      <CTABand />
    </>
  );
}

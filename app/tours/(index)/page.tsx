import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, TourCard, CTABand, SectionHeading } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import IslandMap from "@/components/patterns/IslandMap";
import JourneyBuilder from "@/components/patterns/JourneyBuilder";
import { getTours } from "@/lib/data";
import { commonsPlaces } from "@/lib/media/commons";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
import { regions } from "@/lib/regions";
import { formatPrice } from "@/utils/format";
import { seasons, getSeason, currentSeasonKey, type SeasonPick } from "@/lib/seasons";
import type { Tour } from "@/lib/tours";
import {
  filterTours,
  hasActiveFilters,
  parseTourFilters,
  filtersToQuery,
  describeFilters,
  PARTY_LABELS,
} from "@/lib/tour-filters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Tour Packages",
  description:
    "Private Sri Lanka tour packages: day tours to Sigiriya, Kandy, Ella and Galle, multi-day island circuits, and leopard & elephant safaris — all with your own driver.",
  alternates: { canonical: "/tours" },
  // Filtered views are the same catalogue in a different order. Canonical keeps
  // them out of the index without making the links themselves nofollow.
};

const groups = [
  { key: "Multi-Day", eyebrow: "Multi-day journeys", title: "The island, end to end" },
  { key: "Day Tour", eyebrow: "Day tours", title: "One perfect day" },
  { key: "Safari", eyebrow: "Safaris", title: "Into the wild" },
] as const;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const all = await getTours();
  const filters = parseTourFilters(searchParams);
  const active = hasActiveFilters(filters);
  const tours = active ? filterTours(all, filters) : all;
  const chips = describeFilters(filters, {
    themeName: (slug) => experienceCategories.find((c) => c.slug === slug)?.name,
    destinationName: (slug) => destinations.find((d) => d.slug === slug)?.name,
  }).filter((c) => c.label !== "Travelling as"); // shown separately below

  /* Seasonal curation. `?season=` joins the existing query vocabulary; an
     unknown or absent value falls back to the real season in Asia/Colombo. */
  const seasonKey = Array.isArray(searchParams.season)
    ? searchParams.season[0]
    : searchParams.season;
  const season = getSeason(seasonKey);
  const isNow = season.key === currentSeasonKey();
  const bySlug = (slug: string) => all.find((t) => t.slug === slug);

  /* `season.lead` is an ordered preference list, not a fixed pair: take the
     first two picks that resolve to a live tour. A pick that isn't in the
     catalogue — a signature journey before its row exists, or anything
     unpublished in Supabase — is skipped rather than leaving a hole in a
     two-column grid. The tail of each list is the catalogue tour that used to
     hold the slot, so this section always fills.

     `more` then drops whatever won a lead slot, since a tail entry is listed
     in both and would otherwise appear twice on the same screen. */
  const leads = season.lead
    .map((pick) => ({ pick, tour: bySlug(pick.slug) }))
    .filter((x): x is { pick: SeasonPick; tour: Tour } => Boolean(x.tour))
    .slice(0, 2);
  const leadSlugs = new Set(leads.map((x) => x.pick.slug));
  const more = season.more.filter((p) => !leadSlugs.has(p.slug));

  return (
    <>
      <PageHeader
        eyebrow="Tours & packages"
        title="Journeys crafted, never copied"
        intro="Every tour below is a starting point — we adapt routes, hotels and pacing to you. Prices are indicative per person and confirmed in your personal quote."
        image={commonsPlaces.Trincomalee.src}
      />

      {/* ═══════════ Season selector + curated journeys ═══════════
          Shown on the unfiltered page only; a filtered view has already
          answered the visitor's question. Server-rendered from the month, so
          the right season is correct on first paint with no client JS. */}
      {!active && (
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-copper-deep">
              {isNow ? "Now in Sri Lanka" : "Planning ahead"}
            </p>
            <h2 className="h-display mt-3 text-3xl text-ink md:text-4xl">
              {season.label}
            </h2>
            <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-ink/65">
              {season.months}
            </p>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink/75">
              {season.blurb}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {seasons.map((s) => (
                <li key={s.key}>
                  <Link
                    href={s.key === currentSeasonKey() ? "/tours" : `/tours?season=${s.key}`}
                    aria-current={s.key === season.key ? "true" : undefined}
                    className={`inline-flex min-h-[44px] flex-col justify-center border px-4 py-1.5 transition-colors ${
                      s.key === season.key
                        ? "border-copper bg-copper/10 text-copper-deep"
                        : "border-ink/20 text-ink/70 hover:border-copper hover:text-copper-deep"
                    }`}
                  >
                    <span className="text-[12px] uppercase tracking-[0.14em]">
                      {s.months}
                    </span>
                    <span className="text-[11px] text-ink/55">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Best journeys for this season */}
            <h3 className="mt-14 font-display text-2xl text-ink">
              Best journeys for {season.months}
            </h3>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {leads.map(({ pick: p, tour: t }) => {
                return (
                  <article key={p.slug} className="border-t border-ink/10 pt-6">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-copper-deep">
                      Seasonal favourite
                    </p>
                    <h4 className="font-display mt-2 text-2xl text-ink">
                      <Link href={`/tours/${t.slug}`} className="hover:text-copper-deep">
                        {t.title}
                      </Link>
                    </h4>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink/65">
                      {t.duration}
                      {t.priceFrom > 0 &&
                        ` · From ${formatPrice(t.priceFrom)} per person`}
                    </p>
                    <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
                      {p.why}
                    </p>
                    <Link
                      href={`/tours/${t.slug}`}
                      className="link-line mt-5 inline-block text-[12px] uppercase tracking-[0.16em] text-copper-deep"
                    >
                      View journey
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* More ways to travel this season */}
            {more.length > 0 && (
              <>
                <h3 className="mt-14 font-display text-xl text-ink">
                  More ways to travel this season
                </h3>
                <ul className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {more.map((p) => {
                    const t = bySlug(p.slug);
                    if (!t) return null;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/tours/${t.slug}`}
                          className="group block"
                        >
                          <span className="font-display text-lg text-ink transition-colors group-hover:text-copper-deep">
                            {t.title}
                          </span>
                          <span className="mt-0.5 block text-[12px] uppercase tracking-[0.14em] text-ink/60">
                            {t.duration}
                            {t.priceFrom > 0 &&
                              ` · From ${formatPrice(t.priceFrom)}`}
                          </span>
                        </Link>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink/65">
                          {p.why}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="mt-10 text-[13px] leading-relaxed text-ink/60">
              Conditions can vary from year to year — these are recommendations,
              not guarantees. Tell us your dates and we&apos;ll say honestly what
              to expect.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════ Journeys by region — map + region index ═══════════
          Additive: inserted above the existing filter bar and groups, which are
          untouched. IslandMap is reused rather than cloned, with basePath
          pointing at this page, so a region click lands on /tours?region=… and
          is handled by the filter added in stage 1. The coastline, hotspots,
          keyboard behaviour and always-present region list all come along.

          Region membership is derived from each tour's own destinationSlugs —
          no `region` field was added to the tour model. */}
      <section className="grain relative overflow-hidden bg-deep py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            dark
            eyebrow="Journeys across Sri Lanka"
            title="Start with a region"
            intro="Two monsoons and a mountain range mean the island is never doing one thing at once. Choose a region to see the journeys that go there — or keep scrolling for the full collection."
          />
          <div className="mt-12">
            <IslandMap basePath="/tours" />
          </div>
        </div>
      </section>

      {/* Active filter summary. Only appears when something is filtering, so
          the unfiltered page is visually unchanged. */}
      {active && (
        <section className="border-b border-ink/10 py-6">
          <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-5 gap-y-3 px-5 md:px-8">
            <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
              {tours.length} {tours.length === 1 ? "journey" : "journeys"}
            </p>
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <li
                  key={c.label}
                  className="border border-copper/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-copper-deep"
                >
                  {c.label}: {c.value}
                </li>
              ))}
            </ul>
            {filters.party && (
              <p className="text-[12px] text-ink/65">
                Travelling as {PARTY_LABELS[filters.party] ?? filters.party}
              </p>
            )}
            <Link
              href="/tours"
              className="link-line ml-auto text-[12px] uppercase tracking-[0.16em] text-copper-deep"
            >
              Clear filters
            </Link>
          </div>
        </section>
      )}

      {active && tours.length === 0 ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="Nothing off the shelf"
              title="No set journey matches that combination"
              /* Neutral: describes what happens next rather than making a
                 claim about how many trips are built to order. */
              body="Nothing listed matches every filter. Tell us what you had in mind and we'll put a route together around it."
              action={{
                label: "Plan your journey",
                href: `/book${filtersToQuery(filters)}`,
              }}
            >
              <p className="mt-6 text-[13px] text-ink/65">
                Or{" "}
                <Link href="/tours" className="link-line text-copper-deep">
                  browse every journey
                </Link>
                .
              </p>
            </EmptyState>
          </div>
        </section>
      ) : (
        groups.map((g, gi) => {
          const list = tours.filter((t) => t.category === g.key);
          // With filters on, an empty category is simply omitted rather than
          // printing a heading over nothing.
          if (list.length === 0) return null;
          return (
            <section
              key={g.key}
              className={`py-16 md:py-24 ${gi % 2 ? "bg-dune/60" : ""}`}
            >
              <div className="mx-auto max-w-wrap px-5 md:px-8">
                <SectionHeading eyebrow={g.eyebrow} title={g.title} />
                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t, i) => (
                    <TourCard key={t.slug} tour={t} index={i} />
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}

      {/* Catalogue genuinely empty (no data at all), distinct from "no match". */}
      {!active && all.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="Journeys"
              title="Our journeys are being updated"
              body="Nothing is listed here just now. Tell us your dates and interests and we'll put a route together for you."
              action={{ label: "Plan your journey", href: "/book" }}
            />
          </div>
        </section>
      )}

      {/* ═══════════ Journeys by region ═══════════
          Rendered only on the unfiltered page: a filtered view already answers
          "what goes here?", and repeating the whole index beneath it would
          bury the answer. Region membership is derived by intersecting each
          tour's own destinationSlugs with the region's — no `region` field was
          added to the tour model.

          `region.places` is editorial copy naming towns we cover; most have no
          destination page. Only the ones backed by a real route are linked, so
          this index cannot produce a 404. */}
      {!active && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <SectionHeading
              eyebrow="By region"
              title="Where each journey goes"
            />
            <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
              {regions.map((r, ri) => {
                const inRegion = all.filter((t) =>
                  (t.destinationSlugs ?? []).some((d) =>
                    r.destinationSlugs.includes(d)
                  )
                );
                return (
                  <div key={r.slug} className="grid gap-6 py-9 md:grid-cols-12 md:gap-10">
                    <div className="md:col-span-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-copper-deep">
                        {String(ri + 1).padStart(2, "0")}
                      </p>
                      <h3 className="font-display mt-2 text-2xl text-ink">
                        {r.name}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                        {r.character}
                      </p>
                      <p className="mt-4 text-[13px] leading-relaxed text-ink/65">
                        {r.places.map((p, pi) => {
                          const match = destinations.find(
                            (d) => d.name.toLowerCase() === p.toLowerCase()
                          );
                          return (
                            <span key={p}>
                              {pi > 0 && " · "}
                              {match ? (
                                <Link
                                  href={`/destinations/${match.slug}`}
                                  className="link-line text-copper-deep"
                                >
                                  {p}
                                </Link>
                              ) : (
                                p
                              )}
                            </span>
                          );
                        })}
                      </p>
                    </div>

                    <div className="md:col-span-8">
                      {inRegion.length === 0 ? (
                        /* The North, today. Stated plainly rather than hidden —
                           we cannot claim journeys we do not run. */
                        <p className="text-[15px] leading-relaxed text-ink/65">
                          No set journey covers this region yet.{" "}
                          <Link href="/book" className="link-line text-copper-deep">
                            Ask us what&apos;s possible
                          </Link>
                          .
                        </p>
                      ) : (
                        <ul className="space-y-5">
                          {inRegion.map((t) => (
                            <li key={t.slug}>
                              <Link
                                href={`/tours/${t.slug}`}
                                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                              >
                                <span className="font-display text-lg text-ink transition-colors group-hover:text-copper-deep">
                                  {t.title}
                                </span>
                                <span className="text-[12px] uppercase tracking-[0.14em] text-ink/65">
                                  {t.duration}
                                  {t.priceFrom > 0 &&
                                    ` · From ${formatPrice(t.priceFrom)} per person`}
                                </span>
                              </Link>
                              {t.highlights.length > 0 && (
                                <p className="mt-1 text-[13px] leading-relaxed text-ink/65">
                                  {t.highlights.slice(0, 3).join(" · ")}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={`/tours?region=${r.slug}`}
                        className="link-line mt-5 inline-block text-[12px] uppercase tracking-[0.16em] text-copper-deep"
                      >
                        {inRegion.length > 0
                          ? `See ${r.name} journeys`
                          : `Plan a ${r.name} trip`}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ Build your own journey ═══════════
          Client-side selections only. No reservation, no new table — the CTA
          hands off to /book through the existing query/context system. */}
      <section className="grain relative overflow-hidden bg-deep py-20 md:py-28">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            dark
            eyebrow="Build your own journey"
            title="Or start from a blank page"
            intro="Five short questions — all of them optional — and we'll route the trip around your answers. Nothing below is a booking; it simply gives your enquiry a head start."
          />
          <div className="mt-12">
            <JourneyBuilder />
          </div>
        </div>
      </section>

      <CTABand
        title="Don't see your perfect trip?"
        body="Most of our journeys are tailor-made from scratch. Tell us your dates and interests and we'll design a route that's yours alone."
      />
    </>
  );
}

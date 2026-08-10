import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, TourCard, CTABand, SectionHeading } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import { getTours } from "@/lib/data";
import { img } from "@/lib/images";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
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

  return (
    <>
      <PageHeader
        eyebrow="Tours & packages"
        title="Journeys crafted, never copied"
        intro="Every tour below is a starting point — we adapt routes, hotels and pacing to you. Prices are indicative per person and confirmed in your personal quote."
        image={img.beachAerial}
      />

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

      <CTABand
        title="Don't see your perfect trip?"
        body="Most of our journeys are tailor-made from scratch. Tell us your dates and interests and we'll design a route that's yours alone."
      />
    </>
  );
}

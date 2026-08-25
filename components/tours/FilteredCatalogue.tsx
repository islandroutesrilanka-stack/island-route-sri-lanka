"use client";

/**
 * The tour catalogue, filtered in the browser.
 *
 * The unfiltered catalogue — the grouped grids, the "by region" index, the
 * empty-catalogue state — arrives as server-rendered `children` and is what
 * ships in the HTML. This component hands it straight back until a filter is
 * actually present in the URL, so the ordinary visit to /tours costs no
 * client-side re-render at all: React sees the same element it was given and
 * leaves the DOM alone.
 *
 * Only the filtered view is built here, and only the fields a filtered view
 * reads are sent over — see `CatalogueTour`. `lib/tours.ts` deliberately does
 * not come with it: that module pulls in the media registry and the whole
 * Commons provenance table, none of which a filter or a card has ever looked
 * at, and a single import would have put all of it in the bundle.
 *
 * The swap from unfiltered to filtered happens one render after hydration on a
 * filtered arrival such as /tours?region=hill-country. That section sits below
 * a full dark map panel, well past the fold on every viewport, so nothing
 * visible is replaced under the visitor. What is served to a crawler is the
 * complete catalogue, which is also what the canonical URL points at.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import EmptyState from "@/components/patterns/EmptyState";
import {
  SectionHeading,
  TourCard,
  type TourCardTour,
} from "@/components/ui-client";
import { useQueryParams } from "../query-watcher";
import {
  describeFilters,
  filterTours,
  filtersToQuery,
  hasActiveFilters,
  parseTourFiltersFromQuery,
  PARTY_LABELS,
} from "@/lib/tour-filters";

/** A catalogue entry, reduced to what filtering and a card need. */
export type CatalogueTour = TourCardTour & {
  themeSlugs?: string[];
  destinationSlugs?: string[];
};

export type TourGroup = { key: string; eyebrow: string; title: string };

export default function FilteredCatalogue({
  tours,
  groups,
  themeNames,
  destinationNames,
  children,
}: {
  tours: CatalogueTour[];
  groups: TourGroup[];
  /** Slug → name, so a chip can say "Wildlife" rather than "wildlife". */
  themeNames: Record<string, string>;
  destinationNames: Record<string, string>;
  /** The unfiltered catalogue, rendered on the server. */
  children: ReactNode;
}) {
  const { params, watcher } = useQueryParams();
  const filters = parseTourFiltersFromQuery(params);

  if (!hasActiveFilters(filters))
    return (
      <>
        {watcher}
        {children}
      </>
    );

  const list = filterTours(tours, filters);
  const chips = describeFilters(filters, {
    themeName: (slug) => themeNames[slug],
    destinationName: (slug) => destinationNames[slug],
  }).filter((c) => c.label !== "Travelling as"); // shown separately below

  return (
    <>
      {watcher}

      {/* Active filter summary. Only appears when something is filtering, so
          the unfiltered page is visually unchanged. */}
      <section className="border-b border-ink/10 py-6">
        <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-5 gap-y-3 px-5 md:px-8">
          <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
            {list.length} {list.length === 1 ? "journey" : "journeys"}
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
          {/* Same-page navigation, so `scroll={false}` — clearing a filter
              should leave you looking at the catalogue you just unfiltered,
              not at the top of the page. See IslandMap for the full note. */}
          <Link
            href="/tours"
            scroll={false}
            className="link-line ml-auto text-[12px] uppercase tracking-[0.16em] text-copper-deep"
          >
            Clear filters
          </Link>
        </div>
      </section>

      {list.length === 0 ? (
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
                <Link
                  href="/tours"
                  scroll={false}
                  className="link-line text-copper-deep"
                >
                  browse every journey
                </Link>
                .
              </p>
            </EmptyState>
          </div>
        </section>
      ) : (
        groups.map((g, gi) => {
          const inGroup = list.filter((t) => t.category === g.key);
          // With filters on, an empty category is simply omitted rather than
          // printing a heading over nothing.
          if (inGroup.length === 0) return null;
          return (
            <section
              key={g.key}
              className={`py-16 md:py-24 ${gi % 2 ? "bg-dune/60" : ""}`}
            >
              <div className="mx-auto max-w-wrap px-5 md:px-8">
                <SectionHeading eyebrow={g.eyebrow} title={g.title} />
                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {inGroup.map((t, i) => (
                    <TourCard key={t.slug} tour={t} index={i} />
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}
    </>
  );
}

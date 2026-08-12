import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, DestinationCard, CTABand, SectionHeading } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import RegionExplorer from "@/components/patterns/RegionExplorer";
import { getDestinations } from "@/lib/data";
import { getRegion } from "@/lib/regions";
import { clampDesc } from "@/lib/seo";
import { img } from "@/lib/images";

export const revalidate = 60;

/**
 * Description derived from the destination data rather than a hand-maintained
 * list, so adding or renaming a destination can't leave the meta description
 * describing a catalogue that no longer exists. `clampDesc` keeps it inside
 * Google's display limit on a word boundary.
 *
 * The visible headline is left exactly as authored — see the note on it below.
 */
export async function generateMetadata(): Promise<Metadata> {
  const destinations = await getDestinations();
  const names = destinations.map((d) => d.name);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : names[0] ?? "";

  return {
    title: "Sri Lanka Destinations",
    description: clampDesc(
      `Explore Sri Lanka's finest destinations${list ? `: ${list}` : ""} — all with a private driver.`
    ),
    alternates: { canonical: "/destinations" },
  };
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const all = await getDestinations();

  /*
    ?region= is emitted by the homepage island map, the homepage region index
    and the region links inside this page's own copy. It was previously ignored,
    so all seven regions landed on the same unfiltered grid.

    Matching is by region slug via lib/regions.ts rather than by comparing the
    destination's region *name*, so a wording change to a region label can't
    quietly break the filter.
  */
  const raw = searchParams.region;
  const regionSlug = (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  const region = regionSlug ? getRegion(regionSlug) : undefined;

  const destinations = region
    ? all.filter((d) => region.destinationSlugs.includes(d.slug))
    : all;

  // An unrecognised slug is treated as no filter rather than an empty page.
  const filtering = Boolean(region);

  return (
    <>
      {/*
        "Nine islands in one" is authored copy, deliberately not derived from
        array length — it is a metaphor, not a count, and should change only by
        editorial decision. The intro line is flagged for factual verification
        (a global comparative) and is left exactly as written.
      */}
      <PageHeader
        eyebrow="Destinations"
        title="Nine islands in one"
        intro="Few places on Earth pack this much variety into a drivable week — golden coasts, cloud forests, ancient citadels and big-cat country."
        image={img.mistyHills}
      />
      {/* Region filter summary — only rendered when a region is applied, so the
          unfiltered page looks exactly as it did. */}
      {filtering && region && (
        <section className="border-b border-ink/10 py-6">
          <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-5 gap-y-3 px-5 md:px-8">
            <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
              {destinations.length}{" "}
              {destinations.length === 1 ? "destination" : "destinations"}
            </p>
            <span className="border border-copper/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-copper-deep">
              Region: {region.name}
            </span>
            <Link
              href="/destinations"
              className="link-line ml-auto text-[12px] uppercase tracking-[0.16em] text-copper-deep"
            >
              All destinations
            </Link>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24" aria-labelledby="all-destinations">
        <h2 id="all-destinations" className="sr-only">
          {region ? `Destinations in ${region.name}` : "All destinations"}
        </h2>
        {destinations.length === 0 ? (
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow={region ? region.name : "Destinations"}
              title={
                region
                  ? `We haven't published a ${region.name} guide yet`
                  : "Our destination guides are being updated"
              }
              /*
                Neutral by necessity: this renders for regions with no published
                destinations — currently The North — and we cannot assert what
                is or isn't operated there. It states only what is verifiable
                from the site itself: nothing is published yet, and you can ask.
              */
              body={
                region
                  ? "There are no published guides for this region yet. If you're considering it, ask us and we'll tell you what's possible."
                  : "Nothing is listed here just now. Tell us where you'd like to go and we'll take it from there."
              }
              action={{ label: "Ask us about this region", href: "/book" }}
            >
              <p className="mt-6 text-[13px] text-ink/65">
                Or{" "}
                <Link href="/destinations" className="link-line text-copper-deep">
                  see every destination
                </Link>
                .
              </p>
            </EmptyState>
          </div>
        ) : (
          /* data-qa scopes the QA harness's destination-card selector to this
             grid. The region explorer below also links to /destinations/…, and
             a page-wide `a[href^="/destinations/"]` count would mix the two and
             break the filter assertions. */
          <div
            data-qa="destination-grid"
            className="mx-auto max-w-wrap px-5 md:px-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
          >
            {destinations.map((d, i) => (
              <DestinationCard key={d.slug} d={d} index={i % 3} />
            ))}
          </div>
        )}
      </section>

      {/*
        The explorer covers the whole island — all seven regions and the
        thirty-one places we actually run — while the grid above covers only
        what has a published guide. Both are true and they are different sets,
        so they are presented as different sections rather than merged.

        It opens on the filtered region when one is applied, so arriving from
        the homepage map lands on the matching tab.
      */}
      <section className="bg-dune/50 py-16 md:py-24" aria-label="Explore by region">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="Explore by region"
            title="Seven regions, one island"
            intro="Sri Lanka changes character roughly every two hours of driving. This is how we group it — and what we'd take you to see in each."
          />
          <RegionExplorer
            className="mt-12 md:mt-16"
            defaultRegion={regionSlug}
            destinations={all.map((d) => ({
              slug: d.slug,
              name: d.name,
              region: d.region,
              image: d.image,
            }))}
          />
        </div>
      </section>

      <CTABand
        title="Can't choose? You don't have to."
        body="Most of our routes link four or five of these destinations in a single seamless journey. Tell us what excites you most and we'll thread the rest."
      />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader, DestinationCard, CTABand } from "@/components/ui";
import { getDestinations } from "@/lib/data";
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

export default async function DestinationsPage() {
  const destinations = await getDestinations();
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
      <section className="py-16 md:py-24" aria-labelledby="all-destinations">
        <h2 id="all-destinations" className="sr-only">
          All destinations
        </h2>
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {destinations.map((d, i) => (
            <DestinationCard key={d.slug} d={d} index={i % 3} />
          ))}
        </div>
      </section>
      <CTABand
        title="Can't choose? You don't have to."
        body="Most of our routes link four or five of these destinations in a single seamless journey. Tell us what excites you most and we'll thread the rest."
      />
    </>
  );
}

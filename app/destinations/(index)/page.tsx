import type { Metadata } from "next";
import {
  PageHeader,
  DestinationCard,
  CTABand,
  SectionHeading,
} from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import RegionExplorer from "@/components/patterns/RegionExplorer";
import ScrollToAnchor from "@/components/patterns/ScrollToAnchor";
import { getDestinations, getSettings } from "@/lib/data";
import { slotSrc } from "@/lib/media/slots";
import { clampDesc } from "@/lib/seo";

export const revalidate = 60;

/**
 * Description derived from the destination data rather than a hand-maintained
 * list, so adding or renaming a destination can't leave the meta description
 * describing a catalogue that no longer exists. `clampDesc` keeps it inside
 * Google's display limit on a word boundary.
 *
 * Deliberately not varied by ?region=: every region view is the same page with
 * a different tab open, and the canonical stays /destinations. Emitting seven
 * near-identical titles against one canonical would be the worst of both.
 *
 * The visible headline is left exactly as authored — see the note on it below.
 */
export async function generateMetadata(): Promise<Metadata> {
  const destinations = await getDestinations();
  const names = destinations.map((d) => d.name);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : (names[0] ?? "");

  return {
    title: "Sri Lanka Destinations",
    description: clampDesc(
      `Explore Sri Lanka's finest destinations${list ? `: ${list}` : ""} — all with a private driver.`,
    ),
    alternates: { canonical: "/destinations" },
  };
}

/*
  ?region= — one job: which explorer tab opens. It is read in RegionExplorer,
  on the client, and this page does not touch it.

  That last part is a performance decision, and a large one. Reading
  `searchParams` in a server component opts the entire route out of static
  rendering — Next marks it ƒ, `export const revalidate = 60` above becomes
  dead code, and every visit pays for a fresh server render plus a Supabase
  round trip before a single byte reaches the browser. For a query string that
  only arrivals from the island map carry. Handing the read to the client
  returns the route to ISR: prerendered at build, served from the edge cache,
  revalidated in the background.

  Nothing about the behaviour changes. The tab correction happens on mount, in
  the same tick as ScrollToAnchor's scroll — which exists for exactly this
  navigation, because the #regions fragment has to be resolved client-side too.
  The visitor is being scrolled toward the panel as it switches.

  The query string used to do two jobs, and that was the earlier problem.
  Arriving from the island map filtered the guide grid *and* opened the explorer
  tab, so a region click landed on a summary bar ("1 destination · Region: The
  Wild South"), then a single lonely card, and only then — a full section
  further down — the explorer panel that actually answers the question. Two
  surfaces competing to be the answer to one click, the smaller and sparser of
  them going first.

  Both surfaces are still worth having, because they answer different questions:

    • The explorer answers "what is this region like?" — all seven regions, all
      thirty-one places, photographs and a line on each. Breadth. It is the
      primary way to explore this page and so it goes first.

    • The grid answers "what have you written up?" — the destinations with a
      guide of their own. Depth. Always the complete set, never filtered.

  An unrecognised slug degrades to the default view: RegionExplorer checks it
  against lib/regions.ts and keeps the first region, so ?region=nonsense is a
  normal page rather than an empty one.
*/
export default async function DestinationsPage() {
  const [all, settings] = await Promise.all([getDestinations(), getSettings()]);

  /*
    Which guide leads, and why it is derived rather than "the first one".

    Several destination records are illustrated with the same registry files
    the header slots draw from, and Sigiriya is both the first guide and the
    default header photograph — so the page opened on the Lion Rock and then
    showed the identical file again, at half width, one section later. The lead
    is the first guide whose photograph is not the header's; everything else
    keeps its order, and the skipped guide still appears in the grid. Comparing
    resolved srcs rather than hardcoding a slug means this survives the client
    changing either image from /admin/images.
  */
  const headerSrc = slotSrc(settings.images, "header-destinations");
  const lead = all.find((d) => d.image !== headerSrc) ?? all[0];
  const rest = lead ? all.filter((d) => d.slug !== lead.slug) : all;

  return (
    <>
      {/*
        "Nine islands in one" is authored copy, deliberately not derived from
        array length — it is a metaphor, not a count, and should change only by
        editorial decision.

        The intro is shorter than it was, and the cut took the unverifiable half
        with it: it opened "Few places on Earth pack this much variety…", a
        global comparative nobody could stand behind. What is left is the part
        that is both true and specific — four landscapes, one week's driving.
      */}
      <PageHeader
        eyebrow="Destinations"
        title="Nine islands in one"
        intro="Golden coasts, cloud forest, ancient citadels and big-cat country — inside a drivable week."
        /*
          Was a dusk sandbar on the east coast — a dark, low-contrast lagoon
          that could have been any warm country and read as a texture at header
          scale rather than as a place. Sigiriya is the island's signature
          landmark, the largest file in the registry at 2560px, and the one
          photograph a visitor can name before they have read a word. Editable
          from /admin/images; the default is what ships.
        */
        slot="header-destinations"
      />

      {/*
        #regions is a real landing target, not decoration. The island map links
        here as /destinations?region=…#regions so a region click arrives at the
        explorer with the right tab already open, rather than at the top of a
        full-height hero the visitor has already decided to skip. scroll-mt
        clears the fixed header; without it the section heading lands underneath
        it. If this id is ever renamed, IslandMap's `hash` prop, the homepage
        region index and ScrollToAnchor below all have to move with it.

        The browser resolves that fragment on a hard load. It does not on a
        client-side navigation, because this page has a loading.tsx and the
        router looks for the id while the skeleton is still mounted —
        ScrollToAnchor is what closes that gap, and the reason it is a component
        rather than a line of script is written out in the file.
      */}
      <ScrollToAnchor id="regions" />
      <section
        id="regions"
        aria-label="Explore by region"
        className="section scroll-mt-20 bg-dune/50"
      >
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="Explore by region"
            title="Seven regions, one island"
            intro="Sri Lanka changes character roughly every two hours of driving."
          />
          <RegionExplorer
            className="section-body"
            destinations={all.map((d) => ({
              slug: d.slug,
              name: d.name,
              region: d.region,
              image: d.image,
            }))}
          />
        </div>
      </section>

      <section className="section" aria-label="Destination guides">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          {all.length === 0 ? (
            /*
              Reached only if the catalogue itself comes back empty — the data
              source is down or unseeded. It is no longer the region-with-no-
              guides case, because nothing on this page filters by region any
              more; the explorer shows The North's four places whether or not
              any of them has a guide written.
            */
            <EmptyState
              eyebrow="Destinations"
              title="Our destination guides are being updated"
              body="Nothing is listed here just now. Tell us where you'd like to go and we'll take it from there."
              action={{ label: "Tell us where you're headed", href: "/book" }}
            />
          ) : (
            <>
              <SectionHeading
                eyebrow="Destination guides"
                title="Read before you go"
                intro="The places we've written up properly — what to see, when to come, how long to give them."
              />
              {/*
                data-qa scopes the QA harness's destination-card selector to
                this section. The explorer above also links to /destinations/…,
                and a page-wide `a[href^="/destinations/"]` count would mix the
                two. It sits on the wrapper rather than the grid now, so the
                lead tile is counted with the rest.
              */}
              <div data-qa="destination-grid" className="section-body">
                {/*
                  Hierarchy, not eleven identical tiles.

                  The grid was every guide at the same size, which is an index
                  rather than an invitation — nothing tells a first-time visitor
                  where to start, so the honest reading is that no place here is
                  more worth their week than any other. The first record leads
                  at editorial scale with the headline and opening line it
                  already carries; the rest keep the grid.
                */}
                {lead && (
                  <DestinationCard d={lead} index={0} variant="feature" />
                )}
                {rest.length > 0 && (
                  <div className="mt-12 grid grid-cols-2 gap-5 md:mt-16 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
                    {rest.map((d, i) => (
                      <DestinationCard key={d.slug} d={d} index={i % 4} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <CTABand
        title="Can't choose? You don't have to."
        body="Tell us what excites you most and we'll thread four or five of these into one route."
      />
    </>
  );
}

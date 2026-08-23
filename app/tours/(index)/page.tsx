import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, TourCard, CTABand, SectionHeading } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import IslandMap from "@/components/patterns/IslandMap";
import JourneyBuilder from "@/components/patterns/JourneyBuilder";
import ReadMore from "@/components/patterns/ReadMore";
import Img from "@/components/media/Img";
import SeasonSwitch from "@/components/tours/SeasonSwitch";
import FilteredCatalogue, {
  type CatalogueTour,
  type TourGroup,
} from "@/components/tours/FilteredCatalogue";
import { getSettings, getTours } from "@/lib/data";
import { assetBySrc, fromCmsUrl } from "@/lib/media/registry";
import { slotAsset, slotSrc } from "@/lib/media/slots";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
import { regions } from "@/lib/regions";
import { lowestDayRate, money, tripDays } from "@/lib/pricing";
import { PackageStance } from "@/components/patterns/TransportRates";

import { splitIfLong } from "@/lib/copy";
import {
  seasons,
  currentSeasonKey,
  type Season,
  type SeasonPick,
} from "@/lib/seasons";
import type { Tour } from "@/lib/tours";

/**
 * The transport figure that follows a duration in a meta line.
 *
 * Replaces "· From $1,850 per person", which priced a package that included
 * hotels. What a route costs to drive is knowable; what it costs to sleep is
 * not, so only the first half is quoted. One helper because this line appears
 * in three places on this page and they must not diverge.
 */
const transportNote = (duration: string): string => {
  const d = tripDays(duration);
  return d
    ? ` · transport from ${money(lowestDayRate * d)}`
    : ` · transport from ${money(lowestDayRate)} a day`;
};

/**
 * The photograph behind a journey.
 *
 * A tour record stores `image` as a bare URL, which flattens away the alt text
 * and the provenance the registry holds for that exact file. Looking the src
 * back up recovers both; anything uploaded through the CMS instead is wrapped
 * as a cms asset with the journey title as its alt.
 *
 * Deliberately not gated on `verifiedLocation`. That gate protects claims about
 * one named place — a destination card, a season panel. A journey photograph
 * illustrates a route across several of them and makes no such claim, and
 * gating it would blank every CMS-uploaded journey image the moment the client
 * changed one.
 */
const tourAsset = (t: { title: string; image: string }) =>
  assetBySrc(t.image) ?? fromCmsUrl(t.image, t.title);

/*
  Static, and it stays static.

  This page used to take `searchParams`, which is all it takes to turn a route
  into `ƒ` (Dynamic) in the App Router. Every visitor then paid for a server
  render and a Supabase round trip before the first byte, and the `revalidate`
  below was quietly doing nothing — there was no cached render to revalidate.
  The query string now reaches the two sections that care about it in the
  browser (see components/query-watcher.tsx), so the HTML is built once and
  served from the edge, and this line means what it says again.
*/
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Tour Packages",
  description:
    "Private Sri Lanka tour packages: day tours to Sigiriya, Kandy, Ella and Galle, multi-day island circuits, and leopard & elephant safaris — all with your own driver.",
  alternates: { canonical: "/tours" },
  // Filtered views are the same catalogue in a different order. Canonical keeps
  // them out of the index without making the links themselves nofollow.
};

const groups: TourGroup[] = [
  {
    key: "Multi-Day",
    eyebrow: "Multi-day journeys",
    title: "The island, end to end",
  },
  { key: "Day Tour", eyebrow: "Day tours", title: "One perfect day" },
  { key: "Safari", eyebrow: "Safaris", title: "Into the wild" },
];

/* ───────────────────────────── Seasonal panel ─────────────────────────────
   One season's worth of the rail. All four are rendered here, on the server,
   and handed to SeasonSwitch as children — see the note in that component for
   why the switching happens in the browser but the rendering does not. */
function SeasonPanel({
  season,
  tours,
  nowKey,
}: {
  season: Season;
  tours: Tour[];
  nowKey: string;
}) {
  const isNow = season.key === nowKey;
  const bySlug = (slug: string) => tours.find((t) => t.slug === slug);

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

  const blurb = splitIfLong(season.blurb);

  /* CC BY and CC BY-SA require the photographer to be named and the licence
     stated wherever the photograph appears. Only the Commons assets carry an
     `author`, and only the "stock" provenance carries a licence and a link, so
     both have to hold before there is a credit to render. The registry's own
     assets — the owner's photography and the Unsplash frames — need none. */
  const credit =
    season.image.author && season.image.provenance.kind === "stock"
      ? {
          author: season.image.author,
          license: season.image.provenance.license,
          url: season.image.provenance.url,
        }
      : null;

  return (
    <section className="section-tight">
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-14 lg:gap-20">
          {/* The photograph leads, and on a phone it leads literally.

              This section was the last place on the site where a visitor met
              type before they met the island: heading, paragraph and eight tab
              labels, all before the first image. Putting the picture first in
              the DOM fixes that at 375px without a single media query, and
              `md:order-2` moves it back to the right-hand column on a wide
              screen, where heading-then-prose is the correct reading order.

              Full-bleed below md — the negative margin cancels the container's
              px-5 exactly — because a photograph that reaches both edges is
              what separates a phone that feels like a magazine from one that
              feels like a form. */}
          <figure className="md:order-2 md:col-span-6 lg:col-span-7">
            <div className="img-frame -mx-5 aspect-[3/2] md:mx-0 md:aspect-[4/3] lg:aspect-[3/2]">
              {/* The gate stays on. Each of these frames is captioned with the
                  place it shows, and a season is itself a claim about where
                  the island is worth being — so an unverified photograph here
                  would be a worse lie than a gradient. */}
              <Img
                asset={season.image}
                requireVerifiedLocation
                fallbackTone="dune"
                fallbackPattern="contour"
                sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 58vw"
              />
            </div>
            {credit && (
              <figcaption className="mt-3 text-[11px] leading-relaxed text-ink/65">
                {season.image.depicts ?? season.image.alt} · {credit.author} ·{" "}
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-copper-deep"
                >
                  {credit.license}
                </a>
              </figcaption>
            )}
          </figure>

          <div className="md:order-1 md:col-span-6 lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-copper-deep">
              {isNow ? "Now in Sri Lanka" : "Planning ahead"}
            </p>
            <h2 className="h-display mt-3 text-3xl text-ink md:text-4xl">
              {season.label}
            </h2>
            <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-ink/65">
              {season.months}
            </p>
            <p className="mt-6 text-[17px] leading-relaxed text-ink/75">
              {blurb.lede}
            </p>
            {blurb.rest && (
              <ReadMore label="What that means" className="mt-4">
                {blurb.rest}
              </ReadMore>
            )}
          </div>
        </div>

        {/* Out of the two-column block and back to full width. The rail is
            navigation between the four panels, not part of any one of them. */}
        <ul className="mt-12 flex flex-wrap gap-2 md:mt-14">
          {seasons.map((s) => (
            <li key={s.key}>
              <Link
                href={s.key === nowKey ? "/tours" : `/tours?season=${s.key}`}
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
                <span className="text-[11px] text-ink/65">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Best journeys for this season */}
        <h3 className="mt-16 font-display text-2xl text-ink md:mt-20">
          Best journeys for {season.months}
        </h3>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
          {leads.map(({ pick: p, tour: t }) => {
            const why = splitIfLong(p.why);
            return (
              <article key={p.slug} className="group">
                {/*
                  The picture is the pitch.

                  This block used to open on the words "Seasonal favourite"
                  above a title and two paragraphs — the densest prose on the
                  page, and the only place on the site where a journey was
                  recommended without being shown. It is the same frame the
                  catalogue tiles use, so a seasonal pick and a catalogue card
                  now read as the same kind of object.
                */}
                <Link href={`/tours/${t.slug}`} className="block">
                  <div className="img-frame aspect-[16/10]">
                    <Img
                      asset={tourAsset(t)}
                      sizes="(max-width:768px) 100vw, 46vw"
                      fallbackTone="moss"
                      fallbackPattern="contour"
                      className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
                <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-copper-deep">
                  Seasonal favourite
                </p>
                <h4 className="font-display mt-2 text-2xl text-ink">
                  <Link
                    href={`/tours/${t.slug}`}
                    className="hover:text-copper-deep"
                  >
                    {t.title}
                  </Link>
                </h4>
                <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-ink/65">
                  {t.duration}
                  {transportNote(t.duration)}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
                  {why.lede}
                </p>
                {/* The reasoning behind a seasonal pick is often the most useful
                  paragraph on this page and also the longest. It stays — one
                  line down. */}
                {why.rest && (
                  <ReadMore label="Why we say so" className="mt-3">
                    {why.rest}
                  </ReadMore>
                )}
                <Link
                  href={`/tours/${t.slug}`}
                  className="link-line mt-6 inline-block text-[12px] uppercase tracking-[0.16em] text-copper-deep"
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
            <h3 className="mt-16 font-display text-xl text-ink md:mt-20">
              More ways to travel this season
            </h3>
            <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => {
                const t = bySlug(p.slug);
                if (!t) return null;
                return (
                  <li key={p.slug}>
                    <Link href={`/tours/${t.slug}`} className="group block">
                      {/* Smaller frame than the two picks above it, on purpose:
                          the hierarchy inside the season is the point, and a
                          third and fourth photograph at lead scale would flatten
                          it back out. */}
                      <div className="img-frame aspect-[4/3]">
                        <Img
                          asset={tourAsset(t)}
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 46vw, 30vw"
                          fallbackTone="dune"
                          fallbackPattern="contour"
                          className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <span className="font-display mt-4 block text-lg text-ink transition-colors group-hover:text-copper-deep">
                        {t.title}
                      </span>
                      <span className="mt-0.5 block text-[12px] uppercase tracking-[0.14em] text-ink/65">
                        {t.duration}
                        {transportNote(t.duration)}
                      </span>
                    </Link>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
                      {p.why}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="mt-12 text-[13px] leading-relaxed text-ink/65">
          Conditions vary from year to year — these are recommendations, not
          guarantees.
        </p>
      </div>
    </section>
  );
}

export default async function ToursPage() {
  const [all, settings] = await Promise.all([getTours(), getSettings()]);
  const nowKey = currentSeasonKey();

  /*
    Read once so the catalogue below can avoid repeating it — see the note on
    the lead tile. Resolving it here rather than inside the map keeps the
    comparison to one lookup for the whole page.
  */
  const headerSrc = slotSrc(settings.images, "header-tours");

  /* What crosses to the browser: the fields a filter and a card read, and two
     slug→name maps for the chips. Everything else the page shows — itineraries,
     highlights, inclusions, the media provenance behind every photograph —
     stays on this side of the wire. */
  const catalogue: CatalogueTour[] = all.map((t) => ({
    slug: t.slug,
    title: t.title,
    category: t.category,
    duration: t.duration,
    image: t.image,
    themeSlugs: t.themeSlugs,
    destinationSlugs: t.destinationSlugs,
  }));
  const themeNames = Object.fromEntries(
    experienceCategories.map((c) => [c.slug, c.name]),
  );
  const destinationNames = Object.fromEntries(
    destinations.map((d) => [d.slug, d.name]),
  );

  return (
    <>
      <PageHeader
        eyebrow="Curated routes"
        title="Journeys crafted, never copied"
        intro="Real itineraries, drivable tomorrow — take one as written or lift two days out of it."
        note="No fixed package price: you pay the transport day rate, all-inclusive, and keep your choice of where to stay."
        /*
          Was a hazy Trincomalee bay — flat light, no landmark, and nothing in
          the frame that says Sri Lanka to somebody who has never been. Nine
          Arch Bridge is the opposite on every count and it is a journey rather
          than a view, which is what this page sells. Editable from
          /admin/images; the default is what ships.
        */
        slot="header-tours"
      />

      {/* ═══════════ Journeys by region — map ═══════════
          IslandMap is reused rather than cloned, with basePath pointing at this
          page, so a region click lands on /tours?region=… and is picked up by
          the filter below. The coastline, hotspots, keyboard behaviour and
          always-present region list all come along.

          Region membership is derived from each tour's own destinationSlugs —
          no `region` field was added to the tour model. */}
      <section className="section grain relative overflow-hidden bg-deep">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            dark
            eyebrow="Journeys across Sri Lanka"
            title="Start with a region"
            intro="Choose a region to see the journeys that go there."
          />
          <div className="section-body">
            <IslandMap basePath="/tours" />
          </div>
        </div>
      </section>

      {/* ═══════════ The catalogue ═══════════
          Everything below is the unfiltered catalogue, rendered here and handed
          to FilteredCatalogue as children. It is what ships in the HTML and
          what a crawler sees; the browser replaces it only when the URL
          actually carries a filter. */}
      <FilteredCatalogue
        tours={catalogue}
        groups={groups}
        themeNames={themeNames}
        destinationNames={destinationNames}
      >
        {groups.map((g, gi) => {
          const list = all.filter((t) => t.category === g.key);
          if (list.length === 0) return null;

          /*
            The first group — the multi-day journeys, the thing this business
            actually is — leads with one route at editorial scale, then grids
            the rest. Three identical grids of identical tiles is an index; it
            tells a first-time visitor that no journey here is more worth their
            fortnight than any other, which is not what we think and not what
            we would say out loud. One tile at four times the area is the
            recommendation, made in photography rather than in a badge.

            Derived from position, not hardcoded to a slug, so reordering
            `groups` or the catalogue moves the lead with it — with one guard:
            a journey whose photograph is the header photograph is skipped.
            Several routes are illustrated with the same registry files the
            header slots draw from, and the first multi-day journey happened to
            be one of them, so the page opened on Nine Arch Bridge and then
            showed it again at full width two screens later. Comparing against
            the resolved header src rather than a hardcoded filename means this
            keeps working after the client changes either one from /admin/images.
          */
          const feature =
            gi === 0
              ? (list.find((t) => t.image !== headerSrc) ?? list[0])
              : undefined;
          const grid = feature
            ? list.filter((t) => t.slug !== feature.slug)
            : list;

          return (
            <section
              key={g.key}
              className={`section ${gi % 2 ? "bg-dune/60" : ""}`}
            >
              <div className="mx-auto max-w-wrap px-5 md:px-8">
                <SectionHeading eyebrow={g.eyebrow} title={g.title} />
                <div className="section-body">
                  {feature && (
                    <TourCard tour={feature} index={0} variant="feature" />
                  )}
                  {grid.length > 0 && (
                    <div
                      className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 ${
                        feature ? "mt-10 md:mt-14" : ""
                      }`}
                    >
                      {grid.map((t, i) => (
                        <TourCard key={t.slug} tour={t} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* Catalogue genuinely empty (no data at all), distinct from "no match",
            which FilteredCatalogue owns. */}
        {all.length === 0 && (
          <section className="section">
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
            Part of the unfiltered catalogue only: a filtered view already
            answers "what goes here?", and repeating the whole index beneath it
            would bury the answer.

            `region.places` is editorial copy naming towns we cover; most have no
            destination page. Only the ones backed by a real route are linked, so
            this index cannot produce a 404. */}
        <section className="section-tight">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <SectionHeading
              eyebrow="By region"
              title="Where each journey goes"
            />
            <div className="section-body divide-y divide-ink/10 border-y border-ink/10">
              {regions.map((r, ri) => {
                const inRegion = all.filter((t) =>
                  (t.destinationSlugs ?? []).some((d) =>
                    r.destinationSlugs.includes(d),
                  ),
                );
                return (
                  <div
                    key={r.slug}
                    className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-12"
                  >
                    <div className="md:col-span-4">
                      {/*
                        Seven photographs where there were none.

                        This directory was the longest unbroken wall of type on
                        the site: seven region names, seven lines of character
                        copy, thirty-one place names and seventeen journey
                        titles, and not one image to tell a reader what any of
                        it looks like. A region is a landscape before it is a
                        list, so each row now opens on one.

                        Every frame is a slot, so the client can put their own
                        photograph of a region here from /admin/images without
                        touching this file; lib/media/slots.ts holds the default
                        each one falls back to.
                      */}
                      <div className="img-frame aspect-[4/3]">
                        <Img
                          asset={slotAsset(settings.images, `region-${r.slug}`)}
                          sizes="(max-width:768px) 100vw, 30vw"
                          fallbackTone={ri % 2 === 0 ? "moss" : "dune"}
                          fallbackPattern="contour"
                        />
                      </div>
                      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-copper-deep">
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
                            (d) => d.name.toLowerCase() === p.toLowerCase(),
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
                          <Link
                            href="/book"
                            className="link-line text-copper-deep"
                          >
                            Ask us what&apos;s possible
                          </Link>
                          .
                        </p>
                      ) : (
                        /*
                          A directory, not a second catalogue.

                          Each row used to carry three highlights under the
                          title — seven regions, seventeen journeys, fifty-one
                          fragments of copy the reader had already met on the
                          cards above and would meet again on the journey page
                          itself. It was the longest wall of type on the site
                          and it earned nothing: nobody chooses a route from
                          this section, they use it to find out whether we go
                          somewhere. Title, length, price. Then a link.
                        */
                        <ul className="space-y-4">
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
                                  {transportNote(t.duration)}
                                </span>
                              </Link>
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
      </FilteredCatalogue>

      {/* ═══════════ Season selector + curated journeys ═══════════
          Hidden once the catalogue is filtered; a filtered view has already
          answered the visitor's question.

          It used to sit directly under the header, which meant a page called
          Journeys opened on an essay about the weather: a photograph and a
          heading, then two recommendation paragraphs, then a twelve-item prose
          list — roughly two full screens before the first journey a visitor
          could actually book. Season is the second question, not the first, and
          it now sits where it is asked: after you have seen what there is.

          Moving it below the catalogue rather than above the map is what the
          map requires. IslandMap writes ?region= into the URL and the catalogue
          reads it, so the map has to stay above the thing it filters. */}
      <SeasonSwitch
        nowKey={nowKey}
        panels={seasons.map((s) => ({
          key: s.key,
          node: <SeasonPanel season={s} tours={all} nowKey={nowKey} />,
        }))}
      />

      {/* ═══════════ How these routes are priced ═══════════
          Placed after the catalogue and before the builder, which is where the
          question actually lands: someone who has just read six itineraries
          without seeing a total is looking for this paragraph. */}
      <section className="section bg-dune">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <PackageStance />
        </div>
      </section>

      {/* ═══════════ Build your own journey ═══════════
          Client-side selections only. No reservation, no new table — the CTA
          hands off to /book through the existing query/context system. */}
      <section className="section grain relative overflow-hidden bg-deep">
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            dark
            eyebrow="Build your own journey"
            title="Or start from a blank page"
            intro="Five short questions, all optional. Nothing here is a booking."
          />
          <div className="section-body">
            <JourneyBuilder />
          </div>
        </div>
      </section>

      <CTABand
        title="Don't see your perfect trip?"
        body="Tell us your dates and interests and we'll design a route that's yours alone."
      />
    </>
  );
}

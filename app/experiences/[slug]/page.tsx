import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Compass } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import ExperienceGallery from "@/components/patterns/ExperienceGallery";
import { CTABand, TourCard, DestinationCard } from "@/components/ui";
import { getSettings, getTours, getDestinations } from "@/lib/data";
import {
  getPublishedExperience,
  publishedExperiences,
} from "@/lib/experiences";
import {
  experienceCredits,
  experienceGalleryAssets,
} from "@/lib/media/experiences";
import { slotAsset } from "@/lib/media/slots";
import { clampDesc } from "@/lib/seo";
import { siteUrl, waLink } from "@/lib/site";

export const revalidate = 60;

/**
 * Prebuild only the categories that have journeys.
 *
 * An empty category is deliberately absent from this list *and* 404s below —
 * `getPublishedExperience` returns undefined for it. The two must agree: a
 * route that renders on demand but never appears in the index is exactly the
 * thin, orphaned page that costs a travel site its crawl budget.
 */
export async function generateStaticParams() {
  const published = publishedExperiences(await getTours());
  return published.map((e) => ({ slug: e.category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const experience = getPublishedExperience(await getTours(), params.slug);
  if (!experience) return {};
  const { category, tours } = experience;

  return {
    title: `${category.name} in Sri Lanka`,
    description: clampDesc(
      `${category.blurb} ${tours.length} private ${
        tours.length === 1 ? "journey" : "journeys"
      } — ${category.activities.join(", ")}.`,
    ),
    alternates: { canonical: `/experiences/${category.slug}` },
    openGraph: {
      type: "website",
      url: `/experiences/${category.slug}`,
      siteName: "Island Route Sri Lanka",
      locale: "en_GB",
      title: `${category.name} in Sri Lanka`,
      description: category.blurb,
      /*
        No image, by the same rule the tiles follow: there is no verified
        photograph that means "Wildlife" rather than one specific animal in one
        specific park. A card with no image is better than a card whose image is
        a claim we can't stand behind.
      */
    },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: { slug: string };
}) {
  const [tours, settings] = await Promise.all([getTours(), getSettings()]);
  const experience = getPublishedExperience(tours, params.slug);
  if (!experience) notFound();

  const { category, tours: themeTours } = experience;
  const allDestinations = await getDestinations();

  /*
    Every destination the journeys on this page call at — read off the journeys
    themselves, never authored. Same discipline as the destination pages: the
    relationship lives in `destinationSlugs`, so a place appears only because a
    journey carrying this theme genuinely goes there.

    Note what this list is NOT, because the wording downstream depends on it. It
    is not "places where you can do this". The Grand Island Circuit carries the
    Tea Country theme and also calls at Mirissa and Colombo, so both appear
    here — captioning this section "Where it happens" would assert that Mirissa
    is tea country, which is false. The heading states the derivation instead.
  */
  const destinationSlugs = new Set(
    themeTours.flatMap((t) => t.destinationSlugs ?? []),
  );
  const relatedDestinations = allDestinations.filter((d) =>
    destinationSlugs.has(d.slug),
  );

  const others = publishedExperiences(tours).filter(
    (e) => e.category.slug !== category.slug,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} in Sri Lanka`,
    description: category.blurb,
    url: `${siteUrl}/experiences/${category.slug}`,
    about: category.activities.join(", "),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: themeTours.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        url: `${siteUrl}/tours/${t.slug}`,
      })),
    },
  };

  /* Undefined when the hero fell back to the gradient, or when the photograph
     is the owner's own — in both cases there is nothing to attribute. */
  const heroCredit = experienceCredits([category.slug])[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
        Hero — the category's photograph, at full strength.

        It used to run at `opacity-70` under a `from-deep/80 via-deep/70
        to-deep` wash, which left about a fifth of the photograph visible: the
        page opened on a dark green rectangle that happened to have been a
        beach. The photograph is the only thing on this page that can tell a
        visitor what "Tea Country" feels like, and it was the thing hardest to
        see.

        It now covers the frame at full opacity, at roughly four times the
        height it had, with a single scrim anchored to the bottom edge. The
        navbar is opaque on this route (`solid` unless the path is `/`), so
        unlike the homepage this hero needs nothing at the top — the whole
        upper half of the crop is untouched.

        ── Why only two lines of type are left on the picture ─────────────

        Measured, not guessed. Hide the type, sample the composited pixels
        behind every run, take the brightest one — the worst case for light
        text — and the scrim opacity each run needs to clear WCAG falls out of
        it. Over the brightest of the twelve category photographs: 0.58 for the
        title and the deck, which are both large text at 3:1, and 0.83 for an
        11px mango eyebrow at 4.5:1.

        That last number is the whole design. The eyebrow sat at the *top* of
        the copy block — the point furthest from the bottom edge, where a
        bottom-anchored scrim is by definition weakest — and asked for the
        heaviest paint on the page. Buying it would have meant covering the
        bottom three-quarters of every crop in near-solid colour, which is the
        thing this pass exists to undo.

        So the breadcrumb and the two counts moved to the strip below, onto the
        page's own sand ground, where they are 5.9:1 with nothing over them at
        all. What is left on the photograph is what earns being there: the
        category's name, and the one italic line that says what it feels like.
        Both are large text and so need 3:1, which a scrim that only carries
        weight in the bottom third of the frame can pay for. Measured across all
        twelve categories at both viewports, the worst case as shipped is 3.45:1
        on desktop and 3.37:1 on a phone.
      */}
      <section className="relative flex min-h-[84svh] items-end overflow-hidden bg-deep md:min-h-[90svh] lg:h-[min(90svh,54rem)] lg:min-h-0">
        <Img
          asset={slotAsset(settings.images, `experience-${category.slug}`)}
          requireVerifiedLocation
          sizes="100vw"
          priority
          fallbackTone="moss"
          fallbackPattern="contour"
          /*
            The site's own hero entrance, finally wired to something. It was
            authored in globals.css and exported from motion.tsx and had never
            been used by any page: a 2.2s settle from scale(1.08) to 1 on the
            site's standard ease-out. On a frame this size it reads as a film
            opening rather than as an effect, and because it lands on the
            <img> — already absolutely positioned by next/image's fill mode —
            it needs no wrapper element. The global reduced-motion rule
            collapses it to a single frame.
          */
          className="ken-burns"
        />

        {/*
          Bottom-anchored and eased, not a full-frame ramp.

          Capped at 60% of the frame on a phone and 54% on desktop, and shaped
          so the weight lands where the type actually is. The title's top edge
          sits about 35% up a desktop frame and 28% up a phone one; the ramp is
          between 0.55 and 0.70 at those points, which is what large text over
          the brightest of the twelve crops needs. Everything above the copy
          falls away fast — under 0.2 by 88% of the gradient's own height, and
          nothing at all above 54–60% of the frame.

          Eight stops rather than three because the falloff has to be a curve.
          A linear ramp of the same weight reads as a grey wash with a visible
          horizon partway up the picture; an eased one finishes somewhere the
          eye does not find a line.

          Two stop sets because the geometry differs, not for taste, and the
          desktop one is the heavier of the two: the same two lines sit higher
          up a taller frame there, so its curve is still paying out at a point
          where the phone's has already done its work. If the copy or the frame
          height changes these need re-measuring; they are positional, not
          decorative.

          The colour is written out in rgba rather than taken from the token
          because Tailwind cannot interpolate a named colour across eight
          stops. It is one of five files that spell `deep` out this way —
          `grep 'rgba(3,39,34'` finds all of them — so a palette change has to
          reach them by hand.
        */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(to_top,rgba(3,39,34,0.90)_0%,rgba(3,39,34,0.86)_16%,rgba(3,39,34,0.80)_30%,rgba(3,39,34,0.71)_44%,rgba(3,39,34,0.60)_58%,rgba(3,39,34,0.41)_74%,rgba(3,39,34,0.17)_88%,transparent_100%)] md:h-[54%] md:bg-[linear-gradient(to_top,rgba(3,39,34,0.90)_0%,rgba(3,39,34,0.87)_16%,rgba(3,39,34,0.82)_30%,rgba(3,39,34,0.75)_44%,rgba(3,39,34,0.66)_58%,rgba(3,39,34,0.46)_74%,rgba(3,39,34,0.19)_88%,transparent_100%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-wrap px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-44">
          {/* `immediate`: this is the first heading on the page and it is
              always above the fold. Inside a scroll-triggered Reveal it was
              painted at opacity 0 and waited for hydration, which put first
              contentful paint behind the JavaScript bundle. */}
          <Reveal immediate>
            <h1 className="h-display max-w-3xl text-5xl leading-[1.04] text-sand md:text-7xl lg:text-[5.25rem]">
              {category.name}
            </h1>
            {/*
              24px on a phone, not 20px. The deck is set on the photograph, and
              WCAG's large-text allowance starts at 24px — one step of type
              size is the difference between needing 3:1 and needing 4.5:1
              behind it, and 4.5:1 over a bright crop costs another 0.15 of
              scrim across the whole block.
            */}
            <p className="mt-5 max-w-2xl font-display-italic text-2xl leading-snug text-sand/90 md:mt-6 md:text-[1.75rem]">
              {category.blurb}
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        The orientation strip: where you are, what is here, and who took the
        picture — everything the hero used to carry in 11px type over a
        photograph, set on paper instead.

        The credit is the reason this exists in its current shape. CC BY / BY-SA
        require the photographer named and the licence stated wherever the image
        is used, and that line used to sit inside the hero at 11px in sand/55 —
        the least legible spot on the page, for the one line that is a legal
        obligation rather than a design choice.
      */}
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-ink/10 py-5 text-[13px] text-ink/70">
          <nav aria-label="Breadcrumb">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 uppercase tracking-[0.14em] text-copper-deep transition-colors hover:text-ink"
            >
              <Compass size={13} aria-hidden /> All experiences
            </Link>
          </nav>
          <span>
            {themeTours.length} private{" "}
            {themeTours.length === 1 ? "journey" : "journeys"}
          </span>
          {relatedDestinations.length > 0 && (
            <span>
              {relatedDestinations.length}{" "}
              {relatedDestinations.length === 1
                ? "destination"
                : "destinations"}{" "}
              on these routes
            </span>
          )}
          {heroCredit && (
            <span className="text-ink/65 lg:ml-auto">
              Photograph: {heroCredit.author} ·{" "}
              <a
                href={heroCredit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/25 underline-offset-2 transition-colors hover:text-copper-deep"
              >
                {heroCredit.license}
              </a>{" "}
              · Wikimedia Commons
            </span>
          )}
        </div>
      </div>

      {/* What it covers + how to act on it */}
      <section className="pb-14 pt-12 md:pb-20 md:pt-16">
        <div className="mx-auto grid max-w-wrap gap-12 px-5 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="eyebrow mb-5 text-copper-deep">
                What {category.name.toLowerCase()} covers
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {category.activities.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-3 text-[15px] text-ink/75"
                  >
                    <Check
                      size={17}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-copper-deep"
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal index={1}>
              <p className="mt-9 border-l-2 border-copper/30 pl-5 text-[15px] leading-relaxed text-ink/70">
                Every journey below is private and chauffeur-driven, so the
                itinerary bends around the experience rather than the other way
                round. If none of them is quite it, we&apos;ll build one that
                is.
              </p>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <Reveal className="border border-ink/10 bg-white/60 p-7 md:p-9 lg:sticky lg:top-28">
              <p className="eyebrow text-copper-deep">Build it into a trip</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
                Tell us this is what you&apos;re after and we&apos;ll thread it
                through a route that works for your dates — including the best
                months for it.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/book?theme=${encodeURIComponent(category.slug)}`}
                  className="bg-ink px-7 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep"
                >
                  Plan a {category.name.toLowerCase()} journey
                </Link>
                <Link
                  href={`/tours?theme=${encodeURIComponent(category.slug)}`}
                  className="border border-ink/20 px-7 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-copper hover:text-copper-deep"
                >
                  Filter all journeys
                </Link>
                <a
                  href={waLink(
                    `Hello Island Route! I'm interested in ${category.name.toLowerCase()} in Sri Lanka.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[12px] uppercase tracking-[0.16em] text-ink/65 transition-colors hover:text-copper-deep"
                >
                  Or ask us on WhatsApp
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/*
        The photographs, between the description and the journeys.

        Above this the page is words — a paragraph, a checklist and a booking
        aside — and below it the journey cards each carry one small image. The
        band is the only place a visitor can look at the *place* at size, and
        it belongs here rather than lower down: it answers "what does this
        actually look like" while they are still deciding whether they want it,
        not after they have started comparing prices.
      */}
      <ExperienceGallery
        assets={experienceGalleryAssets(category.slug)}
        heading={`${category.name} in Sri Lanka`}
      />

      {/* The journeys — the reason this page exists */}
      <section className="bg-dune/60 py-16 md:py-24" aria-labelledby="journeys">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <h2 id="journeys" className="eyebrow text-copper-deep">
            {themeTours.length === 1
              ? "The journey"
              : `${themeTours.length} journeys built around it`}
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {themeTours.map((t, i) => (
              <TourCard key={t.slug} tour={t} index={i % 3} />
            ))}
          </div>
        </div>
      </section>

      {relatedDestinations.length > 0 && (
        <section className="py-16 md:py-24" aria-labelledby="where">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <h2 id="where" className="eyebrow text-copper-deep">
              Where these journeys go
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {relatedDestinations.map((d, i) => (
                <DestinationCard key={d.slug} d={d} index={i % 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="border-t border-ink/10 py-14 md:py-20">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <h2 className="eyebrow text-copper-deep">Other ways to travel</h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-10 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((e) => (
                <li key={e.category.slug} className="border-b border-ink/10">
                  <Link
                    href={`/experiences/${e.category.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-5"
                  >
                    <span>
                      <span className="font-display text-xl text-ink transition-colors group-hover:text-copper-deep">
                        {e.category.name}
                      </span>
                      <span className="mt-1 block text-[12px] uppercase tracking-[0.12em] text-ink/65">
                        {e.tours.length}{" "}
                        {e.tours.length === 1 ? "journey" : "journeys"}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      aria-hidden
                      className="shrink-0 translate-y-1 text-ink/60 transition-all group-hover:translate-x-1 group-hover:text-copper-deep"
                    />
                    <span className="sr-only">— {e.category.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CTABand
        title={`Ready for ${category.name.toLowerCase()} in Sri Lanka?`}
        body="Send us your dates and we'll come back with a route, a season note and a straight price — no forms lost in inboxes, no pressure."
      />
    </>
  );
}

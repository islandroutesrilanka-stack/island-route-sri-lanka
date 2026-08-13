import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Compass } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import { CTABand, TourCard, DestinationCard } from "@/components/ui";
import { getTours, getDestinations } from "@/lib/data";
import {
  getPublishedExperience,
  publishedExperiences,
} from "@/lib/experiences";
import { experienceAsset, experienceCredits } from "@/lib/media/experiences";
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
  const tours = await getTours();
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

      {/* Hero — the category's photograph where one has been verified, and the
          contour treatment where none has. `requireVerifiedLocation` is what
          keeps the second case from becoming "a photograph of somewhere else
          captioned Tea Country"; the className lands on both branches, so the
          fallback is positioned and dimmed exactly as the photograph is. */}
      <section className="relative overflow-hidden bg-deep pt-32 pb-16 md:pt-44 md:pb-24">
        <Img
          asset={experienceAsset(category.slug)}
          requireVerifiedLocation
          sizes="100vw"
          priority
          fallbackTone="moss"
          fallbackPattern="contour"
          className="absolute inset-0 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/45 to-deep" />

        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-5">
              <Link
                href="/experiences"
                className="eyebrow inline-flex items-center gap-2 text-copper-light transition-colors hover:text-sand"
              >
                <Compass size={13} aria-hidden /> Experiences
              </Link>
            </nav>
            <h1 className="h-display max-w-3xl text-5xl text-sand md:text-7xl">
              {category.name}
            </h1>
            <p className="mt-5 max-w-2xl font-display-italic text-xl text-sand/85 md:text-2xl">
              {category.blurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-sand/75">
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
            </div>
          </Reveal>

          {/* CC BY / BY-SA require the photographer named and the licence
              stated wherever the image is used — including here, where the
              photograph is a dimmed backdrop rather than the subject. */}
          {heroCredit && (
            <p className="mt-10 text-[11px] text-sand/55">
              Photograph: {heroCredit.author} ·{" "}
              <a
                href={heroCredit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-sand/20 underline-offset-2 transition-colors hover:text-copper-light"
              >
                {heroCredit.license}
              </a>{" "}
              · Wikimedia Commons
            </p>
          )}
        </div>
      </section>

      {/* What it covers + how to act on it */}
      <section className="py-14 md:py-20">
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

import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, CTABand } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import ExperienceCard from "@/components/patterns/ExperienceCard";
import { Reveal } from "@/components/motion";
import { getTours } from "@/lib/data";
import { publishedExperiences } from "@/lib/experiences";
import { experienceCredits } from "@/lib/media/experiences";
import { media } from "@/lib/media/registry";
import { clampDesc } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

/**
 * The experience axis.
 *
 * Destinations answer "where", journeys answer "how long and how much".
 * This answers the question most travellers actually arrive with — "what do I
 * want to *do*" — and it is the axis the site has been missing.
 *
 * Only categories with journeys behind them appear; see `publishedExperiences`
 * for why that is derived rather than listed.
 */
export async function generateMetadata(): Promise<Metadata> {
  const published = publishedExperiences(await getTours());
  const names = published.map((e) => e.category.name);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : (names[0] ?? "");

  return {
    title: "Sri Lanka Experiences",
    description: clampDesc(
      `Travel Sri Lanka by what moves you${
        list ? `: ${list}` : ""
      } — private, chauffeur-driven journeys built around it.`,
    ),
    alternates: { canonical: "/experiences" },
    openGraph: {
      type: "website",
      url: "/experiences",
      siteName: "Island Route Sri Lanka",
      locale: "en_GB",
      title: "Sri Lanka Experiences",
      description:
        "Ways to travel Sri Lanka — and the journeys that deliver them.",
    },
  };
}

export default async function ExperiencesPage() {
  const tours = await getTours();
  const published = publishedExperiences(tours);

  const [lead, ...rest] = published;

  /*
    Counted across categories, not summed from them: a journey carrying three
    themes is one journey, and adding the per-category counts would report the
    catalogue as roughly twice its real size. The distinct-slug set is the only
    honest way to state this.
  */
  const journeyCount = new Set(
    published.flatMap((e) => e.tours.map((t) => t.slug)),
  ).size;

  /*
    Attribution for the Commons photography on the tiles. Required by CC BY and
    CC BY-SA, so this is an obligation rather than a nicety — but it is derived
    from what actually rendered, so a category that falls back to the gradient
    contributes no credit line, and the owner's own photographs contribute none
    either.
  */
  const credits = experienceCredits(published.map((e) => e.category.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sri Lanka Experiences",
    url: `${siteUrl}/experiences`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: published.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.category.name,
        description: e.category.blurb,
        url: `${siteUrl}/experiences/${e.category.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Experiences"
        title="Travel by what moves you"
        intro="Most people don't start with a map — they start with a feeling. Leopards at first light, a train through tea country, a coast that's working in December. Choose the thread and we'll build the route around it."
        /* Decorative (alt=""), and no longer muted — the header shows it at
           full strength, so it has to hold up as a photograph rather than as a
           texture. Verified Sri Lankan location, like every other image here. */
        image={media.mirissaCoconutHill.src}
      />

      {published.length === 0 ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="Experiences"
              title="We're rebuilding this section"
              body="Nothing is listed here just now. Tell us what you'd like to do in Sri Lanka and we'll tell you what's possible."
              action={{ label: "Tell us what you're after", href: "/book" }}
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
        <>
          {/* Factual summary strip — both numbers are derived, neither is copy. */}
          <section className="border-b border-ink/10 py-6">
            <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-6 gap-y-3 px-5 md:px-8">
              <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
                {published.length} ways to travel
              </p>
              <span
                aria-hidden
                className="hidden h-4 w-px bg-ink/15 sm:block"
              />
              <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
                {journeyCount} {journeyCount === 1 ? "journey" : "journeys"}{" "}
                across them
              </p>
              <Link
                href="/tours"
                className="link-line ml-auto text-[12px] uppercase tracking-[0.16em] text-copper-deep"
              >
                See all journeys
              </Link>
            </div>
          </section>

          <section className="py-16 md:py-24" aria-labelledby="all-experiences">
            <div className="mx-auto max-w-wrap px-5 md:px-8">
              <h2 id="all-experiences" className="sr-only">
                All experiences
              </h2>

              {/* One lead tile carries the page; the rest sit in an even grid.
                  Nothing here assumes a particular number of categories. */}
              <ExperienceCard experience={lead} index={0} variant="feature" />

              {rest.length > 0 && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {rest.map((e, i) => (
                    <ExperienceCard
                      key={e.category.slug}
                      experience={e}
                      index={i % 3}
                    />
                  ))}
                </div>
              )}

              {/* Closed, this is one quiet line under the grid; open, it names
                  every photographer and links each licence. Same pattern as the
                  region explorer, for the same legal reason. */}
              {credits.length > 0 && (
                <details className="group mt-10 border-t border-ink/10 pt-5">
                  <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-ink/65 transition-colors marker:content-none hover:text-ink">
                    Photography credits
                    <span
                      aria-hidden
                      className="ml-2 inline-block transition-transform group-open:rotate-90"
                    >
                      ›
                    </span>
                  </summary>
                  {/* /65 is the lowest ink opacity that clears 4.5:1 on this
                      ground (5.02:1); /45 was 2.8:1 and took the licence links
                      down with it, since they inherit their colour from here. */}
                  <ul className="mt-4 grid gap-2 text-[12px] leading-relaxed text-ink/65 sm:grid-cols-2 lg:grid-cols-3">
                    {credits.map((c) => (
                      <li key={c.src}>
                        <span className="text-ink/85">{c.label}</span> ·{" "}
                        {c.author} ·{" "}
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-copper-deep"
                        >
                          {c.license}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </section>

          {/* The honest counterweight to a category page: not everything a
              traveller wants has a published journey, and asking still works. */}
          <section className="bg-dune/60 py-14 md:py-20">
            <div className="mx-auto max-w-wrap px-5 md:px-8">
              <Reveal className="max-w-2xl">
                <p className="eyebrow text-copper-deep">Not listed here?</p>
                <h2 className="h-display mt-3 text-3xl text-ink md:text-4xl">
                  The private ones rarely make the catalogue
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
                  Cooking with a family in Galle, an Ayurveda week that
                  isn&apos;t a spa menu, a walk nobody sells tickets for — these
                  get arranged by conversation, not by browsing. Tell us what
                  you had in mind.
                </p>
                <Link
                  href="/book"
                  className="mt-8 inline-block bg-ink px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep"
                >
                  Plan your journey
                </Link>
              </Reveal>
            </div>
          </section>
        </>
      )}

      <CTABand
        title="Tell us what you want to do."
        body="We'll tell you when to come, how long it takes and what it costs — usually within a few hours, always from someone who has driven the route."
      />
    </>
  );
}

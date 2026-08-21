import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toOgImage } from "@/lib/images";
import { clampDesc } from "@/lib/seo";
import { Check, Clock, Tag } from "lucide-react";
import { Reveal } from "@/components/motion";
import { CTABand, TourCard } from "@/components/ui";
import GradientPanel from "@/components/media/GradientPanel";
import { getTours, getTourBySlug } from "@/lib/data";
import { waLink, site } from "@/lib/site";
import { lowestDayRate, money, tripDays } from "@/lib/pricing";
import { PackageStance, TripCost } from "@/components/patterns/TransportRates";

export const revalidate = 60;

/**
 * Prebuild every tour page at deploy time rather than rendering each one on
 * its first request. With a catalogue this size there is no reason for any
 * visitor to pay the cost of a cold render.
 */
export async function generateStaticParams() {
  const tours = await getTours();
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tour = await getTourBySlug(params.slug);
  if (!tour) return {};
  return {
    title: tour.title,
    description: clampDesc(tour.excerpt),
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      type: "article",
      url: `/tours/${tour.slug}`,
      siteName: "Island Route Sri Lanka",
      locale: "en_GB",
      title: tour.title,
      description: tour.excerpt,
      images: [{ url: toOgImage(tour.image), width: 1200, height: 630, alt: tour.title }],
    },
  };
}

export default async function TourPage({ params }: { params: { slug: string } }) {
  const tours = await getTours();
  const tour = tours.find((t) => t.slug === params.slug);
  if (!tour) notFound();

  const related = tours
    .filter((t) => t.slug !== tour.slug && t.category === tour.category)
    .slice(0, 3);

  /* Length of the route, for the transport figures. Null when the duration
     string carries no day count, in which case every surface below falls back
     to the day rate on its own rather than inventing a total. */
  const days = tripDays(tour.duration);

  // Rich-result markup so Google can show the trip, price and breadcrumb trail
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.excerpt,
        // Omitted rather than sent empty: `"image": ""` is an invalid value in
        // structured data, where a missing property is simply a missing one.
        ...(tour.image ? { image: tour.image } : {}),
        touristType: tour.category,
        provider: { "@type": "TravelAgency", name: site.name, url: site.url },
        itinerary: tour.itinerary?.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${d.day}: ${d.title}`,
          description: d.detail,
        })),
        /*
          A UnitPriceSpecification, not a flat `price`, because there is no
          longer a package price to state. What is genuinely for sale is a
          vehicle and chauffeur by the day, so that is what the markup says —
          and it stays valid whatever length the guest ends up travelling.
          Emitting a fixed total here while the page shows a day rate would be
          the kind of mismatch that costs a rich result.
        */
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${site.url}/tours/${tour.slug}`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: lowestDayRate,
            priceCurrency: "USD",
            unitCode: "DAY",
            referenceQuantity: {
              "@type": "QuantitativeValue",
              value: 1,
              unitCode: "DAY",
            },
            description:
              "Private vehicle with English-speaking chauffeur guide, per vehicle per day, inclusive of fuel, tolls, parking and the driver's own costs. Accommodation is not included.",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${site.url}/tours` },
          { "@type": "ListItem", position: 3, name: tour.title },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative bg-deep pt-32 md:pt-44 pb-16 md:pb-20 overflow-hidden">
        {/* Empty is a real state — a journey written before anyone had a
            verified photograph of its region keeps the gradient rather than
            borrowing someone else's. next/image with src="" logs a React error
            and paints nothing, so the treatment stands in explicitly. */}
        {tour.image ? (
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
        ) : (
          <GradientPanel tone="deep" pattern="contour" className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-deep/75 via-deep/65 to-deep" />
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <Reveal>
            <p className="eyebrow text-mango">{tour.category}</p>
            <h1 className="h-display mt-3 text-4xl md:text-6xl text-sand max-w-3xl">
              {tour.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sand/80 text-sm">
              <span className="inline-flex items-center gap-2">
                <Clock size={15} className="text-copper-light" /> {tour.duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <Tag size={15} className="text-copper-light" />{" "}
                {days
                  ? `Transport from ${money(lowestDayRate * days)}, all-inclusive`
                  : `Transport from ${money(lowestDayRate)} a day`}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 lg:grid-cols-12">
          {/* Main */}
          <div className="lg:col-span-7 space-y-12">
            <Reveal>
              <p className="font-display text-2xl leading-relaxed text-ink/85">
                {tour.excerpt}
              </p>
            </Reveal>

            <Reveal>
              <h2 className="eyebrow text-copper-deep mb-5">Highlights</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-[15px] text-ink/75">
                    <Check size={17} className="mt-0.5 shrink-0 text-copper-deep" />
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>

            {tour.itinerary && (
              <div>
                <h2 className="eyebrow text-copper-deep mb-6">Itinerary</h2>
                <div className="space-y-0">
                  {tour.itinerary.map((d, i) => (
                    <Reveal key={d.day} index={i}>
                      <div className="relative border-l-2 border-copper/25 pl-7 pb-9 last:pb-0">
                        <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-copper" />
                        <p className="eyebrow text-ink/65">{d.day}</p>
                        <h3 className="font-display text-xl text-ink mt-1">
                          {d.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          {d.detail}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28 border border-ink/10 bg-white/60 p-7 md:p-9">
              <p className="eyebrow text-copper-deep">What this route costs</p>
              {/*
                Two real totals, not one indicative per-person figure. The old
                block quoted a package price that bundled hotels and was always
                going to be re-quoted; this is the number we can hold to, and
                the guest can see which vehicle changes it.
              */}
              <TripCost duration={tour.duration} className="mt-4" />
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                Take this route as written or reshape it — the rate is the same
                either way, and nothing is paid online. The button below opens
                the calculator with this route and its length already in it;
                change either and the figure follows.
              </p>

              <div className="mt-6 space-y-2.5">
                {tour.includes.map((inc) => (
                  <p key={inc} className="flex items-start gap-2.5 text-sm text-ink/70">
                    <Check size={15} className="mt-0.5 shrink-0 text-copper-deep" /> {inc}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/book?service=${encodeURIComponent(tour.category)}&tour=${encodeURIComponent(tour.title)}`}
                  className="bg-ink text-sand text-center px-7 py-4 text-[13px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                >
                  Price this trip
                </Link>
                <a
                  href={waLink(`Hello Island Route! I'm interested in the "${tour.title}" (${tour.duration}). Could you send me a quote?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-wa text-white text-center px-7 py-4 text-[13px] uppercase tracking-[0.16em] hover:bg-wa-dark transition-colors"
                >
                  WhatsApp us now
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Why there is no total on this page — placed after the itinerary,
          because that is the point at which the question forms. */}
      <section className="section bg-dune">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <PackageStance
            href={`/book?service=${encodeURIComponent(tour.category)}&tour=${encodeURIComponent(tour.title)}`}
          />
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-dune/60 py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <h2 className="eyebrow text-copper-deep">You may also love</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t, i) => (
                <TourCard key={t.slug} tour={t} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}

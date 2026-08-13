import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/media/Img";
import { destinationAsset, toVerifiedOgImage } from "@/lib/media/registry";
import { clampDesc } from "@/lib/seo";
import { MapPin, CalendarDays, Check } from "lucide-react";
import { Reveal } from "@/components/motion";
import { CTABand, TourCard } from "@/components/ui";
import { getDestinationBySlug, getDestinations, getTours } from "@/lib/data";
import { waLink } from "@/lib/site";

export const revalidate = 60;

/** Prebuild every destination page at deploy time. */
export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const d = await getDestinationBySlug(params.slug);
  if (!d) return {};
  return {
    title: `${d.name} — ${d.region}`,
    description: clampDesc(`${d.headline}. ${d.description}`),
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: {
      type: "website",
      url: `/destinations/${d.slug}`,
      siteName: "Island Route Sri Lanka",
      locale: "en_GB",
      title: d.name,
      description: d.headline,
      /*
        Gated on the same verification predicate the page render uses. An
        unverified destination photograph must not be shared captioned with the
        place name any more than it may be displayed under one — it falls back
        to the neutral brand card, which depicts nowhere.
      */
      images: [
        {
          url: toVerifiedOgImage(destinationAsset(d)),
          width: 1200,
          height: 630,
          alt: `${d.name} — Island Route Sri Lanka`,
        },
      ],
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: { slug: string };
}) {
  const d = await getDestinationBySlug(params.slug);
  if (!d) notFound();
  const tours = await getTours();

  /*
    Explicit relationship, not substring matching.

    The previous filter checked whether the destination name appeared anywhere
    in a tour's title, excerpt or highlights. That is why the Ella page listed a
    Galle day tour (it mentions "Dala·wella") and the Galle page listed a
    wildlife tour (it mentions "Tan·galle"). Slugs are exact, so a place can no
    longer be matched by being spelled inside another place's name.

    A destination with no linked journey renders no section at all, rather than
    a relationship being invented for it.
  */
  const relatedTours = tours
    .filter((t) => t.destinationSlugs?.includes(d.slug))
    .slice(0, 3);

  return (
    <>
      <section className="relative bg-deep pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
        {/*
          Same verification gate as DestinationCard. This hero sits directly
          behind the destination's name, so it makes the same location claim and
          must not show an unverified photograph. Also the reason this can't stay
          a raw next/image: Colombo now has no image at all, and an empty src
          throws at render.
        */}
        <Img
          asset={destinationAsset(d)}
          sizes="100vw"
          priority
          requireVerifiedLocation
          fallbackTone="deep"
          fallbackPattern="contour"
          className="opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/60 via-deep/40 to-deep" />
        <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
          <Reveal>
            <p className="eyebrow text-copper-light inline-flex items-center gap-2">
              <MapPin size={13} /> {d.region}
            </p>
            <h1 className="h-display mt-3 text-5xl md:text-7xl text-sand">
              {d.name}
            </h1>
            <p className="mt-5 max-w-2xl font-display-italic text-xl md:text-2xl text-sand/85">
              {d.headline}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[17px] leading-relaxed text-ink/75">
                {d.description}
              </p>
            </Reveal>
            <Reveal index={1}>
              <h2 className="eyebrow text-copper-deep mt-10 mb-5">
                Don&apos;t miss
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {d.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-[15px] text-ink/75">
                    <Check size={17} className="mt-0.5 shrink-0 text-copper-deep" /> {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-5">
            <Reveal className="border border-ink/10 bg-white/60 p-7 md:p-9 lg:sticky lg:top-28">
              <p className="eyebrow text-copper-deep">Plan your visit</p>
              <div className="mt-5 space-y-4 text-sm text-ink/70">
                <p className="flex items-start gap-3">
                  <CalendarDays size={17} className="mt-0.5 text-copper-deep shrink-0" />
                  <span>
                    <strong className="text-ink">Best time:</strong> {d.bestTime}
                  </span>
                </p>
                <div>
                  <p className="text-ink font-semibold mb-2">Best for</p>
                  <div className="flex flex-wrap gap-2">
                    {d.bestFor.map((b) => (
                      <span
                        key={b}
                        className="border border-copper/30 text-copper-deep px-3 py-1 text-[11px] uppercase tracking-[0.14em]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/book?service=${encodeURIComponent("Custom Itinerary")}&tour=${encodeURIComponent(d.name)}`}
                  className="bg-ink text-sand text-center px-7 py-4 text-[13px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                >
                  Include in my trip
                </Link>
                <a
                  href={waLink(`Hello Island Route! I'd love to include ${d.name} in my Sri Lanka trip.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink/20 text-ink text-center px-7 py-4 text-[13px] uppercase tracking-[0.16em] hover:border-copper hover:text-copper-deep transition-colors"
                >
                  Ask us on WhatsApp
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {relatedTours.length > 0 && (
        <section className="bg-dune/60 py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <h2 className="eyebrow text-copper-deep">Journeys featuring {d.name}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTours.map((t, i) => (
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

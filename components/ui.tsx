import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Reveal } from "./motion";
import Img from "./media/Img";
import { destinationAsset } from "@/lib/media/registry";
import type { Destination } from "@/lib/destinations";
import type { Review } from "@/lib/content";

/*
  SectionHeading and TourCard live in ./ui-client and are re-exported here.
  They are also rendered in the browser now (the tours catalogue filters
  client-side), and this module imports the media registry — which reaches the
  entire Commons provenance table. Importing this file from a client component
  would ship all of it. Server callers keep importing from "@/components/ui" as
  they always have; client callers must import from "@/components/ui-client".
*/
export { SectionHeading, TourCard } from "./ui-client";
export type { TourCardTour } from "./ui-client";

/* ------------------------------ Destination card ------------------------------ */

export function DestinationCard({
  d,
  index = 0,
}: {
  d: Destination;
  index?: number;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/destinations/${d.slug}`} className="group block">
        <div className="img-frame aspect-[3/4]">
          {/*
            Routed through <Img> with requireVerifiedLocation rather than raw
            next/image. This card captions its picture with a place name, which
            makes it a location claim — so an unverified photograph must not
            appear here. Blocked slots fall back to the contour treatment and
            keep the name and region in type.
          */}
          <Img
            asset={destinationAsset(d)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            requireVerifiedLocation
            fallbackTone="moss"
            fallbackPattern="contour"
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-105"
          />
          {/* Same floor as the tour card, and for the same reason: the region
              label is 11px at sand/75 and was landing at 3.6:1 over the paler
              hill-country crops. See the note in TourCard. */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/65 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sand/75">
              {d.region}
            </p>
            <h3 className="font-display text-xl text-sand">{d.name}</h3>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* -------------------------------- Review card -------------------------------- */

export function ReviewCard({
  r,
  index = 0,
  dark = false,
}: {
  r: Review;
  index?: number;
  dark?: boolean;
}) {
  return (
    <Reveal index={index}>
      <figure
        className={`h-full border p-7 md:p-8 ${
          dark ? "border-sand/15 bg-palm/40" : "border-ink/10 bg-white/50"
        }`}
      >
        {/*
          The stars are a rating, so they are non-text content carrying
          information and owe 3:1 — which copper-deep never paid on the dark
          card: 2.4:1 before this pass and 2.0:1 against the deeper ground it
          now sits on. Mango is 6.4:1 there, and gold is what a star wants to
          be anyway. The light card keeps copper-deep, where it is 5.9:1.
        */}
        <div
          className={`flex gap-1 ${dark ? "text-mango" : "text-copper-deep"}`}
          aria-label={`${r.rating} star review`}
        >
          {Array.from({ length: r.rating }).map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
        </div>
        <blockquote
          className={`mt-4 font-display text-lg leading-relaxed ${
            dark ? "text-sand/90" : "text-ink/85"
          }`}
        >
          “{r.text}”
        </blockquote>
        <figcaption className="mt-5">
          <p
            className={`text-sm font-semibold ${dark ? "text-sand" : "text-ink"}`}
          >
            {r.name} · {r.country}
          </p>
          <p
            className={`text-xs mt-0.5 ${dark ? "text-sand/65" : "text-ink/65"}`}
          >
            {r.trip}
          </p>
        </figcaption>
      </figure>
    </Reveal>
  );
}

/* ---------------------------------- CTA band --------------------------------- */

export function CTABand({
  title = "Ready to plan your Sri Lanka?",
  body = "Tell us your dates and dreams — we'll reply within hours with a personal quote. No forms lost in inboxes, no pressure, just island expertise.",
}: {
  title?: string;
  body?: string;
}) {
  /*
    The band travels from ocean at the top-left corner, through the deep, and
    out into jungle at the bottom-right — the island in one diagonal.

    A gradient rather than a wash of colour laid over the dark ground, and
    that is a contrast decision as much as a visual one. Anything additive
    lightens what it touches, and this band carries the smallest type on the
    page; a teal glow strong enough to see was also strong enough to drop the
    body copy under 4.5:1. Travelling between three darks costs nothing —
    every stop here is a ground in its own right, and the lightest of them
    still holds sand at 11.2:1.
  */
  return (
    <section className="relative bg-gradient-to-br from-ocean-deep via-deep to-palm grain overflow-hidden">
      <div className="mx-auto max-w-wrap px-5 md:px-8 py-20 md:py-28 relative z-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow text-mango">Begin the journey</p>
            <h2 className="h-display mt-3 text-4xl md:text-6xl text-sand">
              {title}
            </h2>
            <p className="mt-6 text-sand/75 leading-relaxed">{body}</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="bg-copper-deep text-sand px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-copper-light hover:text-deep transition-colors"
              >
                Request a quote
              </Link>
              <Link
                href="/tours"
                className="border border-sand/30 text-sand px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-sand hover:text-deep transition-colors"
              >
                Browse tours
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Page header -------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  intro,
  note,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /*
    Fine print, set as fine print.

    /tours had its pricing caveat welded onto the end of the intro, so the
    first paragraph of the highest-intent page on the site read half as a
    promise and half as a disclaimer. The caveat is not optional — indicative
    prices have to say so — but it does not belong at deck size next to the
    headline. Same information, one step down in the hierarchy.
  */
  note?: string;
  image?: string;
}) {
  return (
    <section className="relative bg-deep pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            /*
              This is the largest contentful paint on every page that has one,
              and it is also the least detailed thing on screen: 40% opacity
              under a three-stop dark gradient, behind the headline. At the
              default quality of 75 it was the biggest image request on the
              page for a surface where JPEG artefacts are mathematically
              invisible — they are multiplied by 0.4 and then buried under
              50–70% of flat colour. 45 costs roughly half the bytes off the
              critical path and cannot be told apart from 75 here.
            */
            quality={45}
            className="object-cover opacity-40"
            aria-hidden
          />
          {/*
            Three stops, and the middle one is the one that matters. It used to
            be deep/50, which over a bright photograph at 40% left a ground
            light enough to fail the eyebrow and the fine print outright — the
            two smallest things on the page, sitting exactly where the gradient
            was thinnest. It is now the darkest kind of ocean at 80%, which
            both fixes that and puts the header in the water rather than in a
            neutral shadow.
          */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep/85 via-ocean-deep/85 to-deep" />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
        {/* `immediate`: this is the first heading on the page and it is always
            above the fold. Inside a scroll-triggered Reveal it was painted at
            opacity 0 and waited for hydration, which put first contentful paint
            behind the JavaScript bundle on every route on the site. */}
        <Reveal immediate>
          <p className="eyebrow text-mango">{eyebrow}</p>
          <h1 className="h-display mt-3 text-5xl md:text-7xl text-sand max-w-3xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl text-sand/75 leading-relaxed">
              {intro}
            </p>
          )}
          {note && (
            <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-sand/70">
              {note}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

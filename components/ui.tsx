import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { Reveal } from "./motion";
import Img from "./media/Img";
import GradientPanel from "./media/GradientPanel";
import { destinationAsset } from "@/lib/media/registry";
import type { Tour } from "@/lib/tours";
import type { Destination } from "@/lib/destinations";
import type { Review } from "@/lib/content";

/* ------------------------------ Section heading ------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  dark = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <Reveal
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <p className={`eyebrow ${dark ? "text-copper-light" : "text-copper-deep"}`}>
        {eyebrow}
      </p>
      <h2
        className={`h-display mt-3 text-4xl md:text-5xl ${
          dark ? "text-sand" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-5 text-[15px] leading-relaxed ${
            dark ? "text-sand/60" : "text-ink/70"
          }`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}

/* --------------------------------- Tour card --------------------------------- */

/**
 * Tour card.
 *
 * `variant="feature"` is the same component at editorial scale — a wider crop,
 * larger type and the excerpt shown. It exists so a tour grid can have a
 * hierarchy (one lead journey, several supporting) instead of four identical
 * tiles, without a second component to keep in sync.
 */
export function TourCard({
  tour,
  index = 0,
  variant = "default",
  dark = false,
}: {
  tour: Tour;
  index?: number;
  variant?: "default" | "feature";
  /** Set on dark-ground sections — the caption below the card sits on the
   *  section background, not the image, so it needs the inverse colour. */
  dark?: boolean;
}) {
  const feature = variant === "feature";

  return (
    <Reveal index={index}>
      <Link href={`/tours/${tour.slug}`} className="group block">
        <div
          className={`img-frame ${
            feature ? "aspect-[4/5] md:aspect-[16/11]" : "aspect-[4/5]"
          }`}
        >
          {/*
            A journey can legitimately have no photograph. "Palmyra & Pearl"
            ships that way — nobody had a verified image of the north when it
            was written, and the project's rule is a gradient over a guess.
            Passing that empty string to next/image is not a no-op: React logs
            `Image is missing required "src" property` and the browser renders
            an <img> with no source, so the card loses its ground and the
            caption sits on bare paper. The treatment is the designed state for
            an empty slot, so use it.
          */}
          {tour.image ? (
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              sizes={
                feature
                  ? "(max-width: 768px) 100vw, 58vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              }
              className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            />
          ) : (
            <GradientPanel
              tone={index % 2 === 0 ? "deep" : "moss"}
              pattern="contour"
              className="h-full w-full"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/45 to-transparent" />
          <span className="absolute left-4 top-4 bg-sand/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink">
            {tour.category}
          </span>
          <div className={`absolute inset-x-0 bottom-0 ${feature ? "p-6 md:p-9" : "p-5"}`}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sand/80">
              {tour.duration}
            </p>
            <h3
              className={`font-display text-sand mt-1 leading-snug ${
                feature ? "text-3xl md:text-5xl" : "text-2xl"
              }`}
            >
              {tour.title}
            </h3>
            {feature && (
              <p className="mt-4 hidden max-w-lg text-[15px] leading-relaxed text-sand/75 md:block">
                {tour.excerpt}
              </p>
            )}
            <p className={`text-sand/80 ${feature ? "mt-4 text-[15px]" : "mt-2 text-sm"}`}>
              From <span className="text-copper-light font-semibold">${tour.priceFrom}</span> per person
            </p>
          </div>
        </div>
        <p
          className={`mt-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] transition-colors ${
            dark
              ? "text-sand/70 group-hover:text-copper-light"
              : "text-ink/70 group-hover:text-copper-deep"
          }`}
        >
          View journey <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
    </Reveal>
  );
}

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
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/35 to-transparent" />
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

export function ReviewCard({ r, index = 0, dark = false }: { r: Review; index?: number; dark?: boolean }) {
  return (
    <Reveal index={index}>
      <figure
        className={`h-full border p-7 md:p-8 ${
          dark ? "border-sand/15 bg-palm/40" : "border-ink/10 bg-white/50"
        }`}
      >
        <div className="flex gap-1 text-copper-deep" aria-label={`${r.rating} star review`}>
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
          <p className={`text-sm font-semibold ${dark ? "text-sand" : "text-ink"}`}>
            {r.name} · {r.country}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? "text-sand/65" : "text-ink/65"}`}>
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
  return (
    <section className="relative bg-deep grain overflow-hidden">
      <div className="mx-auto max-w-wrap px-5 md:px-8 py-20 md:py-28 relative z-10">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow text-copper-light">Begin the journey</p>
            <h2 className="h-display mt-3 text-4xl md:text-6xl text-sand">{title}</h2>
            <p className="mt-6 text-sand/60 leading-relaxed">{body}</p>
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
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
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
            className="object-cover opacity-40"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/50 to-deep" />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
        <Reveal>
          <p className="eyebrow text-copper-light">{eyebrow}</p>
          <h1 className="h-display mt-3 text-5xl md:text-7xl text-sand max-w-3xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl text-sand/70 leading-relaxed">{intro}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The subset of the UI kit that is safe to import from a client component.
 *
 * `components/ui.tsx` imports `@/lib/media/registry`, which reaches the whole
 * Commons provenance table — authors, licences, source URLs for every asset on
 * the site. None of that is read by a section heading or a tour card, but a
 * single client-side import of `ui.tsx` would drag all of it into the browser
 * bundle, because module graphs do not care which export you asked for.
 *
 * So the two pieces the tours page now renders in the browser live here, and
 * `ui.tsx` re-exports them. Server callers are unchanged and need not know this
 * file exists; client callers must import from it directly.
 *
 * These components are not marked `"use client"` on purpose. They have no state
 * and no effects, so they render on whichever side imports them — server for
 * the static shell, client for the filtered view — from one definition.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./motion";
import GradientPanel from "./media/GradientPanel";

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
      <p
        className={`eyebrow ${dark ? "text-copper-light" : "text-copper-deep"}`}
      >
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
 * Everything a tour card reads, and nothing else.
 *
 * Structural rather than `Tour` for the same reason the filters are: the card
 * is rendered in the browser on /tours now, and `Tour` carries itineraries,
 * inclusions and highlights that no card has ever shown. A `Tour` satisfies
 * this shape, so every existing call site is unaffected.
 */
export type TourCardTour = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  priceFrom: number;
  image: string;
  /** Shown only by `variant="feature"`, so a slim projection may omit it. */
  excerpt?: string;
};

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
  tour: TourCardTour;
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
          <div
            className={`absolute inset-x-0 bottom-0 ${feature ? "p-6 md:p-9" : "p-5"}`}
          >
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
            {feature && tour.excerpt && (
              <p className="mt-4 hidden max-w-lg text-[15px] leading-relaxed text-sand/75 md:block">
                {tour.excerpt}
              </p>
            )}
            <p
              className={`text-sand/80 ${feature ? "mt-4 text-[15px]" : "mt-2 text-sm"}`}
            >
              From{" "}
              <span className="text-copper-light font-semibold">
                ${tour.priceFrom}
              </span>{" "}
              per person
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
          View journey{" "}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </p>
      </Link>
    </Reveal>
  );
}

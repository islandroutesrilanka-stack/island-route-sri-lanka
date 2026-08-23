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
import { lowestDayRate, money, tripDays } from "@/lib/pricing";

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
      {/*
        Two eyebrow colours, because the two grounds want different things. On
        sand, copper-deep is the site's small-text accent and clears AA at
        5.9:1. On the dark grounds copper-light was doing the same job at
        5.0:1, which left it nothing to spend the moment a ground carried any
        tint at all — and every dark ground on the site now does. Mango is
        6.9:1 on deep, reads as sun rather than as metal, and survives the
        gradients underneath it.
      */}
      <p className={`eyebrow ${dark ? "text-mango" : "text-copper-deep"}`}>
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
            dark ? "text-sand/75" : "text-ink/70"
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
  image: string;
  /** Shown only by `variant="feature"`, so a slim projection may omit it. */
  excerpt?: string;
};

/**
 * Tour card.
 *
 * ── Two variants, and only one of them sets type on the photograph ──────────
 *
 * `default` is the catalogue tile, and the photograph now runs at full strength
 * with nothing over it: category, duration, title, price and link all sit on
 * the section's own ground underneath. That is the move `ExperienceCard` made,
 * for the same measured reason. The old tile carried five runs of type inside
 * the crop, and the smallest of them only cleared 4.5:1 once a flat `deep/70`
 * blanket covered the entire frame — at which strength you could not tell the
 * Ella tea slopes from the Arugam Bay sandbar at a glance. Ink on sand is
 * 5.9:1 with no overlay at all, so the picture gets to be the card.
 *
 * `feature` is the editorial tile: one lead journey at scale, and its copy
 * stays on the photograph, because at that size the frame has room to be both
 * the image and the ground. What changed there is the scrim — the flat blanket
 * became a bottom-anchored ramp, so only the strip the type actually occupies
 * is darkened and the top of the crop is untouched.
 *
 * `dark` is not a third variant. It is which ground the copy lands on, and the
 * homepage rail is the one caller that needs it.
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
  /** Set on dark-ground sections — the copy below the frame sits on the
   *  section background, not the image, so it needs the inverse colour. */
  dark?: boolean;
}) {
  return variant === "feature" ? (
    <FeatureTile tour={tour} index={index} dark={dark} />
  ) : (
    <GridTile tour={tour} index={index} dark={dark} />
  );
}

/**
 * The transport line — the one number on the card, and it is derived.
 *
 * This used to read "From $1,850 per person", a shelf price for a package that
 * bundled accommodation. It is now the transport cost the route implies, which
 * is the number we can stand behind: the vehicle and chauffeur for the length
 * of the trip, all in. `tripDays` returns null for a duration it cannot read,
 * and then the card quotes the day rate rather than inventing a total.
 */
function TransportLine({
  duration,
  accent,
}: {
  duration: string;
  accent: string;
}) {
  const d = tripDays(duration);
  return (
    <>
      Transport from{" "}
      <span className={`font-semibold ${accent}`}>
        {money(d ? lowestDayRate * d : lowestDayRate)}
      </span>{" "}
      {d ? "for the car" : "a day"} — all-inclusive
    </>
  );
}

/**
 * A journey can legitimately have no photograph. "Palmyra & Pearl" ships that
 * way — nobody had a verified image of the north when it was written, and the
 * project's rule is a gradient over a guess. Passing that empty string to
 * next/image is not a no-op: React logs `Image is missing required "src"
 * property` and the browser renders an <img> with no source, so the tile loses
 * its ground entirely. The treatment is the designed state for an empty slot.
 */
function TourFrame({
  tour,
  index,
  sizes,
}: {
  tour: TourCardTour;
  index: number;
  sizes: string;
}) {
  return tour.image ? (
    <Image
      src={tour.image}
      alt={tour.title}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
    />
  ) : (
    <GradientPanel
      tone={index % 2 === 0 ? "deep" : "moss"}
      pattern="contour"
      className="h-full w-full"
    />
  );
}

/* -------------------------------- Grid tile -------------------------------- */

function GridTile({
  tour,
  index,
  dark,
}: {
  tour: TourCardTour;
  index: number;
  dark: boolean;
}) {
  return (
    /* `h-full` down the whole chain so every tile in a row is the height of the
       tallest, which is what lets the price and link hang off `mt-auto` and
       line up across the grid. Titles run one to three lines. */
    <Reveal index={index} className="h-full">
      <Link href={`/tours/${tour.slug}`} className="group flex h-full flex-col">
        <div className="img-frame aspect-[4/5]">
          <TourFrame
            tour={tour}
            index={index}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <p
            className={`text-[11px] uppercase tracking-[0.16em] ${
              dark ? "text-sand/70" : "text-ink/65"
            }`}
          >
            {tour.category} · {tour.duration}
          </p>
          <h3
            className={`h-display mt-2 text-2xl leading-snug transition-colors ${
              dark
                ? "text-sand group-hover:text-copper-light"
                : "text-ink group-hover:text-copper-deep"
            }`}
          >
            {tour.title}
          </h3>

          <div className="mt-auto">
            <p
              className={`mt-4 text-[14px] leading-relaxed ${
                dark ? "text-sand/75" : "text-ink/70"
              }`}
            >
              <TransportLine
                duration={tour.duration}
                accent={dark ? "text-copper-light" : "text-copper-deep"}
              />
            </p>
            <p
              className={`mt-4 flex items-center gap-2 border-t pt-4 text-[12px] uppercase tracking-[0.16em] transition-colors ${
                dark
                  ? "border-sand/15 text-sand/70 group-hover:text-copper-light"
                  : "border-ink/10 text-copper-deep"
              }`}
            >
              View journey
              <ArrowRight
                size={14}
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              />
            </p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ------------------------------- Feature tile ------------------------------ */

function FeatureTile({
  tour,
  index,
  dark,
}: {
  tour: TourCardTour;
  index: number;
  dark: boolean;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/tours/${tour.slug}`} className="group block">
        <div className="img-frame aspect-[4/5] md:aspect-[16/11]">
          <TourFrame
            tour={tour}
            index={index}
            sizes="(max-width: 768px) 100vw, 58vw"
          />
          {/*
            Bottom-anchored, and eight stops rather than three.

            A flat `via-deep/70` blanket held the caption over the worst crop in
            the catalogue by dimming every crop equally, including the two
            thirds of the frame no type ever reaches. This ramp is stronger than
            that where the words are and gone entirely by the halfway line, so
            the tile opens on a photograph instead of on a dark panel. Same
            ground and same stops as the shared PageHeader, so the two read as
            one treatment.
          */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-[linear-gradient(to_top,rgba(3,39,34,0.92),rgba(3,39,34,0.88)_12%,rgba(3,39,34,0.82)_26%,rgba(3,39,34,0.72)_40%,rgba(3,39,34,0.59)_54%,rgba(3,39,34,0.40)_70%,rgba(3,39,34,0.17)_86%,transparent)] md:h-[58%]" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sand/85">
              {tour.category} · {tour.duration}
            </p>
            <h3 className="h-display mt-2 text-3xl leading-snug text-sand md:text-5xl">
              {tour.title}
            </h3>
            {tour.excerpt && (
              <p className="mt-4 hidden max-w-lg text-[15px] leading-relaxed text-sand/85 md:block">
                {tour.excerpt}
              </p>
            )}
            <p className="mt-4 text-[15px] text-sand/85">
              <TransportLine
                duration={tour.duration}
                accent="text-copper-light"
              />
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
          View journey
          <ArrowRight
            size={14}
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          />
        </p>
      </Link>
    </Reveal>
  );
}

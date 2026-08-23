import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Reveal } from "./motion";
import Img from "./media/Img";
import { destinationAsset } from "@/lib/media/registry";
import { slotAsset, slotSrc } from "@/lib/media/slots";
import { getSettings } from "@/lib/data";
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

/**
 * Destination card.
 *
 * The scrim is gone, and the caption moved out from under it.
 *
 * The old tile set an 11px region label and a 20px name inside the crop, which
 * only cleared 4.5:1 once a `from-deep via-deep/65` blanket covered the whole
 * frame — the same trade the experience and tour cards used to make, and the
 * same one they no longer make. Ink on sand is 5.9:1 with nothing over the
 * picture, so the picture runs clean and the words sit underneath it.
 *
 * All three callers — the homepage rail, the experience detail pages and the
 * destinations index — render this on a light ground, which is what makes the
 * move available. If a dark section ever needs one, it needs a `dark` prop
 * first, not a scrim back.
 */
export function DestinationCard({
  d,
  index = 0,
  variant = "default",
}: {
  d: Destination;
  index?: number;
  /*
    `feature` is the same card at editorial scale: a landscape crop, the
    headline the record already carries, and the first line of its description.
    It exists because a grid of eleven identical tiles has no entry point — the
    eye has nowhere to land and every place looks equally optional. One tile at
    four times the area answers "where do I start" without adding a word of
    copy that was not already written.
  */
  variant?: "default" | "feature";
}) {
  if (variant === "feature") return <DestinationFeature d={d} index={index} />;
  return (
    <Reveal index={index} className="h-full">
      <Link
        href={`/destinations/${d.slug}`}
        className="group flex h-full flex-col"
      >
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
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
        </div>
        <div className="pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/65">
            {d.region}
          </p>
          <h3 className="h-display mt-1.5 text-xl text-ink transition-colors group-hover:text-copper-deep">
            {d.name}
          </h3>
        </div>
      </Link>
    </Reveal>
  );
}

function DestinationFeature({ d, index }: { d: Destination; index: number }) {
  return (
    <Reveal index={index}>
      <Link
        href={`/destinations/${d.slug}`}
        className="group grid items-center gap-8 md:grid-cols-12 md:gap-12"
      >
        <div className="md:col-span-7">
          <div className="img-frame aspect-[4/3] md:aspect-[16/10]">
            <Img
              asset={destinationAsset(d)}
              sizes="(max-width: 768px) 100vw, 58vw"
              requireVerifiedLocation
              fallbackTone="moss"
              fallbackPattern="contour"
              className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
            />
          </div>
        </div>
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-copper-deep">
            {d.region}
          </p>
          <h3 className="h-display mt-2 text-3xl text-ink transition-colors group-hover:text-copper-deep md:text-4xl">
            {d.name}
          </h3>
          <p className="mt-3 text-[17px] italic leading-relaxed text-ink/75">
            {d.headline}
          </p>
          {/* One sentence, cut on the sentence boundary rather than at a
              character count, so the card never ends mid-clause. Falls back to
              the whole description when there is only one. */}
          <p className="mt-4 text-[15px] leading-relaxed text-ink/70">
            {d.description.split(/(?<=\.)\s/)[0]}
          </p>
          <p className="mt-6 flex items-center gap-2 border-t border-ink/10 pt-4 text-[12px] uppercase tracking-[0.16em] text-copper-deep">
            Read the guide
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            />
          </p>
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

export async function CTABand({
  title = "Ready to plan your Sri Lanka?",
  body = "Tell us your dates and dreams — we'll reply within hours with a personal quote. No forms lost in inboxes, no pressure, just island expertise.",
}: {
  title?: string;
  body?: string;
}) {
  /*
    ── The band now ends the page on a photograph ─────────────────────────────

    Twelve routes close on this component, and until now every one of them
    closed on a gradient — the last thing a visitor saw on a site selling a
    country was a dark rectangle with a button in it. It reads as a form
    footer, which is what it functionally is, and that is the problem.

    The picture is a column, not a background, and that distinction is the
    whole design. Laying it behind the type would have forced the same choice
    the header and the cards used to make: the body copy here is 16px on a
    photograph, so it needs 4.5:1, so it needs a wash heavy enough to flatten
    whatever is underneath it. Beside the type instead, the words keep the
    dark ground they were measured against and the photograph keeps every stop
    of its own contrast. Nothing was traded.

    ── The gradient it sits on is unchanged ───────────────────────────────────

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
  const settings = await getSettings();
  const asset = slotAsset(settings.images, "band-cta");

  return (
    <section className="grain relative overflow-hidden bg-gradient-to-br from-ocean-deep via-deep to-palm">
      <div className="relative z-10 mx-auto grid max-w-wrap items-center gap-10 px-5 py-20 md:grid-cols-12 md:gap-14 md:px-8 md:py-28">
        <div className="md:col-span-7 lg:col-span-6">
          <Reveal>
            <p className="eyebrow text-mango">Begin the journey</p>
            <h2 className="h-display mt-3 text-4xl text-sand md:text-6xl">
              {title}
            </h2>
            <p className="mt-6 leading-relaxed text-sand/75">{body}</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/book"
                className="bg-copper-deep px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
              >
                Request a quote
              </Link>
              <Link
                href="/tours"
                className="border border-sand/30 px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-sand hover:text-deep"
              >
                Browse tours
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Hidden below md rather than stacked. On a phone this column would
            land underneath the buttons, which puts a photograph between the
            call to action and the footer — a picture nobody scrolls past to
            reach a link they have already been given. */}
        {asset && (
          <div className="hidden md:col-span-5 md:block lg:col-span-6">
            <Reveal>
              <div className="img-frame aspect-[4/5] lg:aspect-[3/4]">
                <Img
                  asset={asset}
                  sizes="(max-width: 768px) 0px, 42vw"
                  fallbackTone="deep"
                  fallbackPattern="contour"
                />
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------- Page header -------------------------------- */

export async function PageHeader({
  eyebrow,
  title,
  intro,
  note,
  slot,
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
  /*
    The image slot this header draws from — see lib/media/slots.ts.

    Eight routes used to hard-code `image={media.something.src}`, which meant
    the photograph behind every page title on the site was a compile-time
    constant and changing one was a deploy. Naming the slot instead lets the
    admin swap it from /admin/images, and the slot's own fallback is the
    photograph that was hard-coded here before — so an untouched database
    renders exactly what these pages rendered yesterday.
  */
  slot?: string;
  /** Escape hatch for a header whose picture is not a slot. Wins over `slot`. */
  image?: string;
}) {
  /*
    Two grounds, not one.

    This was a single dark band: the photograph at 40% opacity under a wash
    that never dropped below 85%, carrying four runs of type — an 11px eyebrow,
    the h1, a deck and a line of fine print. The wash was doing real work. The
    smallest of those runs needs 4.5:1 and it sat at the *top* of the block,
    which is exactly where a bottom-anchored gradient is thinnest, so the only
    ramp that could pay for it was one that covered the whole frame. That is
    how a photograph ends up as a texture.

    So the block is split at the line where the requirement changes. The h1 is
    48–72px — large text, 3:1 — and stays on the photograph over a scrim that
    leaves the top half of the frame alone. The eyebrow, the deck and the note
    are small text, and they move to the sand strip underneath, where they sit
    at 5.9:1 and better with nothing over them at all.

    Same split as the experience hero, for the same reason, and eight routes
    now read the way that one does: the photograph carries the title, and paper
    carries the words.
  */
  const settings = slot ? await getSettings() : null;
  const src = image || (slot ? slotSrc(settings?.images, slot) : "");

  return (
    <>
      <section className="relative flex min-h-[56svh] items-end overflow-hidden bg-deep md:min-h-[62svh] lg:h-[min(64svh,40rem)] lg:min-h-0">
        {src && (
          <>
            <Image
              src={src}
              alt=""
              fill
              priority
              sizes="100vw"
              /*
                45 was right when this image was multiplied by 0.4 and buried
                under 85% of flat colour — artefacts genuinely could not be
                found. Nothing is over it now, and it is both the largest and
                the most-looked-at element on the page, where 45 shows as
                banding in any gradient sky. 68 is where that stops being
                findable at this size, and still under the default 75.
              */
              quality={68}
              className="object-cover"
              aria-hidden
            />
            {/*
              The experience hero's ramp, unchanged, because it is solving the
              identical problem one element lighter: eight stops approximating
              an ease, bottom-anchored, capped so that the top 42–50% of the
              frame is untouched. It was measured against the brightest of
              twelve crops for large text at 3:1 and the copy here is a strict
              subset of the copy there — a title and nothing else.

              `deep` is spelled out in rgba because Tailwind cannot interpolate
              a named colour across eight stops. `grep 'rgba(3,39,34'` finds
              every file that does this; a palette change has to reach them all
              by hand.
            */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(to_top,rgba(3,39,34,0.90)_0%,rgba(3,39,34,0.86)_16%,rgba(3,39,34,0.80)_30%,rgba(3,39,34,0.71)_44%,rgba(3,39,34,0.60)_58%,rgba(3,39,34,0.41)_74%,rgba(3,39,34,0.17)_88%,transparent_100%)] md:h-[50%] md:bg-[linear-gradient(to_top,rgba(3,39,34,0.90)_0%,rgba(3,39,34,0.87)_16%,rgba(3,39,34,0.82)_30%,rgba(3,39,34,0.75)_44%,rgba(3,39,34,0.66)_58%,rgba(3,39,34,0.46)_74%,rgba(3,39,34,0.19)_88%,transparent_100%)]"
            />
          </>
        )}
        <div className="relative z-10 mx-auto w-full max-w-wrap px-5 pb-14 pt-32 md:px-8 md:pb-20 md:pt-44">
          {/* `immediate`: this is the first heading on the page and it is always
              above the fold. Inside a scroll-triggered Reveal it was painted at
              opacity 0 and waited for hydration, which put first contentful paint
              behind the JavaScript bundle on every route on the site. */}
          <Reveal immediate>
            <h1 className="h-display max-w-3xl text-5xl leading-[1.04] text-sand md:text-7xl">
              {title}
            </h1>
          </Reveal>
        </div>
      </section>

      {/*
        The deck, on paper. Everything here was over the photograph until the
        split above: the eyebrow is 11px, the note is 13px, and both need 4.5:1
        — which no honest scrim can offer at the top of a copy block.

        The eyebrow reads after the title rather than before it now. That is the
        one thing the split costs, and it buys a masthead where the label is
        legible instead of decorative.
      */}
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <div className="py-7 md:py-9">
          <p className="eyebrow text-copper-deep">{eyebrow}</p>
          {intro && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl">
              {intro}
            </p>
          )}
          {note && (
            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-ink/70">
              {note}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

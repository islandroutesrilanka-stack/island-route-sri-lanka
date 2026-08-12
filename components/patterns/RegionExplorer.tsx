"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Img from "@/components/media/Img";
import { destinationAsset } from "@/lib/media/registry";
import { commonsPlaceAsset, type CommonsPlaceAsset } from "@/lib/media/commons";
import { isLocationVerified } from "@/lib/media/types";
import { regions } from "@/lib/regions";
import { placesForRegion } from "@/lib/region-places";

/**
 * The region explorer.
 *
 * Seven tabs, thirty-one places, one panel at a time. It reads from
 * `lib/regions.ts` (which already holds the agreed mapping) and
 * `lib/region-places.ts` (the copy), so the grouping is never restated here —
 * add a place in regions.ts, write its note, and it appears.
 *
 * Three decisions worth keeping:
 *
 *   • Tabs above md, a native <select> below it. Seven region names are too
 *     long to wrap tidily on a phone, and a horizontally scrolling strip hides
 *     half of them behind an edge with no affordance. The select is the honest
 *     mobile control and costs nothing in polish.
 *
 *   • It is a real tab widget — roving tabindex, arrow/Home/End keys, proper
 *     roles and aria-controls. A div soup with click handlers would look
 *     identical and be unusable without a mouse.
 *
 *   • Only places with a published guide are linked. The rest are genuine stops
 *     with no page written yet, so their cards carry the copy and no link. A
 *     link to a 404 costs more than a card that simply doesn't offer one.
 *
 *   • A photograph and a guide are separate things. They used to be the same
 *     thing here — the image resolved through `destinationAsset(d)`, so a place
 *     could only ever show a photo if someone had written its guide. That was
 *     the actual reason two thirds of the grid was gradients, and it is fixed:
 *     a place now resolves the owner's own verified frame first and a located
 *     Wikimedia Commons photograph second. `requireVerifiedLocation` stays on
 *     throughout — nothing generic stands in for a named place.
 *
 * `destinations` is passed in rather than imported: the catalogue is
 * Supabase-backed and read on the server, and this is a client component.
 */
export type ExplorerDestination = {
  slug: string;
  name: string;
  region: string;
  image: string;
};

/* Rotated so a panel of gradient placeholders reads as a designed set rather
   than a wall of one colour. Kept to the darker three — the cards sit on sand
   and the light tones disappear into it. */
const tones = ["moss", "deep", "dune"] as const;

/* All seven regions take a definite article mid-sentence, and two of them
   already carry it in the label ("The Wild South", "The North"). Without this
   the CTA reads "Plan a journey through Cultural Triangle". */
const withArticle = (name: string) =>
  name.startsWith("The ") ? `the ${name.slice(4)}` : `the ${name}`;

export default function RegionExplorer({
  destinations,
  defaultRegion = "cultural-triangle",
  className = "",
}: {
  destinations: ExplorerDestination[];
  defaultRegion?: string;
  className?: string;
}) {
  const uid = useId();
  const reduce = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const initial = regions.some((r) => r.slug === defaultRegion)
    ? defaultRegion
    : regions[0].slug;
  const [active, setActive] = useState(initial);

  const activeIndex = Math.max(
    0,
    regions.findIndex((r) => r.slug === active)
  );
  const region = regions[activeIndex];

  const bySlug = useMemo(
    () => new Map(destinations.map((d) => [d.slug, d])),
    [destinations]
  );

  const places = useMemo(() => placesForRegion(region), [region]);
  const published = places.filter((p) => p.destinationSlug && bySlug.has(p.destinationSlug));

  /*
    Resolve each card's photograph once, here, rather than inline in the map.

    Order: the owner's own photography (or a registry asset whose location is
    verified) wins, because it is ours and it is better. Only when that is
    absent or unverified does the Commons frame stand in. Resolving centrally
    is also what keeps the credits list honest — it can only name images that
    actually rendered, so a place with owner photography never accrues a credit
    for a Commons file nobody sees.
  */
  const cards = useMemo(
    () =>
      places.map((p) => {
        const d = p.destinationSlug ? bySlug.get(p.destinationSlug) : undefined;
        const owned = d ? destinationAsset(d) : null;
        const commons = isLocationVerified(owned) ? null : commonsPlaceAsset(p.name);
        return {
          place: p,
          href: d ? `/destinations/${d.slug}` : undefined,
          asset: commons ?? owned,
          commons,
        };
      }),
    [places, bySlug]
  );

  /* CC BY, CC BY-SA and the Free Art Licence all require attribution. De-duped
     by src because one file could legitimately serve two places. */
  const credits = useMemo(() => {
    const seen = new Set<string>();
    const out: CommonsPlaceAsset[] = [];
    for (const c of cards) {
      if (c.commons && !seen.has(c.commons.src)) {
        seen.add(c.commons.src);
        out.push(c.commons);
      }
    }
    return out;
  }, [cards]);

  /* Roving tabindex: only the selected tab is in the tab order, arrows move
     between them. Standard tab-widget behaviour, and the reason this is a
     button list rather than seven links. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const last = regions.length - 1;
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? last
            : e.key === "ArrowRight"
              ? (activeIndex + 1) % regions.length
              : (activeIndex - 1 + regions.length) % regions.length;
      setActive(regions[next].slug);
      tabRefs.current[next]?.focus();
    },
    [activeIndex]
  );

  return (
    <div className={className}>
      {/* ---------------------------------------------------- mobile control */}
      <div className="md:hidden">
        <label htmlFor={`${uid}-select`} className="eyebrow text-copper-deep">
          Choose a region
        </label>
        <select
          id={`${uid}-select`}
          value={active}
          onChange={(e) => setActive(e.target.value)}
          className="mt-3 w-full appearance-none border border-ink/20 bg-white/70 px-4 py-3.5 font-display text-lg text-ink outline-none transition-colors focus-visible:border-copper"
        >
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------------------------------------------- desktop tabs */}
      <div
        role="tablist"
        aria-label="Regions of Sri Lanka"
        onKeyDown={onKeyDown}
        className="hidden border-b border-ink/10 md:flex md:flex-wrap md:gap-x-8"
      >
        {regions.map((r, i) => {
          const selected = r.slug === active;
          return (
            <button
              key={r.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${r.slug}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(r.slug)}
              className={`relative -mb-px pb-4 pt-1 text-[12px] uppercase tracking-[0.16em] transition-colors ${
                selected ? "text-copper-deep" : "text-ink/55 hover:text-ink"
              }`}
            >
              {r.name}
              {selected && (
                <motion.span
                  layoutId={`${uid}-underline`}
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-px bg-copper"
                  transition={
                    reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- panel */}
      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${region.slug}`}
        tabIndex={0}
        className="mt-10 outline-none md:mt-12"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={region.slug}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl font-display text-xl italic leading-snug text-ink/75 md:text-2xl">
                {region.character}
              </p>
              {/* The Wild South and the Cultural Triangle each have exactly one
                  published guide, so "1 guides" was on screen for two of the
                  seven regions. Cheap to get right, and this line is now the
                  page's primary answer to "what's in this region?". */}
              <p className="shrink-0 text-[12px] uppercase tracking-[0.16em] text-ink/45">
                {places.length} {places.length === 1 ? "place" : "places"}
                {published.length > 0 &&
                  ` · ${published.length} ${published.length === 1 ? "guide" : "guides"}`}
              </p>
            </div>

            <ul className="mt-9 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(({ place: p, href, asset }, i) => {
                const media = (
                  <div className="img-frame aspect-[4/5]">
                    {/* requireVerifiedLocation stays: these slots claim a named
                        place, so an unverified photograph is worse than none.
                        The gate is still on — what changed is that far more
                        places now clear it honestly. Anything still without a
                        located photograph takes the gradient, which is the
                        designed placeholder, not a gap. */}
                    <Img
                      asset={asset}
                      requireVerifiedLocation
                      fallbackTone={tones[i % tones.length]}
                      fallbackPattern="contour"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className={href ? "transition-transform duration-700 group-hover:scale-105" : ""}
                    />
                    {p.season && (
                      <span className="absolute left-4 top-4 z-10 bg-sand/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink/70 backdrop-blur">
                        {p.season}
                      </span>
                    )}
                  </div>
                );

                const body = (
                  <>
                    <h3 className="h-display mt-5 text-2xl text-ink">{p.name}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink/65">
                      {p.note}
                    </p>
                  </>
                );

                return (
                  <motion.li
                    key={p.name}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduce ? 0.15 : 0.45,
                      delay: reduce ? 0 : Math.min(i, 5) * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {href ? (
                      <Link href={href} className="group block">
                        {media}
                        {body}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] text-copper-deep">
                          Read the guide
                          <ArrowUpRight
                            size={14}
                            aria-hidden
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </span>
                      </Link>
                    ) : (
                      <div>
                        {media}
                        {body}
                        <span className="mt-4 inline-block text-[12px] uppercase tracking-[0.16em] text-ink/40">
                          Guide in progress
                        </span>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-12 border-t border-ink/10 pt-8">
              <Link
                href="/book"
                className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-ink transition-colors hover:text-copper-deep"
              >
                Plan a journey through {withArticle(region.name)}
                <ArrowRight
                  size={15}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/*
              Attribution. Not optional and not decorative: every Commons image
              above is under CC BY, CC BY-SA or the Free Art Licence, all three
              of which require the photographer to be named and the licence
              stated. A <details> keeps the obligation met without putting a
              wall of credits between the reader and the next section — closed
              it is one quiet line, and it is still in the page source, still
              readable, still linked to each file.
            */}
            {credits.length > 0 && (
              <details className="group mt-6 border-t border-ink/10 pt-5">
                <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-ink/40 transition-colors marker:content-none hover:text-ink/70">
                  Photography credits
                  <span aria-hidden className="ml-2 inline-block transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <ul className="mt-4 grid gap-2 text-[12px] leading-relaxed text-ink/45 sm:grid-cols-2 lg:grid-cols-3">
                  {credits.map((c) => (
                    <li key={c.src}>
                      <span className="text-ink/60">{c.depicts ?? c.alt}</span> ·{" "}
                      {c.author} ·{" "}
                      <a
                        href={c.provenance.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-ink/20 underline-offset-2 transition-colors hover:text-copper-deep"
                      >
                        {c.provenance.license}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

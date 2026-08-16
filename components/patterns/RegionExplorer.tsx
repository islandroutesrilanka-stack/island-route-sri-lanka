"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import Img from "@/components/media/Img";
import { destinationAsset } from "@/lib/media/registry";
import { commonsPlaceAsset, type CommonsPlaceAsset } from "@/lib/media/commons";
import { isLocationVerified } from "@/lib/media/types";
import { regions } from "@/lib/regions";
import { placesForRegion } from "@/lib/region-places";
import { splitIfLong } from "@/lib/copy";

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
 *   • The tab rule slides, and it does so without an animation library. This
 *     component and the navbar were the last two holders of framer-motion on
 *     the public site, between them putting 107 kB of JavaScript on the
 *     critical path of every page for two gestures. Both gestures survive: the
 *     panel enters on a CSS keyframe, and the rule is measured against the
 *     active tab and handed to a CSS transition — which is what a shared-layout
 *     animation does under the hood.
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const initial = regions.some((r) => r.slug === defaultRegion)
    ? defaultRegion
    : regions[0].slug;
  const [active, setActive] = useState(initial);

  /*
    Whether the reader has changed tabs yet. The panel's entrance is keyed off
    this so the first one — the one the server already rendered — is simply
    there, rather than fading in from nothing while the page is still loading.
    (It is the same thing `initial={false}` did for the AnimatePresence this
    replaces, and it matters more now: a CSS entrance starts at the style sheet
    rather than at hydration, so without the guard it would hold the page's
    main content invisible for its first third of a second.)
  */
  const [changed, setChanged] = useState(false);
  const select = useCallback((slug: string) => {
    setChanged(true);
    setActive(slug);
  }, []);

  /*
    Deep links from the island map — /destinations?region=…#regions — are read
    here, after mount, rather than from a server prop.

    The prop still exists and still wins when a caller passes one; what changed
    is that the page no longer reads `searchParams` to supply it. Touching
    searchParams in a server component opts the whole route out of static
    rendering: /destinations was marked ƒ, so `export const revalidate = 60`
    never applied and every single visit paid for a fresh server render and a
    database round trip, for a query string that only arrivals from the map
    carry. Reading it on the client returns the route to ISR — prerendered,
    served from cache, revalidated in the background.

    The correction lands in the same tick as ScrollToAnchor's scroll, which
    already exists for exactly this navigation and for exactly this reason: the
    fragment is resolved client-side too. The visitor is being scrolled down to
    this panel as the tab changes, and arrives with the right one open.
  */
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("region");
    if (slug && regions.some((r) => r.slug === slug)) setActive(slug);
  }, []);

  const activeIndex = Math.max(
    0,
    regions.findIndex((r) => r.slug === active),
  );
  const region = regions[activeIndex];

  const bySlug = useMemo(
    () => new Map(destinations.map((d) => [d.slug, d])),
    [destinations],
  );

  const places = useMemo(() => placesForRegion(region), [region]);
  const published = places.filter(
    (p) => p.destinationSlug && bySlug.has(p.destinationSlug),
  );

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
        const commons = isLocationVerified(owned)
          ? null
          : commonsPlaceAsset(p.name);
        return {
          place: p,
          href: d ? `/destinations/${d.slug}` : undefined,
          asset: commons ?? owned,
          commons,
          /* Every place note is written the same way: what the place is,
             then what we'd tell you about going. The card shows the first
             part; the second is the reward for the toggle below. Split at
             render — lib/region-places.ts keeps both sentences intact. A note
             that is already short comes back whole and gets no tip. */
          note: splitIfLong(p.note),
        };
      }),
    [places, bySlug],
  );

  /* One switch for the whole panel, not eleven. The tips are a single kind of
     content and the reader's question about them is singular — "is there more
     to know here?" — so it gets a single answer. Off by default: the panel's
     job at rest is eleven photographs and eleven place names. */
  const [notes, setNotes] = useState(false);
  const hasTips = cards.some((c) => c.note.rest);

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
      select(regions[next].slug);
      tabRefs.current[next]?.focus();
    },
    [activeIndex, select],
  );

  /*
    The sliding rule under the selected tab.

    Measured rather than animated by a library: the active button's box is read
    against the tab list and handed to a CSS transition on one shared element.
    offsetTop is part of it because the list wraps — seven region names do not
    fit on one line at every desktop width, and the rule has to travel between
    rows as well as along them.

    Rendered only once measured, which makes it the single part of this widget
    that needs JavaScript. That is the right part to concede: the selected tab
    is already announced by `aria-selected` and coloured in copper.
  */
  const [rule, setRule] = useState<{ x: number; y: number; w: number } | null>(
    null,
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    const el = tabRefs.current[activeIndex];
    if (!list || !el || !el.offsetParent) return setRule(null);
    setRule({
      x: el.offsetLeft,
      y: el.offsetTop + el.offsetHeight - 1,
      w: el.offsetWidth,
    });
  }, [activeIndex]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    // Region names reflow when the display face swaps in.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div className={className}>
      {/* ---------------------------------------------------- mobile control */}
      <div className="md:hidden">
        <label htmlFor={`${uid}-select`} className="eyebrow text-copper-deep">
          Choose a region
        </label>
        {/* `appearance-none` strips the platform caret along with the platform
            styling, and without one this reads as a box with a region name in
            it rather than a control — on a phone the label is the only hint
            that it opens. The chevron is drawn back in, pointer-events-none so
            it never intercepts the tap, and the field carries right padding so
            a long name ("West Coast & Colombo") stops short of it. */}
        <div className="relative mt-3">
          <select
            id={`${uid}-select`}
            value={active}
            onChange={(e) => select(e.target.value)}
            className="w-full appearance-none border border-ink/20 bg-white/70 py-3.5 pl-4 pr-12 font-display text-lg text-ink outline-none transition-colors focus-visible:border-copper"
          >
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-copper-deep"
          />
        </div>
      </div>

      {/* ------------------------------------------------------- desktop tabs */}
      <div
        ref={listRef}
        role="tablist"
        aria-label="Regions of Sri Lanka"
        onKeyDown={onKeyDown}
        className="relative hidden border-b border-ink/10 md:flex md:flex-wrap md:gap-x-8"
      >
        {rule && (
          <span
            aria-hidden
            style={{
              transform: `translate(${rule.x}px, ${rule.y}px)`,
              width: rule.w,
            }}
            className="pointer-events-none absolute left-0 top-0 h-px bg-copper transition-[transform,width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        )}
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
              onClick={() => select(r.slug)}
              /* ink/55 was 3.7:1 on this section's dune ground — a WCAG AA
                 failure on a 12px uppercase label, which is the hardest kind of
                 text to read at low contrast. ink/70 is 5.6:1 and still reads
                 as clearly secondary to the copper of the selected tab, which
                 is what the recession was there to do. */
              className={`relative -mb-px pb-4 pt-1 text-[12px] uppercase tracking-[0.16em] transition-colors ${
                selected ? "text-copper-deep" : "text-ink/70 hover:text-ink"
              }`}
            >
              {r.name}
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
        className="mt-12 outline-none md:mt-16"
      >
        {/* `key` remounts the panel per region, which is what replays the
            entrance — a CSS animation only runs on a new element. */}
        <div
          key={region.slug}
          className={changed ? "rise-in" : undefined}
          style={
            changed
              ? ({
                  "--rise-from": "12px",
                  "--rise-dur": "0.32s",
                } as CSSProperties)
              : undefined
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {/* `font-display-italic`, not `font-display italic`: this is the
                  only italic on the page and it now loads as a static Fraunces
                  italic 400 rather than dragging in the 80 kB variable italic.
                  See the family definition in tailwind.config.ts. */}
            <p className="max-w-xl font-display-italic text-xl leading-snug text-ink/75 md:text-2xl">
              {region.character}
            </p>
            <div className="flex shrink-0 items-center gap-5">
              {/* The Wild South and the Cultural Triangle each have exactly one
                    published guide, so "1 guides" was on screen for two of the
                    seven regions. Cheap to get right, and this line is now the
                    page's primary answer to "what's in this region?". */}
              <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">
                {places.length} {places.length === 1 ? "place" : "places"}
                {published.length > 0 &&
                  ` · ${published.length} ${published.length === 1 ? "guide" : "guides"}`}
              </p>
              {hasTips && (
                <button
                  type="button"
                  onClick={() => setNotes((v) => !v)}
                  aria-expanded={notes}
                  className="inline-flex items-center gap-1.5 border-l border-ink/15 pl-5 text-[12px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-copper-deep"
                >
                  Planner&apos;s notes
                  <ChevronDown
                    size={14}
                    aria-hidden
                    className={`transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      notes ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          <ul
            data-notes={notes ? "open" : "closed"}
            className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16"
          >
            {cards.map(({ place: p, href, asset, note }, i) => {
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
                    className={
                      href
                        ? "transition-transform duration-700 group-hover:scale-105"
                        : ""
                    }
                  />
                  {p.season && (
                    /* The one label on this page sitting over a photograph.
                         An automated checker cannot score it — it reports the
                         image as indeterminate rather than failing it — so it
                         is set by the same rule the rest of the page now
                         follows: at 11px uppercase, take the ground to near
                         opaque and the ink most of the way up. 95/85 is
                         7.4:1 against the badge, and the badge is 95% sand
                         whatever the frame behind it is doing. */
                    <span className="absolute left-4 top-4 z-10 bg-sand/95 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink/85 backdrop-blur">
                      {p.season}
                    </span>
                  )}
                </div>
              );

              const body = (
                <>
                  <h3 className="h-display mt-6 text-2xl text-ink">{p.name}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                    {note.lede}
                  </p>
                  {/*
                      Collapsed, not removed. The sentence is in the served HTML
                      whatever the toggle is doing — it is real writing about a
                      real place and it should be indexed as such. `aria-hidden`
                      tracks the visual state so a screen reader is never read a
                      paragraph the sighted reader can't see; there is nothing
                      focusable inside, so nothing can be tabbed into while it
                      is closed.
                    */}
                  {note.rest && (
                    <div className="tip" aria-hidden={!notes}>
                      <div>
                        <p className="border-l border-copper/40 pl-4 text-[14px] leading-relaxed text-ink/65">
                          {note.rest}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              );

              return (
                /*
                    Was a motion.li. Up to eleven of them mount on every tab
                    change and again on first load, each carrying a framer
                    animation component for a 16px rise — the single largest
                    contributor to this page's main-thread time. The CSS
                    keyframe is the same curve, the same distance, the same
                    stagger; it runs on the compositor and costs nothing to
                    mount. `key` already forces a remount per region, so the
                    entrance still replays on tab change exactly as before.

                    Reduced motion is handled by the global media query in
                    globals.css, which collapses every animation on the site to
                    a single frame.
                  */
                <li
                  key={p.name}
                  className="rise-in"
                  style={
                    {
                      "--rise-from": "16px",
                      animationDelay: `${Math.min(i, 5) * 0.06}s`,
                    } as CSSProperties
                  }
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
                      <span className="mt-4 inline-block text-[12px] uppercase tracking-[0.16em] text-ink/65">
                        Guide in progress
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-16 border-t border-ink/10 pt-10 md:mt-20">
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
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-ink/65 transition-colors marker:content-none hover:text-ink">
                Photography credits
                <span
                  aria-hidden
                  className="ml-2 inline-block transition-transform group-open:rotate-90"
                >
                  ›
                </span>
              </summary>
              {/* The credits were the densest cluster of failures on the page:
                    ink/40 on the summary, ink/45 on the list, ink/60 on the
                    subject name — 2.4:1, 2.8:1 and 4.3:1 against dune. These
                    are a licence obligation, so they are the last text on the
                    site that should be hard to read. Held at ink/65 with the
                    subject at ink/85, which keeps the two-level hierarchy
                    intact and puts both levels over 4.5:1. */}
              <ul className="mt-4 grid gap-2 text-[12px] leading-relaxed text-ink/65 sm:grid-cols-2 lg:grid-cols-3">
                {credits.map((c) => (
                  <li key={c.src}>
                    <span className="text-ink/85">{c.depicts ?? c.alt}</span> ·{" "}
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
        </div>
      </div>
    </div>
  );
}

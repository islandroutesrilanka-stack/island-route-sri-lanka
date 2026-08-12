"use client";

/**
 * "Explore Sri Lanka" — the interactive region map (homepage §02).
 *
 * Two deliberate decisions:
 *
 * 1. No mapping library and no tile requests. An inline SVG silhouette plus
 *    positioned anchors costs a few KB against ~150KB and a stream of network
 *    calls for Leaflet or Mapbox. On a homepage hero-adjacent section that
 *    trade is not close.
 *
 * 2. The SVG is decorative and aria-hidden. Every region is a real anchor
 *    element overlaid on top — so it is keyboard-navigable, screen-reader
 *    legible and works with JavaScript disabled, and the region list beneath is
 *    always present rather than being a fallback nobody maintains. Nothing here
 *    is available only by pointing at a shape.
 *
 * The coastline is real geometry, not a drawn approximation — see the note on
 * ISLAND_PATH below. It is still presented as an index to the regions rather
 * than as a navigational map: there are no borders, roads, scale or labels.
 */

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { regions } from "@/lib/regions";

/**
 * Coastline derived from Natural Earth 1:10m Admin 0 Countries (public domain),
 * via the `world-atlas` TopoJSON build. Projected with d3-geo's Mercator fitted
 * to the viewBox below, then Douglas–Peucker simplified to 204 points on the
 * mainland — about 1.3px of tolerance at the size this renders, so the loss is
 * sub-pixel while the file stays ~3KB.
 *
 * That derivation was a one-off. d3-geo, topojson-client and world-atlas were
 * used to produce these strings and are deliberately NOT project dependencies:
 * the coastline of Sri Lanka is not going to change, so shipping a projection
 * library to redraw it on every page load would be absurd.
 *
 * Four landmasses, in order: mainland, Mannar, Delft, the Jaffna islands. The
 * Batticaloa lagoon barrier is in the source data but omitted — at this size it
 * reads as a scratch alongside the coast rather than as an island.
 *
 * The viewBox is 100 × 176 because that is the island's true Mercator bounding
 * box (1 : 1.764). The container aspect below must keep matching it, otherwise
 * `preserveAspectRatio` letterboxes the SVG inside the box and the hotspot
 * percentages — which are percentages of the *container* — stop lining up.
 */
const MAINLAND =
  "M99.24 123.51L99.56 128.6L97.15 138.24L94.91 142.79L94.74 145.22" +
  "L89.12 153.26L84.46 155.99L76.27 162.51L69.2 165.32L69.2 164.63" +
  "L68.4 164.48L67.91 165.85L65.18 167.21L51.53 171L47.35 174.48L44.78 174.48" +
  "L41.89 176L39.48 175.09L36.26 175.24L35.3 173.88L33.85 174.41L30.64 173.88" +
  "L24.86 171.07L24.53 171.45L19.71 166.68L16.82 160.62L16.02 156.37" +
  "L13.93 151.67L14.41 151.14L14.09 148.56L9.27 136.34L8.63 132.62" +
  "L9.27 127.16L7.18 119.56L7.5 118.42L8.63 122.15L9.27 120.17L8.95 119.03" +
  "L7.67 118.2L5.58 100.57L6.22 100.57L6.7 97.98L1.88 78.2L2.36 76.22" +
  "L1.88 72.8L3.33 71.43L5.58 66.86L4.13 69.98L5.58 70.97L4.13 73.4" +
  "L3.33 77.67L3.33 79.04L4.45 80.18L3.49 82.08L4.93 83.07L7.02 83.3" +
  "L7.99 82.54L6.22 79.34L7.67 76.53L6.7 72.34L7.67 70.66L9.75 58.4" +
  "L11.84 56.49L13.29 49.25L12.16 46.51L12.32 42.77L11.68 40.33L17.63 36.36" +
  "L20.2 28.81L20.68 23.69L18.43 22.47L17.79 19.87L21.8 18.12L22.77 16.66" +
  "L24.21 16.13L22.61 13.99L17.79 10.55L26.62 13.84L27.91 15.21L27.27 16.43" +
  "L28.23 17.05L34.5 14.91L42.85 17.35L36.26 13.61L34.66 14.14L31.93 13.53" +
  "L27.43 9.94L23.73 8.18L23.25 8.18L23.25 9.33L24.37 10.47L23.73 11.09" +
  "L20.68 8.79L19.71 8.41L21.48 10.25L20.36 10.02L13.61 6.5L11.36 2.75" +
  "L14.09 0.69L20.84 0.46L21.32 2.37L23.57 3.36L25.18 3.29L30.64 9.1" +
  "L35.3 11.47L29.68 7.11L26.46 3.36L21.64 1.38L21.48 0.69L22.45 0.31" +
  "L26.46 0.15L33.69 9.63L48.8 21.32L51.04 24.23L48.63 23.46L48.47 23.92" +
  "L50.88 26.21L51.85 26.75L51.2 25.6L52.17 25.29L54.9 30.94L52.97 30.49" +
  "L52.65 31.1L54.42 31.86L54.58 32.85L55.54 32.24L56.35 34.76L58.27 36.74" +
  "L57.63 37.51L56.51 36.29L54.58 35.68L56.67 37.89L57.15 39.11L56.35 40.1" +
  "L57.79 40.56L59.08 38.42L62.13 42.85L64.22 44.22L65.18 46.58L66.79 47.57" +
  "L67.91 51.16L68.24 50.55L68.88 50.85L70.48 53.29L70.48 54.13L69.2 55.12" +
  "L70.16 54.82L71.29 58.02L70.16 58.25L70.32 57.48L69.52 56.8L69.52 59.77" +
  "L67.11 58.55L65.99 60.08L67.75 59.16L69.52 61.37L72.57 61.6L73.38 61.14" +
  "L72.89 60.08L74.5 59.39L76.43 60.91L77.39 66.25L75.79 64.42L75.95 66.32" +
  "L77.88 67.39L80.12 76.91L79.32 78.05L78.04 74.01L77.71 76.53L79.48 78.43" +
  "L80.29 78.43L80.77 77.44L83.34 82.69L83.98 82.08L84.14 83.3L85.11 82.69" +
  "L85.11 84.52L86.71 86.42L85.75 87.64L86.23 89.16L87.19 90.22L88.48 90.07" +
  "L91.85 94.79L91.85 95.62L90.89 95.93L88.8 93.72L87.52 93.49L86.71 95.02" +
  "L89.44 95.09L91.85 98.44L91.85 99.65L92.01 98.74L93.78 100.03L94.58 102.09" +
  "L94.58 104.14L93.94 104.97L94.91 106.42L94.42 107.1L95.55 106.72" +
  "L95.87 109.23L96.67 106.27L97.32 106.72L99.4 112.95L99.24 123.51Z";

const MANNAR =
  "M2.68 34.15L2.2 33.92L2.04 33.46L2.04 33.08L2.68 32.85L4.77 32.85" +
  "L6.54 33.31L8.47 34.07L10.24 35.14L11.68 36.59L11.04 36.44L9.75 35.83" +
  "L8.95 35.68L11.04 38.04L11.36 38.73L10.4 38.57L9.59 38.04L8.79 37.2" +
  "L8.31 36.97L6.54 35.29L4.77 34.53L3.65 34.23L2.68 34.15Z";

const DELFT =
  "M3.49 14.91L3.17 15.29L2.68 15.59L1.56 15.67L0.6 15.29L0.11 14.75" +
  "L0.11 12.92L0.27 12.46L0.6 12.46L1.08 13.38L1.72 13.61L2.68 13.68" +
  "L3.01 13.84L3.49 14.91Z";

const JAFFNA_ISLANDS =
  "M10.88 9.63L10.08 9.1L9.43 8.1L8.31 5.89L8.79 5.12L8.95 4.13L9.27 3.36" +
  "L10.24 3.14L10.72 3.29L10.72 3.67L10.56 4.21L10.56 6.04L10.72 6.42" +
  "L11.36 6.88L12.16 6.81L12.32 6.96L12.32 7.65L12.48 7.95L14.25 8.87" +
  "L14.41 9.33L14.09 9.63L13.61 9.63L12.16 9.1L11.36 9.56L10.88 9.63Z";

const ISLAND_PATH = MAINLAND + MANNAR + DELFT + JAFFNA_ISLANDS;

/**
 * One real place per region, projected through the same Mercator as the
 * coastline, expressed as % of the container. Every one is inside the mainland
 * polygon — checked by point-in-polygon against the simplified path, not by eye.
 *
 * north Jaffna · cultural-triangle Sigiriya · east-coast Batticaloa
 * hill-country Nuwara Eliya · west-coast Colombo · wild-south Tissamaharama
 * south-coast Galle
 */
const HOTSPOTS: Record<string, { x: number; y: number }> = {
  north: { x: 16.6, y: 4.3 },
  "cultural-triangle": { x: 49.4, y: 48.1 },
  "east-coast": { x: 91, y: 54.4 },
  "hill-country": { x: 50.7, y: 73.8 },
  "west-coast": { x: 9.3, y: 74.4 },
  "wild-south": { x: 72.9, y: 90.8 },
  "south-coast": { x: 25.3, y: 96.7 },
};

export default function IslandMap({
  basePath = "/destinations",
  hash = "",
}: {
  /**
   * Where a region click goes. Defaults to /destinations so the homepage and
   * the Destinations page are untouched; /tours passes its own path to reuse
   * the same coastline, hotspots and accessibility model rather than cloning
   * the component.
   */
  basePath?: string;
  /**
   * Fragment appended after the query — e.g. "#regions". /destinations leads
   * with the region explorer, and a region click should land *on* it rather
   * than at the top of a hero the visitor has already scrolled past to reach
   * this map. Empty by default: a fragment that matches no id is ignored by
   * the browser, but writing one that doesn't exist is a lie in the markup, so
   * only callers whose target page has the anchor pass it.
   */
  hash?: string;
} = {}) {
  const [active, setActive] = useState<string>(regions[0].slug);
  const region = regions.find((r) => r.slug === active) ?? regions[0];

  const regionHref = (slug: string) => `${basePath}?region=${slug}${hash}`;

  return (
    /*
      Mobile layout, and why it is a two-column grid rather than a stack.

      Stacked, this section ran past 1,200px on a phone: a 280 × 493 map, then
      the detail panel, then seven full-width rows — three screens to read one
      component. Sri Lanka is 1 : 1.764, which is exactly the wrong shape to
      give a full-width column and exactly the right shape to stand beside
      text. So below `lg` the map takes an `auto` column sized by its own
      width, the detail panel takes the `1fr` beside it, and the region index
      spans both underneath in two columns. That is ~450px — one screen.

      The map is sized by WIDTH, never by height. `aspect-[100/176]` then
      derives the height, so the container ratio still matches the viewBox and
      the hotspot percentages keep landing on the coastline (see the note on
      ISLAND_PATH). Capping it with a viewport-height unit would have
      letterboxed the SVG and quietly walked every dot off the island.
    */
    <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-8 sm:gap-x-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      {/* ---------------------------------- Map ---------------------------------- */}
      <div className="lg:col-span-5">
        <div className="relative aspect-[100/176] w-[clamp(7.5rem,34vw,10.5rem)] lg:mx-auto lg:w-full lg:max-w-[17.5rem]">
          {/*
            `overflow-visible` matters here. Sri Lanka's extremes — Point Pedro,
            Dondra Head, Sangaman Kanda, Delft — sit exactly on the viewBox
            edges, because the projection was fitted to the island's own bounding
            box. A user agent clips an <svg> to its viewport by default, so any
            stroke centred on those points loses its outer half. The halo below
            is 4px wide and would be visibly shaved along all four sides.
          */}
          <svg
            viewBox="0 0 100 176"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {/*
              Cartographic halo, not a glow: one wider stroke at low opacity,
              sitting behind the coastline. No blur filter — a feGaussianBlur
              would cost a raster pass on every resize and read as neon at any
              radius large enough to notice. Round joins because a 4px stroke
              over a 204-point coastline throws miter spikes at the sharp
              reversals around the Jaffna peninsula.

              Same ISLAND_PATH, so the geographic boundary is untouched: this is
              the identical geometry drawn twice, never a second outline.
            */}
            <path
              d={ISLAND_PATH}
              fill="none"
              className="stroke-copper-light/10"
              strokeWidth={4}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={ISLAND_PATH}
              className="fill-palm/50 stroke-copper/45"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {regions.map((r) => {
            const pos = HOTSPOTS[r.slug];
            if (!pos) return null;
            const isActive = r.slug === active;
            return (
              <Link
                key={r.slug}
                href={regionHref(r.slug)}
                onMouseEnter={() => setActive(r.slug)}
                onFocus={() => setActive(r.slug)}
                aria-current={isActive ? "true" : undefined}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <span className="sr-only">{r.name}</span>
                <span
                  aria-hidden
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-3.5 w-3.5 bg-copper-light ring-4 ring-copper-light/25"
                      : "h-2 w-2 bg-sand/60"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ------------------------------- Detail panel ------------------------------
          `min-w-0` because this is the `1fr` track: without it a long region
          name sets the column's min-content width and pushes the map off. */}
      <div className="min-w-0 lg:col-span-4">
        <p className="eyebrow text-copper-light">{`Region ${
          regions.findIndex((r) => r.slug === region.slug) + 1
        } of ${regions.length}`}</p>
        <h3 className="h-display mt-2 text-[1.55rem] leading-[1.1] text-sand sm:mt-3 sm:text-3xl lg:text-4xl">
          {region.name}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-sand/70 sm:mt-4 sm:text-base">
          {region.character}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 sm:mt-6 sm:gap-x-4 sm:gap-y-2">
          {region.places.map((p) => (
            <li
              key={p}
              className="text-[11px] uppercase tracking-[0.12em] text-sand/55 sm:text-[12px] sm:tracking-[0.14em]"
            >
              {p}
            </li>
          ))}
        </ul>
        <Link
          href={regionHref(region.slug)}
          className="link-line mt-5 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-copper-light sm:mt-8 sm:text-[13px]"
        >
          Explore {region.name} <ArrowRight size={15} />
        </Link>
      </div>

      {/* ------------------ Always-present list: not a JS fallback -----------------
          Two columns below `lg` — seven full-width rows were a third of the
          section's height on a phone for content the map already shows. The
          rules come from a `border-t` on each row plus a `border-b` on the
          list rather than `divide-y`, which only draws between siblings and so
          leaves a two-column grid unruled. At `lg` the result is identical to
          the `border-y + divide-y` it replaces. The trailing arrow is desktop
          only: at half width it steals the ~20px that keeps "West Coast &
          Colombo" on one line. */}
      <nav
        aria-label="Regions of Sri Lanka"
        className="col-span-2 lg:col-span-3"
      >
        <ul className="grid grid-cols-2 gap-x-5 border-b border-sand/10 sm:gap-x-8 lg:grid-cols-1 lg:gap-0">
          {regions.map((r) => (
            <li key={r.slug} className="border-t border-sand/10">
              <Link
                href={regionHref(r.slug)}
                onMouseEnter={() => setActive(r.slug)}
                onFocus={() => setActive(r.slug)}
                className={`flex items-center justify-between py-2.5 text-[11px] uppercase leading-tight tracking-[0.1em] transition-colors sm:text-[12px] lg:py-3.5 lg:text-[13px] lg:tracking-[0.14em] ${
                  r.slug === active
                    ? "text-copper-light"
                    : "text-sand/65 hover:text-sand"
                }`}
              >
                {r.name}
                <ArrowRight size={14} className="hidden opacity-60 lg:block" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

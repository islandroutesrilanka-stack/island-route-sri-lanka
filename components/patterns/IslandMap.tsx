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
 * The silhouette is a stylised diagram, not a survey-accurate coastline. It is
 * presented as an index to the regions, never as a navigational map. Real
 * boundary geometry belongs with the regions table in a later phase.
 */

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { regions } from "@/lib/regions";

/** Approximate positions as % of the viewBox, north at the top. */
const HOTSPOTS: Record<string, { x: number; y: number }> = {
  north: { x: 44, y: 9 },
  "cultural-triangle": { x: 47, y: 30 },
  "east-coast": { x: 69, y: 46 },
  "hill-country": { x: 48, y: 57 },
  "west-coast": { x: 25, y: 58 },
  "wild-south": { x: 57, y: 79 },
  "south-coast": { x: 35, y: 87 },
};

const ISLAND_PATH =
  "M46 6 C58 10, 66 26, 72 44 C79 62, 80 84, 72 104 C66 120, 60 134, 50 150 C42 138, 33 126, 26 110 C18 92, 15 70, 20 50 C25 30, 34 14, 46 6 Z";

export default function IslandMap() {
  const [active, setActive] = useState<string>(regions[0].slug);
  const region = regions.find((r) => r.slug === active) ?? regions[0];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      {/* ---------------------------------- Map ---------------------------------- */}
      <div className="lg:col-span-5">
        <div className="relative mx-auto aspect-[100/160] w-full max-w-[19rem]">
          <svg
            viewBox="0 0 100 160"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d={ISLAND_PATH}
              className="fill-palm/50 stroke-copper/45"
              strokeWidth={0.6}
            />
          </svg>

          {regions.map((r) => {
            const pos = HOTSPOTS[r.slug];
            if (!pos) return null;
            const isActive = r.slug === active;
            return (
              <Link
                key={r.slug}
                href={`/destinations?region=${r.slug}`}
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

      {/* ------------------------------- Detail panel ------------------------------ */}
      <div className="lg:col-span-4">
        <p className="eyebrow text-copper-light">{`Region ${
          regions.findIndex((r) => r.slug === region.slug) + 1
        } of ${regions.length}`}</p>
        <h3 className="h-display mt-3 text-3xl text-sand md:text-4xl">
          {region.name}
        </h3>
        <p className="mt-4 leading-relaxed text-sand/70">{region.character}</p>
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {region.places.map((p) => (
            <li
              key={p}
              className="text-[12px] uppercase tracking-[0.14em] text-sand/55"
            >
              {p}
            </li>
          ))}
        </ul>
        <Link
          href={`/destinations?region=${region.slug}`}
          className="link-line mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-copper-light"
        >
          Explore {region.name} <ArrowRight size={15} />
        </Link>
      </div>

      {/* ------------------ Always-present list: not a JS fallback ----------------- */}
      <nav aria-label="Regions of Sri Lanka" className="lg:col-span-3">
        <ul className="divide-y divide-sand/10 border-y border-sand/10">
          {regions.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/destinations?region=${r.slug}`}
                onMouseEnter={() => setActive(r.slug)}
                onFocus={() => setActive(r.slug)}
                className={`flex items-center justify-between py-3.5 text-[13px] uppercase tracking-[0.14em] transition-colors ${
                  r.slug === active
                    ? "text-copper-light"
                    : "text-sand/65 hover:text-sand"
                }`}
              >
                {r.name}
                <ArrowRight size={14} className="opacity-60" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/**
 * The Luxury Fleet strip (homepage §05).
 *
 * Deliberately a footnote to the Signature Tours section rather than a section
 * of its own — which is also its logical relationship to the tours above it:
 * this is what you travel in. Roughly 140px tall, hairline-separated, no
 * photography.
 *
 * No photography is intentional. The fleet images in the old registry were
 * generic stock cars, and a stock sedan at hero scale says nothing true about
 * the business. Names and capacities are honest; a borrowed photograph is not.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/lib/content";
import { lowestDayRate, money, rateForVehicle } from "@/lib/pricing";

export default function FleetStrip({ fleet }: { fleet: Vehicle[] }) {
  const shown = fleet.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <div className="mt-16 border-t border-sand/15 pt-8 md:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          {/* h3: this strip sits inside the Signature Tours section, whose
              SectionHeading is the h2. Styling is unchanged. */}
          <h3 className="eyebrow text-copper-light">The fleet</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand/60">
            Air-conditioned, maintained and driven by a chauffeur-guide who
            knows the road. From {money(lowestDayRate)} a day, all-inclusive —
            fuel, tolls, parking and your driver&apos;s own costs are already in
            it.
          </p>
        </div>
        <Link
          href="/about#fleet"
          className="link-line text-[13px] uppercase tracking-[0.16em] text-copper-light"
        >
          See the fleet <ArrowRight size={14} className="inline" />
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-px border-y border-sand/10 bg-sand/10 sm:grid-cols-3">
        {shown.map((v) => (
          <li key={v.slug} className="bg-deep px-5 py-6">
            <p className="font-display text-xl text-sand">{v.name}</p>
            <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-sand/55">
              {v.passengers} guests{v.luggage ? ` · ${v.luggage}` : ""}
            </p>
            {/* Only the two published tiers carry a number here. A vehicle
                quoted per route says so, rather than showing nothing — an
                absent price on a card beside two priced ones reads as an
                oversight. */}
            <p className="mt-2 text-[13px] text-copper-light">
              {rateForVehicle(v.slug)
                ? `${money(rateForVehicle(v.slug)!.usdPerDay)} / day`
                : "Quoted per route"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

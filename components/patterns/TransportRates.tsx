/**
 * The transport pricing model, rendered.
 *
 * Three pieces that travel together and are used in different combinations:
 * the rate cards, the inclusion list, and the scope/hotels note. All three read
 * from lib/pricing.ts, so /services, /about#fleet, the homepage strip and the
 * booking form cannot quote different numbers at each other.
 *
 * `tone` exists because two of the four surfaces sit on the dark `deep`
 * background. It swaps the palette and nothing else — the content, the order
 * and the markup are identical, which is the point.
 */
import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import {
  dayRates,
  money,
  packageStance,
  rateBasis,
  serviceScope,
  transportInclusions,
  tripDays,
} from "@/lib/pricing";

type Tone = "light" | "dark";

const t = (tone: Tone) =>
  tone === "dark"
    ? {
        border: "border-sand/15",
        heading: "text-sand",
        body: "text-sand/70",
        muted: "text-sand/55",
        accent: "text-copper-light",
        panel: "bg-sand/[0.03]",
      }
    : {
        border: "border-ink/10",
        heading: "text-ink",
        body: "text-ink/70",
        muted: "text-ink/65",
        accent: "text-copper-deep",
        panel: "bg-white/50",
      };

/* ------------------------------ Package stance ----------------------------- */

/**
 * Why these routes carry no price, said once and reused.
 *
 * /tours and every /tours/[slug] used to end at a number — "From US$1,850 per
 * person" — which framed each journey as a thing you buy off a shelf. It never
 * survived first contact: most of that figure was hotels, hotels move by season
 * and by lead time, and so the quote that followed was always a correction.
 *
 * The routes are now what they honestly were all along: itineraries worth
 * stealing. This band says that in the visitor's own terms and points at the
 * one number we can stand behind, so nobody has to work out from an absence
 * that the price is missing on purpose.
 *
 * `href` defaults to the calculator on /book. Pass `?tour=` to carry the route
 * through, which is what the detail page does.
 */
export function PackageStance({
  tone = "light",
  href = "/book",
  className = "",
}: {
  tone?: Tone;
  href?: string;
  className?: string;
}) {
  const c = t(tone);
  return (
    <div className={`border ${c.border} ${c.panel} p-6 md:p-9 ${className}`}>
      <p className={`eyebrow ${c.accent}`}>{packageStance.eyebrow}</p>
      <h3 className={`h-display mt-3 max-w-xl text-3xl ${c.heading} md:text-4xl`}>
        {packageStance.title}
      </h3>
      <p className={`mt-5 max-w-2xl text-[15px] leading-relaxed ${c.body}`}>
        {packageStance.body}
      </p>
      <Link
        href={href}
        className={`mt-7 inline-flex items-center gap-2.5 border px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] transition-colors ${
          tone === "dark"
            ? "border-sand/30 text-sand hover:border-copper-light hover:text-copper-light"
            : "border-ink/25 text-ink hover:border-copper-deep hover:text-copper-deep"
        }`}
      >
        {packageStance.cta} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

/* --------------------------------- Rates ---------------------------------- */

/**
 * The published day rates, as cards.
 *
 * `layout` exists because `sm:` asks about the viewport, not the column. In the
 * /book sidebar the viewport is wide while the column is about 380px, so the
 * two-up grid fires and squeezes each card until the price breaks mid-number
 * ("US$8 / 0"). Narrow containers pass `layout="stack"`. The price also carries
 * `whitespace-nowrap`, so no future placement can split a figure either way.
 */
export function RateCards({
  tone = "light",
  className = "",
  layout = "auto",
}: {
  tone?: Tone;
  className?: string;
  /** "auto" goes two-up from the `sm` breakpoint; "stack" never does. */
  layout?: "auto" | "stack";
}) {
  const c = t(tone);
  return (
    <div className={className}>
      <div
        className={`grid gap-px ${layout === "auto" ? "sm:grid-cols-2" : ""}`}
      >
        {dayRates.map((r) => (
          <div
            key={r.label}
            className={`border ${c.border} ${c.panel} p-6 md:p-7`}
          >
            <p className={`eyebrow ${c.accent}`}>{r.label}</p>
            <p
              className={`h-display mt-3 whitespace-nowrap text-4xl ${c.heading} md:text-5xl`}
            >
              {money(r.usdPerDay)}
              <span className={`ml-2 align-middle text-base ${c.muted}`}>
                / day
              </span>
            </p>
            <p className={`mt-3 text-[15px] leading-relaxed ${c.body}`}>
              {r.suits}
            </p>
          </div>
        ))}
      </div>
      {/* The unit, said once beneath both cards rather than twice inside them. */}
      <p className={`mt-4 text-[13px] leading-relaxed ${c.muted}`}>
        Rates are {rateBasis}. Larger vehicles — the SUV, mini coach and safari
        jeep — are quoted per route.
      </p>
    </div>
  );
}

/** A single vehicle's rate, for the fleet listing. */
export function RateBadge({
  usdPerDay,
  className = "",
}: {
  usdPerDay: number | null;
  className?: string;
}) {
  return (
    <p className={`text-[15px] text-ink/70 ${className}`}>
      {usdPerDay === null ? (
        <span className="text-ink">Quoted per route</span>
      ) : (
        <>
          <span className="font-display text-2xl text-ink">
            {money(usdPerDay)}
          </span>{" "}
          per day
        </>
      )}
      <span className="mt-0.5 block text-[13px] text-ink/65">
        {usdPerDay === null
          ? "Tell us the route and group size and we'll price it exactly."
          : `All-inclusive · ${rateBasis}`}
      </span>
    </p>
  );
}

/**
 * What a specific route costs to drive, both tiers, for its own length.
 *
 * This replaced the per-person price block on /tours/[slug]. It is a better
 * answer to the same question — a guest asking "what will this cost me?" now
 * gets a real total for the half of the trip we sell, rather than an indicative
 * figure for a package that was going to be re-quoted anyway.
 *
 * Renders nothing when the duration has no readable day count. A journey we
 * cannot measure is one we cannot total, and a wrong total is worse than none.
 */
export function TripCost({
  duration,
  tone = "light",
  className = "",
}: {
  duration: string;
  tone?: Tone;
  className?: string;
}) {
  const c = t(tone);
  const days = tripDays(duration);
  if (!days) return null;

  return (
    <div className={className}>
      <p className={`text-[13px] leading-relaxed ${c.muted}`}>
        Transport for {days} {days === 1 ? "day" : "days"}, all-inclusive:
      </p>
      <ul className={`mt-3 divide-y divide-current/10 border-y ${c.border}`}>
        {dayRates.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
          >
            <span className={`text-[15px] ${c.body}`}>{r.label}</span>
            <span className={`whitespace-nowrap font-display text-2xl ${c.heading}`}>
              {money(r.usdPerDay * days)}
              <span className={`ml-1.5 font-body text-[12px] ${c.muted}`}>
                {money(r.usdPerDay)}/day
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className={`mt-3 text-[13px] leading-relaxed ${c.muted}`}>
        {rateBasis[0].toUpperCase() + rateBasis.slice(1)}. Accommodation is not
        included — book your own stays, or tick the hotel box when you enquire
        and we&apos;ll recommend and price them for you.
      </p>
    </div>
  );
}

/* ------------------------------- Inclusions ------------------------------- */

/** What the day rate covers. */
export function InclusionList({
  tone = "light",
  className = "",
  columns = 1,
}: {
  tone?: Tone;
  className?: string;
  columns?: 1 | 2;
}) {
  const c = t(tone);
  return (
    <ul
      className={`grid gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""} ${className}`}
    >
      {transportInclusions.map((item) => (
        <li
          key={item}
          className={`flex items-start gap-3 text-[15px] leading-relaxed ${c.body}`}
        >
          <Check
            size={16}
            strokeWidth={2.2}
            aria-hidden
            className={`mt-1 shrink-0 ${c.accent}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- Scope ---------------------------------- */

/**
 * What the service is, and what it deliberately leaves to the guest.
 *
 * The hotel note is not a disclaimer buried at the bottom — it is a positioning
 * statement, so it is given the same weight as the inclusions above it.
 */
export function ScopeNote({
  tone = "light",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const c = t(tone);
  return (
    <div className={`grid gap-8 sm:grid-cols-3 ${className}`}>
      {[serviceScope.core, serviceScope.hotels, serviceScope.addOn].map(
        (s, i) => (
          <div key={s.title}>
            {i === 2 ? (
              <Info
                size={17}
                strokeWidth={1.8}
                aria-hidden
                className={`mb-3 ${c.accent}`}
              />
            ) : null}
            <p className={`font-semibold ${c.heading}`}>{s.title}</p>
            <p className={`mt-2 text-[15px] leading-relaxed ${c.body}`}>
              {s.body}
            </p>
          </div>
        ),
      )}
    </div>
  );
}

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
import { Check, Info } from "lucide-react";
import {
  dayRates,
  money,
  rateBasis,
  serviceScope,
  transportInclusions,
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

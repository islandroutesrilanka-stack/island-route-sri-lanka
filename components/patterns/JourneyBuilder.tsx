"use client";

/**
 * Build Your Own Journey (/tours).
 *
 * A visitor who doesn't want a packaged trip can assemble the shape of one and
 * hand it to us. Deliberately NOT a booking system: nothing is reserved,
 * nothing is persisted, no table exists. Selections live in component state
 * and leave as a link into the enquiry flow that already works.
 *
 * ── How the handoff stays inside the existing query model ──────────────────
 *
 * `theme`, `duration` and `party` map one-to-one onto TourFilters and are
 * encoded by `filtersToQuery`, so /book's `describeFilters` renders them into
 * the message exactly as the homepage planner's chips already do.
 *
 * Destinations are the exception, and worth explaining. `destination` is a
 * single-value filter — `parseTourFilters` takes the first entry of a repeated
 * param — so encoding a four-stop route there would silently drop three stops.
 * Rather than widen the query model (which /book, /tours and the QA suite all
 * depend on), a multi-stop route is written into `tour`, the free-text field
 * /book already turns into "I'm interested in: …". Existing params keep their
 * exact meaning; nothing new is invented.
 *
 * A single chosen destination still goes through `destination`, so the
 * enquiry carries the same structured context it would from any other entry
 * point on the site.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { experienceCategories } from "@/lib/experiences";
import {
  filtersToQuery,
  DURATION_LABELS,
  PARTY_LABELS,
} from "@/lib/tour-filters";

type Group = { legend: string; items: { label: string; value: string }[] };

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex min-h-[44px] items-center border px-3.5 text-[12px] uppercase tracking-[0.1em] transition-colors ${
        selected
          ? "border-copper-light bg-copper-light/10 text-copper-light"
          : "border-sand/25 text-sand/75 hover:border-copper-light hover:text-copper-light"
      }`}
    >
      {label}
    </button>
  );
}

export default function JourneyBuilder() {
  /** Ordered: the sequence a visitor picks reads as the route they want. */
  const [stops, setStops] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [party, setParty] = useState<string>();

  const toggleStop = (slug: string) =>
    setStops((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  /** Toggling the selected value off is how a visitor clears one choice. */
  const pick =
    (set: (v: string | undefined) => void, current: string | undefined) =>
    (v: string) =>
      set(current === v ? undefined : v);

  const groups: Group[] = [
    {
      legend: "What moves you",
      items: experienceCategories.map((c) => ({ label: c.name, value: c.slug })),
    },
    {
      legend: "How long",
      items: Object.entries(DURATION_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
    {
      legend: "Travelling as",
      items: Object.entries(PARTY_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
    },
  ];

  const stopNames = useMemo(
    () =>
      stops
        .map((s) => destinations.find((d) => d.slug === s)?.name)
        .filter((n): n is string => Boolean(n)),
    [stops]
  );

  const href = useMemo(() => {
    const query = filtersToQuery({
      theme,
      duration,
      party,
      // Structured single-destination context, exactly as elsewhere on the site.
      destination: stops.length === 1 ? stops[0] : undefined,
    });
    // A multi-stop route goes in `tour` — free text /book already renders.
    if (stopNames.length > 1) {
      const p = new URLSearchParams(query.replace(/^\?/, ""));
      p.set("tour", `Custom journey: ${stopNames.join(" → ")}`);
      return `/book?${p.toString()}`;
    }
    return `/book${query}`;
  }, [theme, duration, party, stops, stopNames]);

  const chosen = stopNames.length > 0 || theme || duration || party;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* ------------------------------- Selections ------------------------------ */}
      <div className="lg:col-span-7">
        <div className="mt-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-sand/50">
            Where you&apos;d like to go
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Chip
                  label={d.name}
                  selected={stops.includes(d.slug)}
                  onClick={() => toggleStop(d.slug)}
                />
              </li>
            ))}
          </ul>
        </div>

        {groups.map((g) => (
          <div key={g.legend} className="mt-7">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sand/50">
              {g.legend}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {g.items.map((i) => {
                const selected =
                  (g.legend === "What moves you" && theme === i.value) ||
                  (g.legend === "How long" && duration === i.value) ||
                  (g.legend === "Travelling as" && party === i.value);
                return (
                  <li key={i.value}>
                    <Chip
                      label={i.label}
                      selected={selected}
                      onClick={() =>
                        g.legend === "What moves you"
                          ? pick(setTheme, theme)(i.value)
                          : g.legend === "How long"
                            ? pick(setDuration, duration)(i.value)
                            : pick(setParty, party)(i.value)
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* -------------------------------- Summary -------------------------------- */}
      <div className="lg:col-span-5">
        <div className="border border-sand/15 p-7 md:p-9">
          <p className="eyebrow text-copper-light">Your journey</p>

          {!chosen ? (
            <p className="mt-4 text-[15px] leading-relaxed text-sand/60">
              Pick anything that sounds like your kind of trip. Nothing here is
              fixed — it just gives us a place to start.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {duration && (
                <p className="font-display text-2xl text-sand">
                  {DURATION_LABELS[duration]}
                </p>
              )}
              {theme && (
                <p className="text-[13px] uppercase tracking-[0.14em] text-copper-light">
                  {experienceCategories.find((c) => c.slug === theme)?.name}
                </p>
              )}
              {stopNames.length > 0 && (
                <p className="text-[15px] leading-relaxed text-sand/80">
                  {stopNames.join(" → ")}
                </p>
              )}
              {party && (
                <p className="text-[13px] text-sand/60">
                  Travelling as {PARTY_LABELS[party]}
                </p>
              )}
            </div>
          )}

          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-2.5 bg-copper-deep px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
          >
            Plan my journey <ArrowRight size={15} />
          </Link>

          <p className="mt-4 text-[12px] leading-relaxed text-sand/50">
            This starts an enquiry — nothing is booked and no payment is taken.
            You can edit everything on the next page.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Tour list filtering.
 *
 * Kept as pure functions in their own module so the behaviour can be verified
 * without rendering anything — the filters were previously "implemented" only
 * as links, and nothing caught it because there was nothing to run.
 *
 * The parameter names and values here are not invented: they are exactly what
 * the existing UI already emits (`components/patterns/PlannerEntry.tsx` and
 * `components/patterns/ExperienceRail.tsx`), so every link that exists today
 * keeps working and its URL is unchanged.
 */
import type { Tour } from "./tours";

export type TourFilters = {
  /** Experience category slug, e.g. "wildlife" — from ExperienceRail + planner. */
  theme?: string;
  /** Bucket key, e.g. "5-7" — from the planner's "How long" chips. */
  duration?: string;
  /** Destination slug, e.g. "ella". */
  destination?: string;
  /** couple | family | friends | solo — carried, not filtered. See below. */
  party?: string;
};

/** The duration buckets the UI offers, as inclusive day ranges. */
const DURATION_BUCKETS: Record<string, [number, number]> = {
  "half-day": [0, 0],
  "day": [1, 1],
  "3-4": [3, 4],
  "5-7": [5, 7],
  "8-10": [8, 10],
  "11-14": [11, 14],
  "15+": [15, 365],
};

/**
 * Days a tour lasts, read from its human `duration` string.
 *
 * The data model has no numeric duration field, and adding one would mean
 * restating information that already exists in every record. Parsing keeps a
 * single source of truth; the formats in use are narrow and consistent:
 *
 *   "7 days · 6 nights"                     → 7
 *   "Full day · from Colombo/Kandy"         → 1
 *   "Half or full day · dawn & dusk drives" → 1
 *   "Half day · afternoon drive"            → 0
 *
 * Returns null when nothing sensible can be read, and an unreadable duration
 * is excluded from duration filtering rather than guessed at.
 */
export function tourDurationDays(tour: Tour): number | null {
  const d = (tour.duration ?? "").toLowerCase();
  if (!d) return null;

  const days = d.match(/(\d+)\s*day/);
  if (days) return Number(days[1]);

  // "Half or full day" counts as a full day — the longer of the two options.
  if (d.includes("full day")) return 1;
  if (d.includes("half day")) return 0;
  return null;
}

function matchesDuration(tour: Tour, bucketKey: string): boolean {
  const bucket = DURATION_BUCKETS[bucketKey];
  if (!bucket) return true; // unknown bucket → don't silently hide everything
  const days = tourDurationDays(tour);
  if (days === null) return false;
  return days >= bucket[0] && days <= bucket[1];
}

/**
 * Apply every supplied filter. Filters combine with AND, so adding one can only
 * narrow the list — which is what the chips imply and what keeps the result
 * deterministic regardless of the order they were applied in.
 *
 * `party` is deliberately absent. Nothing in the tour data describes who a
 * journey suits, and deriving it would mean inventing a suitability claim about
 * real trips. It is carried through the URL and into the enquiry instead, where
 * it is genuinely useful, rather than silently dropped.
 */
export function filterTours(tours: Tour[], f: TourFilters): Tour[] {
  return tours.filter((t) => {
    if (f.theme && !t.themeSlugs?.includes(f.theme)) return false;
    if (f.destination && !t.destinationSlugs?.includes(f.destination)) return false;
    if (f.duration && !matchesDuration(t, f.duration)) return false;
    return true;
  });
}

/** True when at least one filter that actually narrows the list is present. */
export function hasActiveFilters(f: TourFilters): boolean {
  return Boolean(f.theme || f.duration || f.destination);
}

/** Read filters off Next's searchParams, ignoring repeated/array values. */
export function parseTourFilters(
  sp: Record<string, string | string[] | undefined>
): TourFilters {
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  return {
    theme: one(sp.theme),
    duration: one(sp.duration),
    destination: one(sp.destination),
    party: one(sp.party),
  };
}

/** Rebuild the current query string, e.g. to carry filters into an enquiry. */
export function filtersToQuery(f: TourFilters): string {
  const p = new URLSearchParams();
  if (f.theme) p.set("theme", f.theme);
  if (f.duration) p.set("duration", f.duration);
  if (f.destination) p.set("destination", f.destination);
  if (f.party) p.set("party", f.party);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ------------------------------ Human labels ------------------------------- */

export const DURATION_LABELS: Record<string, string> = {
  "half-day": "Half day",
  day: "Day tours",
  "3-4": "3–4 days",
  "5-7": "5–7 days",
  "8-10": "8–10 days",
  "11-14": "11–14 days",
  "15+": "15+ days",
};

export const PARTY_LABELS: Record<string, string> = {
  couple: "a couple",
  family: "a family",
  friends: "friends",
  solo: "solo",
};

/**
 * Readable label/value pairs for whatever is currently filtering.
 *
 * Shared by the tours page (filter chips) and the enquiry page (context line)
 * so the two can never describe the same URL differently. Unknown slugs fall
 * back to the raw value rather than being dropped — better a visitor sees an
 * odd word than silently loses a filter they chose.
 */
export function describeFilters(
  f: TourFilters,
  lookups: {
    themeName?: (slug: string) => string | undefined;
    destinationName?: (slug: string) => string | undefined;
  } = {}
): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  if (f.theme) {
    out.push({ label: "Interest", value: lookups.themeName?.(f.theme) ?? f.theme });
  }
  if (f.duration) {
    out.push({ label: "Length", value: DURATION_LABELS[f.duration] ?? f.duration });
  }
  if (f.destination) {
    out.push({
      label: "Destination",
      value: lookups.destinationName?.(f.destination) ?? f.destination,
    });
  }
  if (f.party) {
    out.push({ label: "Travelling as", value: PARTY_LABELS[f.party] ?? f.party });
  }
  return out;
}

export { DURATION_BUCKETS };

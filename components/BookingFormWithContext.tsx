"use client";

/**
 * Resolves the arrival context for the booking form, in the browser.
 *
 * /book is reached from all over the site carrying a query string — a tour page
 * sends `?service=Multi-Day&tour=Wild Coast & Yala`, /services sends its own
 * card title, the journey builder sends a composed outline, and a filtered
 * /tours forwards the filters the visitor chose. Reading that on the server is
 * what made this route `ƒ` (Dynamic): the whole page, form and copy and contact
 * card alike, was re-rendered per request and re-fetched the catalogue from
 * Supabase, for a query string that only ever decides which field starts
 * filled in.
 *
 * So the form is prerendered without context and the context is applied on
 * top. It arrives one render after hydration, and BookingForm re-seeds itself
 * in place rather than remounting, so nothing on screen is torn down — see the
 * note next to `seed` there. Until it arrives, and on every visit that has no
 * query string at all, this renders exactly what the server rendered.
 *
 * The lookups are passed in as plain slug→name maps rather than imported:
 * lib/destinations.ts reaches the Commons provenance table, and the point of
 * this file is to keep the booking page's payload to the form itself.
 */

import BookingForm, { type JourneyOption } from "./BookingForm";
import { useQueryParams } from "./query-watcher";
import { describeFilters, parseTourFiltersFromQuery } from "@/lib/tour-filters";

/**
 * Inbound `?service=` values, mapped to the vocabulary the form speaks.
 *
 * Several pages link here with their own spelling — /services uses the plural
 * card titles ("Airport Transfers", "Custom Travel Itineraries"), the tour
 * pages use the singular category. Anything not in this table is dropped rather
 * than passed through, so a hand-edited or stale URL can't inject an arbitrary
 * string into the service column.
 */
const normalize: Record<string, string> = {
  "Day Tour": "Day Tour",
  "Multi-Day": "Multi-Day Tour",
  "Multi-Day Tour": "Multi-Day Tour",
  Safari: "Safari Tour",
  "Safari Tour": "Safari Tour",
  "Airport Transfer": "Airport Transfer",
  "Airport Transfers": "Airport Transfer",
  "Private Driver Hire": "Private Driver Hire",
  "Taxi Services": "Taxi / Point-to-Point",
  "Surf Transfers": "Surf Transfer",
  "Surf Transfer": "Surf Transfer",
  "Hotel Transfers": "Hotel Transfer",
  "Hotel Transfer": "Hotel Transfer",
  "Custom Travel Itineraries": "Custom Itinerary",
  "Custom Itinerary": "Custom Itinerary",
  "Day Tours": "Day Tour",
  "Multi-Day Tours": "Multi-Day Tour",
  "Safari Tours": "Safari Tour",
};

export default function BookingFormWithContext({
  signature,
  dayTrips,
  themeNames,
  destinationNames,
}: {
  signature: JourneyOption[];
  dayTrips: JourneyOption[];
  themeNames: Record<string, string>;
  destinationNames: Record<string, string>;
}) {
  const { params, watcher } = useQueryParams();

  const service = params?.get("service")?.trim() || undefined;
  const tour = params?.get("tour")?.trim() || undefined;

  /*
    A journey arrived at from a tour page.

    Matched on slug first, then on an exact case-insensitive title, because both
    shapes are in the wild: /tours/[slug] links with `?tour=<title>`, while the
    journey builder sends a composed line like "Custom journey: Galle → Ella".
    That second kind will never match, and shouldn't — it is passed through as
    the visitor's own outline instead of being quietly discarded.
  */
  const matched = tour
    ? [...signature, ...dayTrips].find(
        (t) => t.slug === tour || t.title.toLowerCase() === tour.toLowerCase(),
      )
    : undefined;

  /*
    Planner context.

    /tours forwards the filters a visitor chose (theme, duration, destination,
    party) when it can't match a set journey. They were previously carried in
    the URL and then dropped — the visitor arrived at a blank form having just
    told us exactly what they wanted.

    Rather than adding fields, the choices are written into the existing message
    textarea as a readable line the visitor can edit or delete. `party` is
    included here because it is genuinely useful context for a quote even though
    it cannot filter the catalogue.
  */
  const context = describeFilters(parseTourFiltersFromQuery(params), {
    themeName: (slug) => themeNames[slug],
    destinationName: (slug) => destinationNames[slug],
  });

  /*
    The tour name used to be prepended here as "I'm interested in: …". It isn't
    any more: the form now shows the selected journey as a card with its own
    photograph and price, so repeating it in the message box would be the same
    fact twice — once in a field the visitor might reasonably delete.
  */
  const defaultMessage = context.length
    ? `Looking for: ${context
        .map((c) => `${c.label.toLowerCase()} — ${c.value}`)
        .join("; ")}`
    : "";

  return (
    <>
      {watcher}
      <BookingForm
        signature={signature}
        dayTrips={dayTrips}
        selectedJourney={matched ?? null}
        customJourneyLabel={tour && !matched ? tour : undefined}
        defaultService={service ? (normalize[service] ?? "") : ""}
        defaultMessage={defaultMessage}
        defaultTourTitle={tour}
      />
    </>
  );
}

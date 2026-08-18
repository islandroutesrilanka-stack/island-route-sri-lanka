/**
 * The transport pricing model: day rates, what they include, and what they do not.
 *
 * ── Why this is not in the CMS ─────────────────────────────────────────────
 *
 * The `vehicles` table is content — names, photographs, luggage capacity, the
 * copy an admin should be able to edit at 11pm without a deploy. A published
 * day rate is not content. It is a commercial promise that appears on the
 * homepage, /services, /about#fleet and inside the booking form, and the one
 * thing that must never happen is those four surfaces disagreeing.
 *
 * So the rate lives here, in one array, and is joined onto a vehicle by slug at
 * render time. Nothing has to be migrated, nothing can drift, and an admin
 * renaming "Executive Sedan" cannot change what it costs.
 *
 * The failure mode is deliberately safe. A vehicle whose slug has no tier here
 * shows "quoted per route", never a price — so if a slug is edited in the CMS
 * the site stops quoting rather than quoting something wrong.
 *
 * ── Why only two rates ────────────────────────────────────────────────────
 *
 * Two are published because two were set: a car and a van. The SUV, the mini
 * coach and the safari jeep are quoted per route, because inventing a number
 * for them would be worse than the honest absence of one. Add a tier below when
 * a rate actually exists.
 */

/* ------------------------------- Day rates -------------------------------- */

export type DayRate = {
  /** Vehicle class as a guest would say it, not as the fleet page titles it. */
  label: string;
  /** US dollars, per vehicle, per day — never per person. See `rateBasis`. */
  usdPerDay: number;
  /** Who the tier is for, one line. */
  suits: string;
  /** Fleet slugs this rate covers. Anything not listed is quoted per route. */
  vehicleSlugs: string[];
};

export const dayRates: DayRate[] = [
  {
    label: "Car / Sedan",
    usdPerDay: 80,
    suits: "Couples and solo travellers, up to 3 guests with luggage.",
    vehicleSlugs: ["executive-sedan"],
  },
  {
    label: "Van / KDH",
    usdPerDay: 120,
    suits: "Families and small groups, up to 8 guests with room for boards.",
    vehicleSlugs: ["high-roof-van"],
  },
];

/**
 * The unit the rate is quoted in, stated wherever a rate appears.
 *
 * "$80 a day" is ambiguous in a market where per-person pricing is common, and
 * the ambiguity always resolves against us — a guest who assumed per-person
 * feels overcharged the moment they read the quote. It is one line; it is
 * cheaper to repeat it than to explain it later.
 */
export const rateBasis = "per vehicle, per day — not per person";

/** The published rate for a fleet slug, or null when it is quoted per route. */
export const rateForVehicle = (slug: string): DayRate | null =>
  dayRates.find((r) => r.vehicleSlugs.includes(slug)) ?? null;

/** The lowest published rate, for "from US$80" lines. */
export const lowestDayRate = Math.min(...dayRates.map((r) => r.usdPerDay));

export const money = (n: number) => `US$${n.toLocaleString("en-US")}`;

/* ----------------------------- What's included ---------------------------- */

/**
 * Everything the day rate covers.
 *
 * The point of listing the unglamorous items — tolls, parking, the driver's own
 * bed and dinner — is that these are exactly the charges that appear at the end
 * of a trip elsewhere. Naming them in advance is the product.
 */
export const transportInclusions = [
  "Private vehicle and English-speaking chauffeur guide",
  "Fuel and all vehicle running costs",
  "All parking fees, tolls and highway charges",
  "Driver's accommodation and meals",
  "No hidden charges — all-inclusive transport",
] as const;

/* --------------------------- Scope and add-ons ---------------------------- */

/**
 * What we sell, and — just as important — what we deliberately don't.
 *
 * Hotels are not bundled into the transport service. The guest-facing reason is
 * the true one: a traveller paying this much for a private car has opinions
 * about where they sleep, often loyalty points to spend, and no wish to be
 * routed into whichever property pays the best commission. Booking their own
 * stays keeps that choice, and any dispute over a room, with the hotel that
 * took the money.
 *
 * That is also why the add-on below is opt-in and framed as assistance rather
 * than as a package. We will do the legwork when asked; we will not quietly
 * become the counterparty on someone else's room.
 *
 * ── The carve-out this copy has to respect ────────────────────────────────
 *
 * Six of the seven signature journeys in lib/journeys.ts still list
 * accommodation in their `includes` — "Boutique and heritage accommodation,
 * breakfast daily" and similar — and their per-person prices are built on it.
 * A blanket "we never bundle hotels" would contradict the catalogue and
 * misprice it.
 *
 * So every statement below is scoped to the transport service: the day rate,
 * what it covers, and what it leaves to the guest. If the packaged journeys are
 * meant to move to accommodation-free pricing too, that is a repricing exercise
 * in lib/journeys.ts, not a copy change here — and this note should come out
 * once it happens.
 */
export const serviceScope = {
  core: {
    title: "Premium private transport, and the route to go with it",
    body: "Your own vehicle, your own chauffeur guide, and an itinerary built around how you actually want to travel. One all-inclusive daily rate, agreed before you leave home.",
  },
  hotels: {
    title: "Hotels stay yours to choose",
    body: "Your transport rate covers the vehicle, the chauffeur and the road — not your room. Where you sleep is the most personal decision of a trip, and booking it yourself keeps your choice, your loyalty points and your cancellation terms with the hotel itself rather than a middleman.",
  },
  addOn: {
    title: "Hotel booking assistance — optional",
    body: "Would rather not do the research? Ask, and a planner will shortlist stays along your route to suit your taste and budget, and handle the reservations for you.",
  },
} as const;

/**
 * The line the booking form writes into the enquiry when the add-on is ticked.
 *
 * A fixed, greppable sentence rather than free prose: it lands in the message
 * body, the notification email and the admin view all at once, and a planner
 * scanning a week of enquiries can find every one of them with a single search.
 * Change it and old enquiries stop matching, so treat it as a stored value.
 */
export const HOTEL_ASSIST_LINE =
  "Hotel booking assistance requested (optional add-on).";

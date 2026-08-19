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

export type RateId = "car" | "van";

export type DayRate = {
  /**
   * Stable key held in booking-form state and written into enquiries. Not the
   * label — the label is copy and may be reworded; this must not change.
   */
  id: RateId;
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
    id: "car",
    label: "Car / Sedan",
    usdPerDay: 80,
    suits:
      "Couples, solo travellers and young families — up to 3 adults, or 2 adults with up to 3 children, with luggage.",
    vehicleSlugs: ["executive-sedan"],
  },
  {
    id: "van",
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

/* ------------------------------ The quote --------------------------------- */

/**
 * Days × rate. That is the whole commercial model, and it is deliberately the
 * whole of this function too.
 *
 * There used to be a second, incompatible model on the same site: signature
 * journeys carried a fixed per-person price that bundled accommodation. Those
 * prices could not survive contact with reality — hotel rates move by season,
 * by availability and by how far ahead a guest books, so a shelf price is
 * either padded enough to be uncompetitive or thin enough to be loss-making,
 * and it has to be renegotiated every time a property changes its tariff.
 *
 * A per-vehicle day rate has none of that exposure. It is the one number we
 * genuinely control, it is honest at the moment it is quoted, and it stays true
 * whether the guest sleeps in a tea bungalow or with family in Kandy. So the
 * catalogue no longer prices trips; it inspires them, and the price is composed
 * here from two inputs the guest chooses.
 */
export type Quote = {
  rate: DayRate;
  days: number;
  /** US dollars for the whole trip's transport. Never per person. */
  total: number;
};

export const rateById = (id: RateId): DayRate =>
  dayRates.find((r) => r.id === id) ?? dayRates[0];

/**
 * `days` is clamped rather than validated: this feeds a live figure under a
 * form control, and a guest mid-keystroke ("" or "0" or a pasted "999") should
 * see a sane number, not NaN and not an error. The enquiry is a request for a
 * quote, so the bound is generous — it exists to stop the display breaking, not
 * to refuse the booking.
 */
export const MIN_DAYS = 1;
export const MAX_DAYS = 60;

export const clampDays = (n: number): number =>
  !Number.isFinite(n) ? MIN_DAYS : Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(n)));

export function transportQuote(id: RateId, days: number): Quote {
  const rate = rateById(id);
  const d = clampDays(days);
  return { rate, days: d, total: rate.usdPerDay * d };
}

/**
 * The calculator's state as it arrives from the browser, turned back into a
 * quote the server can trust.
 *
 * A server action's arguments are attacker-controlled, so the figure is
 * recomputed here from the published rate rather than accepted as sent: the
 * client says which vehicle and how many days, never how much that costs.
 * Returns null when the vehicle isn't one we publish a rate for, which is the
 * honest answer for a submission that carried no calculator state at all —
 * the caller then shows no transport line rather than an invented one.
 */
export function parseQuote(rateId: unknown, days: unknown): Quote | null {
  const rate = dayRates.find((r) => r.id === rateId);
  const n = typeof days === "number" ? days : Number(days);
  if (!rate || !Number.isFinite(n)) return null;
  return transportQuote(rate.id, n);
}

/**
 * How many chargeable days a catalogue duration implies, for the "transport
 * from US$X" line on a journey card.
 *
 * Parsed from the existing `duration` string rather than stored as a new field,
 * because `duration` is the CMS column an admin already fills in and a second
 * number would be one more thing to keep in step with it. Two shapes exist in
 * the catalogue — "8 days · 7 nights" and "Full day · from Colombo" — and both
 * are handled. Anything else returns null, and the caller shows the day rate
 * without a total, which is the correct thing to show when the length is
 * genuinely unknown.
 */
export function tripDays(duration: string): number | null {
  const n = duration.match(/(\d+)\s*days?\b/i);
  if (n) return clampDays(Number(n[1]));
  if (/\b(half|full)\s+day\b/i.test(duration)) return 1;
  return null;
}

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
 * This used to need a carve-out: the signature journeys carried fixed
 * per-person prices that bundled accommodation, so a blanket "we never bundle
 * hotels" contradicted the catalogue. That is no longer true. The journeys are
 * now inspiration — a route, a length and a reason to go — and every price on
 * the site is composed from the day rate. The copy below can therefore say
 * plainly what the business does, with nothing to except.
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
  "CUSTOM TOUR PLAN REQUESTED — the guest would like hotel recommendations along the route, with pricing, included in the quote.";

/**
 * The transport figure the guest was shown, restated in their own enquiry.
 *
 * Written out in full — vehicle, days, rate, total — rather than as a bare
 * number, so the quote a planner replies with can be checked against exactly
 * what the calculator displayed. If the two ever disagree, the enquiry itself
 * says which one the guest saw.
 */
export const quoteLine = (q: Quote): string =>
  `Transport estimate: ${q.rate.label} × ${q.days} ${q.days === 1 ? "day" : "days"} at ${money(q.rate.usdPerDay)}/day = ${money(q.total)} total (${rateBasis}).`;

/* ------------------------- The catalogue's new job ------------------------ */

/**
 * What a signature journey is now, said in the guest's language.
 *
 * Used on /tours and /tours/[slug] in place of the old price block. The tone
 * matters: a route without a price can read as evasive, so these lines have to
 * make the absence feel like a deliberate, better offer — which it is.
 */
export const packageStance = {
  eyebrow: "Curated route, not a fixed package",
  title: "A route to steal, priced the honest way",
  body: "Every journey here is a real, drivable itinerary we would happily run tomorrow — take it exactly as written, stretch it, or lift two days out of it. What we don't do is sell it at a shelf price, because the biggest number in any package is the hotels, and those move by season and by how far ahead you book. So you pay for the one thing we control: the vehicle and the chauffeur, by the day, all in.",
  cta: "Price this as a private trip",
} as const;

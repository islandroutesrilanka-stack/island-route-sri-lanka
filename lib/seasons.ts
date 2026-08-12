/**
 * Seasonal curation for /tours.
 *
 * Sri Lanka has two opposing monsoons, so the useful question is never "is it
 * a good time to visit?" but "which side of the island is at its best?". This
 * file answers that with the catalogue we actually have.
 *
 * SOURCE OF TRUTH
 * Every placement below traces to `destination.bestTime` in lib/destinations.ts
 * — data that already existed and that the owner can check:
 *
 *   Sigiriya      Year-round · driest Jan–Sep
 *   Kandy         Dec–Apr · Esala Perahera in Jul/Aug
 *   Ella          Jan–Sep
 *   Nuwara Eliya  Feb–May
 *   Yala          Feb–Jul · park may close Sep–Oct
 *   Galle         Nov–Apr
 *   Mirissa       Nov–Apr
 *   Arugam Bay    May–Sep
 *   Colombo       Year-round
 *
 * A journey's season is the intersection of its destinations' windows. Nothing
 * here is invented, and no tour is placed in a season its own destinations
 * contradict — `surf-soul-east-coast` never appears outside May–Sep, and the
 * Yala safari is withheld in Oct–Nov because the data says the park may close.
 *
 * Withholding a journey we cannot honestly recommend is the whole point. It is
 * a stronger signal of knowing the island than selling everything year-round.
 *
 * `lead` IS AN ORDERED PREFERENCE LIST, NOT A FIXED PAIR
 * The page renders the first two picks that resolve to a live tour. The six
 * signature journeys lead each list and the catalogue tours that used to hold
 * those slots sit behind them as a tail. That matters twice: the journeys are
 * absent from the `tours` table until `insert-premium-journeys.sql` runs, and
 * any tour can be unpublished in Supabase at any time. Either way the flagship
 * grid fills instead of collapsing, and the tail quietly stops rendering once
 * the journeys are live. Tail entries also appear in `more`; the page
 * de-duplicates so nothing is listed twice.
 *
 * THE ONE PLACEMENT THAT DOES NOT TRACE TO `bestTime`
 * `palmyra-and-pearl-northern-passage` has no destinationSlugs — there are no
 * destination records for Jaffna, Mannar or Delft — so there is no `bestTime`
 * to cite. Its May–Sep placement rests on the two northern facts the repo does
 * hold, in lib/region-places.ts: Wilpattu is "Best Feb–Oct", and Mannar's birds
 * are "Nov–Mar" (which is why this journey is sold on the peninsula, not on
 * flamingos, in this window). It is withheld from Oct–Nov, when the northeast
 * monsoon is over the North and Wilpattu's own window has closed.
 *
 * KNOWN GAPS, recorded rather than papered over:
 *  · Oct–Nov leads with only one signature journey. Every other one is
 *    contradicted by its own destinations in that window — the hill trio, Yala
 *    and Arugam Bay are all outside their seasons, and Kandy's Dec–Apr window
 *    rules out the Cultural Odyssey. Only the southern escape qualifies, and
 *    only from November. Leaving the slot to a catalogue tour is the honest
 *    outcome, not a placeholder.
 *  · `udawalawe-elephant-safari` has no destinationSlugs because no Udawalawe
 *    destination record exists. It therefore belongs to no region and cannot
 *    be region-filtered. Left as-is deliberately: inventing a destination to
 *    tidy a relationship would be worse than the gap.
 */

/** A journey in a season, with the reason it earns its place there. */
export type SeasonPick = { slug: string; why: string };

export type SeasonKey = "dec-feb" | "mar-apr" | "may-sep" | "oct-nov";

export type Season = {
  key: SeasonKey;
  /** Friendly name — a visitor should not need to understand monsoons. */
  label: string;
  /** Kept visible alongside the label, never hidden behind it. */
  months: string;
  blurb: string;
  lead: SeasonPick[];
  more: SeasonPick[];
};

export const seasons: Season[] = [
  {
    key: "dec-feb",
    label: "South & West Coast",
    months: "December – February",
    blurb:
      "The southern and western coasts are at their most settled, and the cultural heartland is comfortable to travel. Best suited to beaches, forts and a first circuit of the island.",
    lead: [
      {
        slug: "sun-kissed-horizons-southern-escape",
        why: "Galle and Mirissa are both inside their Nov–Apr window, and the whales are off Mirissa. There is no better time to be on the south coast.",
      },
      {
        slug: "cultural-odyssey",
        why: "Kandy sits squarely in its Dec–Apr window while the dry zone enters its driest months — the cultural heartland at its most comfortable.",
      },
      /* Tail: hold the flagship slots until the journeys are live. */
      {
        slug: "essential-sri-lanka-7-days",
        why: "Galle and Kandy both sit inside their best window, so the classic circuit runs at its most comfortable.",
      },
      {
        slug: "grand-island-circuit-14-days",
        why: "Two weeks with the south coast at its calmest — the fullest version of the island in one journey.",
      },
    ],
    more: [
      {
        slug: "essential-sri-lanka-7-days",
        why: "Galle and Kandy both sit inside their best window.",
      },
      {
        slug: "grand-island-circuit-14-days",
        why: "Two weeks with the south coast at its calmest.",
      },
      {
        slug: "luxe-serenity-in-the-hills",
        why: "From February, once Nuwara Eliya opens its own Feb–May window.",
      },
      { slug: "galle-south-coast-day-tour", why: "The fort and the coast road at their best." },
      { slug: "kandy-cultural-day-tour", why: "Recommended during Dec–Apr." },
      { slug: "hill-country-tea-trails-5-days", why: "Clear highland days from January." },
      { slug: "sigiriya-dambulla-day-tour", why: "Dry-zone weather holds through the season." },
      { slug: "ella-nine-arch-day-tour", why: "Hill country opens up from January." },
    ],
  },
  {
    key: "mar-apr",
    label: "Island in Transition",
    months: "March – April",
    blurb:
      "The island changes hands between monsoons. No coast is guaranteed, which makes this a strong window for the highlands, the Cultural Triangle and mixed routes that can flex.",
    lead: [
      {
        slug: "luxe-serenity-in-the-hills",
        why: "Kandy, Nuwara Eliya and Ella keep different windows — Dec–Apr, Feb–May, Jan–Sep — and these are the weeks all three overlap. The highlands are the surest ground in a month that guarantees no coast.",
      },
      {
        slug: "leopard-light-safari-journey",
        why: "Yala is at its best Feb–Jul and reliably open, which makes this the strongest wildlife window of the year.",
      },
      /* Tail: hold the flagship slots until the journeys are live. */
      {
        slug: "hill-country-tea-trails-5-days",
        why: "Nuwara Eliya is at its best Feb–May — the highlands are the surest ground this season.",
      },
      {
        slug: "essential-sri-lanka-7-days",
        why: "A mixed route that isn't tied to one coast, which suits a transition month.",
      },
    ],
    more: [
      {
        slug: "hill-country-tea-trails-5-days",
        why: "Nuwara Eliya is at its best Feb–May.",
      },
      {
        slug: "essential-sri-lanka-7-days",
        why: "A mixed route that isn't tied to one coast.",
      },
      {
        slug: "cultural-odyssey",
        why: "Kandy holds to April and the dry zone stays dependable.",
      },
      {
        slug: "sun-kissed-horizons-southern-escape",
        why: "The south coast window tapers through April — worth the earlier half.",
      },
      { slug: "yala-leopard-safari", why: "Yala is open and at its best Feb–Jul." },
      { slug: "wild-coast-safari-beaches-10-days", why: "Safari and south coast still align." },
      { slug: "sigiriya-dambulla-day-tour", why: "Reliable in the dry zone." },
      { slug: "kandy-cultural-day-tour", why: "Inside its Dec–Apr window." },
      { slug: "ella-nine-arch-day-tour", why: "Highland days are clear." },
      { slug: "galle-south-coast-day-tour", why: "The south coast window tapers through April." },
    ],
  },
  {
    key: "may-sep",
    label: "East Coast Season",
    months: "May – September",
    blurb:
      "The southwest monsoon crosses the island and the east comes into its own. Warm eastern water, surf, and the dry zone at its driest — while the south and west coasts sit this one out.",
    lead: [
      {
        slug: "salt-and-season-east-coast",
        why: "Arugam Bay's season is May–Sep almost exactly. This is the journey the season is built around.",
      },
      {
        slug: "palmyra-and-pearl-northern-passage",
        why: "While the southwest sits under the monsoon, the North is dry — Wilpattu travels well Feb–Oct, and the Nallur festival falls in July or August.",
      },
      /* Tail: hold the flagship slots until the journeys are live. */
      {
        slug: "surf-soul-east-coast-8-days",
        why: "Arugam Bay's season is May–Sep almost exactly. This is the journey the season is built around.",
      },
      {
        slug: "minneriya-elephant-gathering",
        why: "The gathering builds through August and into October.",
      },
    ],
    more: [
      {
        slug: "surf-soul-east-coast-8-days",
        why: "The east coast on a shorter frame, inside the same window.",
      },
      {
        slug: "minneriya-elephant-gathering",
        why: "The gathering builds through August and into October.",
      },
      {
        slug: "cultural-odyssey",
        why: "Sigiriya is in its driest months, and Kandy's Esala Perahera falls in July or August.",
      },
      {
        slug: "leopard-light-safari-journey",
        why: "Suited to the earlier part of this window, to July, before Yala's Sep–Oct closure.",
      },
      { slug: "sigiriya-dambulla-day-tour", why: "The dry zone is at its driest Jan–Sep." },
      { slug: "ella-nine-arch-day-tour", why: "Hill country holds until September." },
      { slug: "udawalawe-elephant-safari", why: "Elephants here are reliable through the year." },
      { slug: "kandy-cultural-day-tour", why: "Esala Perahera falls in July or August." },
      { slug: "yala-leopard-safari", why: "Best suited to the earlier part of this window, to July." },
    ],
  },
  {
    key: "oct-nov",
    label: "Island in Transition",
    months: "October – November",
    blurb:
      "The second changeover. Inland and wildlife journeys travel well; coastal conditions are the least predictable of the year, so we plan these routes with room to move.",
    lead: [
      {
        slug: "minneriya-elephant-gathering",
        why: "The gathering peaks August to October — the strongest single reason to travel now.",
      },
      {
        slug: "sun-kissed-horizons-southern-escape",
        why: "Galle and Mirissa both reopen in November. The south coast coming back is the clearest reason to travel in the back half of this window — and the reason we'd steer these dates later rather than earlier.",
      },
      /* Tail: holds the slot until the journey is live. */
      {
        slug: "sigiriya-dambulla-day-tour",
        why: "Inland and flexible, with no dependence on a coast.",
      },
    ],
    more: [
      {
        slug: "sigiriya-dambulla-day-tour",
        why: "Inland and flexible, with no dependence on a coast.",
      },
      { slug: "udawalawe-elephant-safari", why: "Dependable elephants whatever the weather does." },
      { slug: "grand-island-circuit-14-days", why: "Comes back into its own from November." },
      { slug: "galle-south-coast-day-tour", why: "The south coast window reopens in November." },
      { slug: "hill-country-tea-trails-5-days", why: "A settled inland alternative to the coast." },
    ],
    /* Deliberately absent, both safaris at Yala — `yala-leopard-safari` and
       `leopard-light-safari-journey`. The destination record says the park may
       close Sep–Oct, so neither is recommended here. Also absent:
       `palmyra-and-pearl-northern-passage` (northeast monsoon over the North,
       and Wilpattu's Feb–Oct window closing), `luxe-serenity-in-the-hills`
       (all three hill destinations outside their windows), `cultural-odyssey`
       (Kandy is Dec–Apr) and `salt-and-season-east-coast` (Arugam Bay is
       May–Sep). Five of the six signature journeys are withheld here on their
       own data — that is the file working, not a shortfall to fill. */
  },
];

/**
 * Which season it is in Sri Lanka right now.
 *
 * Computed in Asia/Colombo, not the server's zone. A UTC host would flip the
 * season up to 5½ hours early on every month boundary — a small bug that would
 * show a visitor the wrong recommendations at exactly the moment they are most
 * likely to be planning around a date.
 */
export function currentSeasonKey(now: Date = new Date()): SeasonKey {
  const month = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      month: "numeric",
    }).format(now)
  );
  if (month === 12 || month <= 2) return "dec-feb";
  if (month <= 4) return "mar-apr";
  if (month <= 9) return "may-sep";
  return "oct-nov";
}

/** An unknown or absent ?season= falls back to the real one, never to an error. */
export function getSeason(key?: string): Season {
  return (
    seasons.find((s) => s.key === key) ??
    seasons.find((s) => s.key === currentSeasonKey())!
  );
}

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
 * KNOWN GAPS, recorded rather than papered over:
 *  · May–Sep has exactly one lead journey. The east coast is the island's
 *    strongest differentiator in that window and the catalogue has one tour
 *    for it, and none for the North. That is a product gap, not a code gap.
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
        slug: "essential-sri-lanka-7-days",
        why: "Galle and Kandy both sit inside their best window, so the classic circuit runs at its most comfortable.",
      },
      {
        slug: "grand-island-circuit-14-days",
        why: "Two weeks with the south coast at its calmest — the fullest version of the island in one journey.",
      },
    ],
    more: [
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
        slug: "hill-country-tea-trails-5-days",
        why: "Nuwara Eliya is at its best Feb–May — the highlands are the surest ground this season.",
      },
      {
        slug: "essential-sri-lanka-7-days",
        why: "A mixed route that isn't tied to one coast, which suits a transition month.",
      },
    ],
    more: [
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
        slug: "surf-soul-east-coast-8-days",
        why: "Arugam Bay's season is May–Sep almost exactly. This is the journey the season is built around.",
      },
      {
        slug: "minneriya-elephant-gathering",
        why: "The gathering builds through August and into October.",
      },
    ],
    more: [
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
        slug: "sigiriya-dambulla-day-tour",
        why: "Inland and flexible, with no dependence on a coast.",
      },
    ],
    more: [
      { slug: "udawalawe-elephant-safari", why: "Dependable elephants whatever the weather does." },
      { slug: "grand-island-circuit-14-days", why: "Comes back into its own from November." },
      { slug: "galle-south-coast-day-tour", why: "The south coast window reopens in November." },
      { slug: "hill-country-tea-trails-5-days", why: "A settled inland alternative to the coast." },
    ],
    /* Deliberately absent: yala-leopard-safari. The destination record says the
       park may close Sep–Oct, so it is not recommended here. */
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

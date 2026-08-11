/**
 * The twelve experience categories.
 *
 * Static for now — its own table is a later phase. The index route
 * (/experiences) and detail pages (/experiences/[slug]) read from here, and
 * which categories they publish is derived from the tour catalogue at the
 * bottom of this file rather than listed by hand.
 *
 * Structure is two-level by design: twelve categories is the right number to
 * navigate, while the activities beneath them carry the long-tail search value
 * ("Sri Lanka whale watching best time" outranks "Sri Lanka tours" for effort).
 * Cross-referenced activities — whale watching sits under both Wildlife and
 * Surf & Ocean — appear in both lists without becoming two pages.
 */

import type { Tour } from "./tours";

export type ExperienceCategory = {
  slug: string;
  name: string;
  /** One line of character. No superlatives, no unverifiable claims. */
  blurb: string;
  activities: string[];
};

export const experienceCategories: ExperienceCategory[] = [
  {
    slug: "wildlife",
    name: "Wildlife",
    blurb: "Dawn game drives, lagoon birdlife and the patience that finds a leopard.",
    activities: ["Safari", "Bird watching", "Whale watching"],
  },
  {
    slug: "surf-ocean",
    name: "Surf & Ocean",
    blurb: "Two coasts, two seasons — there is always a shore that's working.",
    activities: ["Surfing", "Snorkelling", "Scuba diving", "Whale watching", "Fishing"],
  },
  {
    slug: "beaches",
    name: "Beaches",
    blurb: "Long, unhurried mornings on sand that hasn't been arranged for you.",
    activities: ["Beach stays", "Coastal walks", "Island hopping"],
  },
  {
    slug: "culture-heritage",
    name: "Culture & Heritage",
    blurb: "Ancient capitals, working temples and festivals that aren't put on for visitors.",
    activities: ["Ancient cities", "Temples", "Festivals", "Crafts"],
  },
  {
    slug: "food",
    name: "Food",
    blurb: "Rice and curry done properly — and the roadside places we actually stop at.",
    activities: ["Cooking classes", "Market tours", "Street food", "Spice gardens"],
  },
  {
    slug: "wellness",
    name: "Wellness",
    blurb: "Ayurveda with a lineage behind it, and mornings that start slowly.",
    activities: ["Ayurveda", "Yoga", "Meditation", "Spa retreats"],
  },
  {
    slug: "adventure",
    name: "Adventure",
    blurb: "Ridge walks, river days and the parts of the island roads don't reach.",
    activities: ["Hiking", "Cycling", "Camping", "Rafting", "Canyoning"],
  },
  {
    slug: "nature",
    name: "Nature",
    blurb: "Rainforest, waterfalls and cloud forest that changes hour to hour.",
    activities: ["Rainforest", "Waterfalls", "National parks", "Botanical gardens"],
  },
  {
    slug: "tea-country",
    name: "Tea Country",
    blurb: "Estates, factories and the cool green quiet at fifteen hundred metres.",
    activities: ["Estate visits", "Tea tasting", "Plantation stays", "Factory tours"],
  },
  {
    slug: "local-life",
    name: "Local Life",
    blurb: "Villages, markets and the workshops of people who have always been here.",
    activities: ["Village experiences", "Homestays", "Markets", "Artisans"],
  },
  {
    slug: "slow-travel",
    name: "Slow Travel",
    blurb: "Fewer places, longer stays. The island rewards it.",
    activities: ["Train journeys", "Long stays", "Walking", "Cycling routes"],
  },
  {
    slug: "luxury",
    name: "Luxury Experiences",
    blurb: "Quiet, considered and entirely private — never showy.",
    activities: ["Private dining", "Exclusive stays", "Helicopter transfers"],
  },
];

export const getExperienceCategory = (slug: string) =>
  experienceCategories.find((c) => c.slug === slug);

/* ------------------------------ Publication ------------------------------ */

/**
 * A category paired with the journeys that actually carry it.
 *
 * The twelve categories above are the *vocabulary*. What gets a page is a
 * separate question, answered below by the catalogue rather than by a list
 * maintained here.
 */
export type PublishedExperience = {
  category: ExperienceCategory;
  tours: Tour[];
};

/** Journeys that genuinely carry this theme, in catalogue order. */
export const toursForExperience = (allTours: Tour[], slug: string): Tour[] =>
  allTours.filter((t) => t.themeSlugs?.includes(slug));

/**
 * The categories with somewhere to send a visitor.
 *
 * Derived, never hard-coded. Five of the twelve — Food, Wellness, Adventure,
 * Local Life and Luxury — have no journey carrying them today, and a category
 * page that lists nothing is worse than no category page: it advertises a gap
 * to both the visitor and the crawler. So they are simply not published.
 *
 * Deriving this from `themeSlugs` rather than from a denylist matters, because
 * tours also come from Supabase (see lib/data.ts). The day a cooking journey is
 * published with `theme_slugs: ["food"]`, Food gains its index entry, its
 * detail page, its sitemap row and its static param with no code change here —
 * and if the last wildlife journey were ever unpublished, Wildlife would
 * disappear just as quietly instead of 404-ing from the nav.
 */
export function publishedExperiences(allTours: Tour[]): PublishedExperience[] {
  return experienceCategories
    .map((category) => ({
      category,
      tours: toursForExperience(allTours, category.slug),
    }))
    .filter((e) => e.tours.length > 0);
}

/**
 * One published experience, or undefined.
 *
 * Undefined covers both "no such slug" and "that category exists but has no
 * journeys" — the detail route treats them identically, as a 404. An empty
 * category must not be reachable by typing its URL when it isn't reachable by
 * clicking, or the index and the routes disagree about what the site offers.
 */
export function getPublishedExperience(
  allTours: Tour[],
  slug: string
): PublishedExperience | undefined {
  const category = getExperienceCategory(slug);
  if (!category) return undefined;
  const tours = toursForExperience(allTours, slug);
  return tours.length > 0 ? { category, tours } : undefined;
}

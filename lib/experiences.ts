/**
 * The twelve experience categories.
 *
 * Static for now. The full experience system — its own table, index route,
 * detail pages and filters — is a later phase. This file exists so the homepage
 * section can be built against the final shape rather than a throwaway one.
 *
 * Structure is two-level by design: twelve categories is the right number to
 * navigate, while the activities beneath them carry the long-tail search value
 * ("Sri Lanka whale watching best time" outranks "Sri Lanka tours" for effort).
 * Cross-referenced activities — whale watching sits under both Wildlife and
 * Surf & Ocean — appear in both lists without becoming two pages.
 */

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

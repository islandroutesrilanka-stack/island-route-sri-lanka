/**
 * The seven regions of Sri Lanka, as Island Route organises the island.
 *
 * Static for now, deliberately. A `regions` table with proper foreign keys from
 * `destinations` lands in the destinations phase; this file exists so the
 * homepage can be built against the same shape without a premature migration.
 *
 * Note on the earlier draft: "Wildlife" and "Central Highlands" were dropped as
 * regions. Wildlife is an experience, not a place, and Central Highlands is the
 * UNESCO designation for what this site already calls Hill Country — keeping
 * both would have split one region in two.
 *
 * Every existing destination maps into exactly one of these, so no destination
 * URL changes.
 */

export type Region = {
  slug: string;
  name: string;
  /** One line of character — what this region feels like, not what it contains. */
  character: string;
  /** Destination slugs already in the catalogue that belong to this region. */
  destinationSlugs: string[];
  /** Places we cover or plan to cover, for the nav and hub pages. */
  places: string[];
};

export const regions: Region[] = [
  {
    slug: "cultural-triangle",
    name: "Cultural Triangle",
    character: "Rock fortresses, cave temples and the ruins of three ancient capitals.",
    destinationSlugs: ["sigiriya"],
    places: ["Sigiriya", "Dambulla", "Polonnaruwa", "Anuradhapura", "Habarana"],
  },
  {
    slug: "hill-country",
    name: "Hill Country",
    character: "Tea terraces, cloud forest and the slow blue train through the highlands.",
    destinationSlugs: ["kandy", "ella", "nuwara-eliya"],
    places: ["Kandy", "Ella", "Nuwara Eliya", "Haputale", "Horton Plains"],
  },
  {
    slug: "south-coast",
    name: "South Coast",
    character: "Dutch ramparts, whale-rich water and long mornings on warm sand.",
    destinationSlugs: ["galle", "mirissa"],
    places: ["Galle", "Mirissa", "Unawatuna", "Weligama", "Tangalle"],
  },
  {
    slug: "wild-south",
    name: "The Wild South",
    character: "Leopard country — scrub, lagoons and dawn game drives.",
    destinationSlugs: ["yala"],
    places: ["Yala", "Udawalawe", "Tissamaharama", "Bundala"],
  },
  {
    slug: "east-coast",
    name: "East Coast",
    character: "Surf season in reverse, glassy bays and a quieter island.",
    destinationSlugs: ["arugam-bay"],
    places: ["Arugam Bay", "Trincomalee", "Pasikuda", "Batticaloa"],
  },
  {
    slug: "west-coast",
    name: "West Coast & Colombo",
    character: "The island's front door — markets, coastal rail and colonial streets.",
    destinationSlugs: ["colombo"],
    places: ["Colombo", "Negombo", "Bentota", "Kalpitiya"],
  },
  {
    slug: "north",
    name: "The North",
    character: "Palmyra palms, island causeways and a culture distinctly its own.",
    destinationSlugs: [],
    places: ["Jaffna", "Mannar", "Delft", "Wilpattu"],
  },
];

export const getRegion = (slug: string) => regions.find((r) => r.slug === slug);

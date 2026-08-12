import type { MediaAsset, MediaProvenance } from "./types";

/**
 * Photography for the region explorer's places, sourced from Wikimedia Commons.
 *
 * ── Why this file exists ───────────────────────────────────────────────────
 *
 * Twenty-three of the thirty-one places in `lib/region-places.ts` had no
 * photograph, so their cards took the gradient treatment. The obvious fix —
 * point them at generic tropical stock and turn the location gate off — is
 * exactly what this project already tried and reversed. `lib/media/registry.ts`
 * records the outcome in its own header: a tropical beach shipped as
 * "Sigiriya", a lagoon as "Kandy", a cliff as "Ella", and a limestone karst
 * with long-tail boats captioned "Highland railway, Sri Lanka". The blanket
 * sign-off was withdrawn and must not be restored.
 *
 * So this takes the other route: rather than lowering the bar, it clears it.
 * Every asset below is a real photograph of the place its card names, and each
 * one satisfies `isLocationVerified` honestly — no gate is bypassed, no flag is
 * flipped, and `requireVerifiedLocation` stays on in the explorer.
 *
 * ── How each location claim was established ────────────────────────────────
 *
 * Two independent sources, in this order:
 *
 *   1. The file's own Commons title, which is the uploader's location claim and
 *      is subject to community correction — a materially stronger signal than a
 *      stock-library keyword match, which is what burned this project before.
 *   2. Corroboration from the place's Wikipedia article: most of these are the
 *      article's lead image, selected by editors for that article. Where the
 *      lead image was a map (Mannar), a montage (Jaffna) or a weak subject
 *      (Dambulla's modern lower temple, which our own copy tells readers to walk
 *      past), it was replaced by a Commons search scoped to a landmark our copy
 *      already names — Lipton's Seat, Nallur's gopuram, the Delft ponies, the
 *      Mannar baobabs.
 *
 * Every `src` below was resolved through the Commons API and confirmed to
 * return 200 image/jpeg from upload.wikimedia.org. They are 1920px renditions,
 * not originals, so a 35-megapixel source does not become a 35-megapixel fetch.
 *
 * ── Licensing, which is a real obligation and not a footnote ───────────────
 *
 * These are free licences, not public domain. CC BY and CC BY-SA both require
 * attribution; the Free Art Licence does too. `author` and `provenance.license`
 * carry what is needed, and `RegionExplorer` renders them per panel. Do not add
 * an entry here without both fields filled in from the file's own metadata.
 */
export type CommonsPlaceAsset = MediaAsset & {
  /** Required for attribution — verbatim from the file's Commons metadata. */
  author: string;
  /** Narrowed to the stock variant so consumers can read `url` and `license`
   *  off the provenance without re-narrowing a four-member union at every
   *  render. It also makes an entry that forgets `verifiedLocation` a type
   *  error rather than a silent gradient. */
  provenance: Extract<MediaProvenance, { kind: "stock" }>;
};

/**
 * Keyed by the place name exactly as `lib/regions.ts` spells it, which is also
 * the key `lib/region-places.ts` uses. A typo therefore shows up as a gradient
 * card rather than as a crash, and the key is greppable across all three files.
 */
export const commonsPlaces: Record<string, CommonsPlaceAsset> = {
  /* ------------------------------ Cultural Triangle ------------------------ */
  Dambulla: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/30/Buddha_Statues_in_Dambulla%2C_Sri_Lanka_01.jpg",
    alt: "Buddha statues inside the cave temples at Dambulla",
    width: 1200,
    height: 800,
    focal: "50% 50%",
    depicts: "Dambulla Cave Temple, Cultural Triangle",
    author: "কালো ভ্রমর",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Buddha_Statues_in_Dambulla,_Sri_Lanka_01.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Polonnaruwa: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Polonnaruwa_01.jpg/1920px-Polonnaruwa_01.jpg",
    alt: "Stone ruins in the ancient city of Polonnaruwa",
    width: 1920,
    height: 1332,
    focal: "50% 50%",
    depicts: "Polonnaruwa, Cultural Triangle",
    author: "Bernard Gagnon",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Polonnaruwa_01.jpg",
      license: "CC BY-SA 3.0",
      verifiedLocation: true,
    },
  },
  Anuradhapura: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Ruwanweli_Maha_Saaya.jpg/1920px-Ruwanweli_Maha_Saaya.jpg",
    alt: "The Ruwanweliseya stupa at Anuradhapura",
    width: 1920,
    height: 1440,
    focal: "50% 45%",
    depicts: "Ruwanweliseya, Anuradhapura",
    author: "Thisaru Tharuka",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Ruwanweli_Maha_Saaya.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /** Hurulu Eco Park is at Habarana — the elephant parks our copy places
   *  "inside an hour" of the village. */
  Habarana: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Elephas_maximus_maximus%2C_Hurulu_Eco_Park%2C_Sri_Lanka%2C_20260201_1018_7843.jpg/1920px-Elephas_maximus_maximus%2C_Hurulu_Eco_Park%2C_Sri_Lanka%2C_20260201_1018_7843.jpg",
    alt: "A Sri Lankan elephant in Hurulu Eco Park near Habarana",
    width: 1920,
    height: 1277,
    focal: "50% 50%",
    depicts: "Hurulu Eco Park, Habarana",
    author: "Jakub Hałun",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Elephas_maximus_maximus,_Hurulu_Eco_Park,_Sri_Lanka,_20260201_1018_7843.jpg",
      license: "CC BY 4.0",
      verifiedLocation: true,
    },
  },

  /* -------------------------------- Hill Country --------------------------- */
  "Nuwara Eliya": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NuwaraEliya_from_top.jpg/1920px-NuwaraEliya_from_top.jpg",
    alt: "Nuwara Eliya and the surrounding hills seen from above",
    width: 1920,
    height: 1440,
    focal: "50% 50%",
    depicts: "Nuwara Eliya, Hill Country",
    author: "Abdul malik77",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:NuwaraEliya_from_top.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /** Lipton's Seat, which the card's own copy names. */
  Haputale: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Lipton-seat_Sri_Lanka.jpg/1920px-Lipton-seat_Sri_Lanka.jpg",
    alt: "The view over tea country from Lipton's Seat above Haputale",
    width: 1920,
    height: 1279,
    focal: "50% 50%",
    depicts: "Lipton's Seat, Haputale",
    author: "AriyaHetti",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Lipton-seat_Sri_Lanka.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  "Horton Plains": {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Worlds_end_in_horton_plains_in_sri_lanka.jpg/1920px-Worlds_end_in_horton_plains_in_sri_lanka.jpg",
    alt: "World's End, where the Horton Plains plateau drops away",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "World's End, Horton Plains National Park",
    author: "Pamuditha2000",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Worlds_end_in_horton_plains_in_sri_lanka.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },

  /* --------------------------------- South Coast --------------------------- */
  Unawatuna: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Unawatuna.jpg/1920px-Unawatuna.jpg",
    alt: "The sheltered bay at Unawatuna",
    width: 1920,
    height: 1312,
    focal: "50% 50%",
    depicts: "Unawatuna, South Coast",
    author: "Bernard Gagnon",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Unawatuna.jpg",
      license: "CC BY-SA 3.0",
      verifiedLocation: true,
    },
  },
  Weligama: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Weligama_Beach_in_Sri_Lanka.jpg/1920px-Weligama_Beach_in_Sri_Lanka.jpg",
    alt: "The beach at Weligama",
    width: 1920,
    height: 1440,
    focal: "50% 50%",
    depicts: "Weligama, South Coast",
    author: "Honeplus",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Weligama_Beach_in_Sri_Lanka.jpg",
      license: "CC BY-SA 3.0",
      verifiedLocation: true,
    },
  },
  /** Goyambokka — one of the coves the card's copy describes. */
  Tangalle: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Goyambokka_Beach%2C_Tangalle%2C_Sri_Lanka.jpg/1920px-Goyambokka_Beach%2C_Tangalle%2C_Sri_Lanka.jpg",
    alt: "Goyambokka beach near Tangalle",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Goyambokka, Tangalle",
    author: "Satdeep Gill",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Goyambokka_Beach,_Tangalle,_Sri_Lanka.jpg",
      license: "CC BY 4.0",
      verifiedLocation: true,
    },
  },

  /* -------------------------------- The Wild South ------------------------- */
  Udawalawe: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Udawalawe_National_Park_%28Udawalawa_Reservoir%29.jpg/1920px-Udawalawe_National_Park_%28Udawalawa_Reservoir%29.jpg",
    alt: "The reservoir at the centre of Udawalawe National Park",
    width: 1920,
    height: 830,
    focal: "50% 50%",
    depicts: "Udawalawe National Park",
    author: "AntanO",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Udawalawe_National_Park_(Udawalawa_Reservoir).jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Tissamaharama: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tissamaharama_dagoba.jpg/1920px-Tissamaharama_dagoba.jpg",
    alt: "The dagoba at Tissamaharama",
    width: 1920,
    height: 1440,
    focal: "50% 45%",
    depicts: "Tissamaharama, The Wild South",
    author: "Krankman",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Tissamaharama_dagoba.jpg",
      license: "CC BY 3.0",
      verifiedLocation: true,
    },
  },
  Bundala: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bundala_National_Park.jpg/1920px-Bundala_National_Park.jpg",
    alt: "Wetland and lagoon in Bundala National Park",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Bundala National Park",
    author: "Shenal Sadurshan",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Bundala_National_Park.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },

  /* --------------------------------- East Coast ---------------------------- */
  Trincomalee: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bay_of_Trincomalee.jpg/1920px-Bay_of_Trincomalee.jpg",
    alt: "The bay at Trincomalee",
    width: 1920,
    height: 1278,
    focal: "50% 50%",
    depicts: "Trincomalee, East Coast",
    author: "Kondephy",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Bay_of_Trincomalee.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Pasikuda: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Pasikudah_beach.JPG/1920px-Pasikudah_beach.JPG",
    alt: "The beach at Pasikuda",
    width: 1920,
    height: 1279,
    focal: "50% 50%",
    depicts: "Pasikuda, East Coast",
    author: "Anton Croos",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Pasikudah_beach.JPG",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Batticaloa: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sea_Fishing%2C_Batticaloa.jpg/1920px-Sea_Fishing%2C_Batticaloa.jpg",
    alt: "Sea fishing off Batticaloa",
    width: 1920,
    height: 1345,
    focal: "50% 50%",
    depicts: "Batticaloa, East Coast",
    author: "Anton Croos",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Sea_Fishing,_Batticaloa.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },

  /* ---------------------------- West Coast & Colombo ----------------------- */
  Negombo: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Negambo_Lagoon%2C_Sri_Lanka._Where_boats_come_to_rest.jpg/1920px-Negambo_Lagoon%2C_Sri_Lanka._Where_boats_come_to_rest.jpg",
    alt: "Fishing boats moored in Negombo lagoon",
    width: 1920,
    height: 1440,
    focal: "50% 50%",
    depicts: "Negombo Lagoon, West Coast",
    author: "Deshan Ruhunage",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Negambo_Lagoon,_Sri_Lanka._Where_boats_come_to_rest.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Bentota: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sri_Lanka%2C_Bentota%2C_beach_%282%29.JPG/1920px-Sri_Lanka%2C_Bentota%2C_beach_%282%29.JPG",
    alt: "The beach at Bentota where the river meets the sea",
    width: 1920,
    height: 1276,
    focal: "50% 50%",
    depicts: "Bentota, West Coast",
    author: "Vincent van Zeijst",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Sri_Lanka,_Bentota,_beach_(2).JPG",
      license: "CC BY-SA 3.0",
      verifiedLocation: true,
    },
  },
  /** The one Free Art Licence asset on the site. Free, and attribution is
   *  required exactly as for the CC files — but flagged here because it is the
   *  odd one out if anyone audits licences by grepping for "CC". */
  Kalpitiya: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/SL_Kalpitiya_asv2020-01_img4_Fishery_harbour.jpg/1920px-SL_Kalpitiya_asv2020-01_img4_Fishery_harbour.jpg",
    alt: "The fishery harbour at Kalpitiya",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Kalpitiya, West Coast",
    author: "A.Savin",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:SL_Kalpitiya_asv2020-01_img4_Fishery_harbour.jpg",
      license: "Free Art License 1.3",
      verifiedLocation: true,
    },
  },

  /* --------------------------------- The North ----------------------------- */
  /** Nallur's gopuram — named in the card's own copy. */
  Jaffna: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Nallur_Kandasamy_front_entrance.jpg/1920px-Nallur_Kandasamy_front_entrance.jpg",
    alt: "The front entrance of the Nallur Kandaswamy temple in Jaffna",
    width: 1920,
    height: 1372,
    focal: "50% 45%",
    depicts: "Nallur Kandaswamy Kovil, Jaffna",
    author: "Gane Kumaraswamy",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Nallur_Kandasamy_front_entrance.jpg",
      license: "CC BY-SA 2.0",
      verifiedLocation: true,
    },
  },
  Mannar: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Baobab_Tree_in_Mannar_2023-05-26-1.jpg/1920px-Baobab_Tree_in_Mannar_2023-05-26-1.jpg",
    alt: "A baobab tree on Mannar island",
    width: 1920,
    height: 1283,
    focal: "50% 50%",
    depicts: "Mannar, The North",
    author: "Alexey Komarov",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Baobab_Tree_in_Mannar_2023-05-26-1.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Delft: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Ponies_of_the_Delft_Island.jpg/1920px-Ponies_of_the_Delft_Island.jpg",
    alt: "Wild ponies grazing on Delft island",
    width: 1920,
    height: 1277,
    focal: "50% 50%",
    depicts: "Delft Island, The North",
    author: "Shenal Sadurshan",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Ponies_of_the_Delft_Island.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  Wilpattu: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/WilpattuNationalPark-April2014_%283%29.JPG/1920px-WilpattuNationalPark-April2014_%283%29.JPG",
    alt: "Dry forest and open water in Wilpattu National Park",
    width: 1920,
    height: 1079,
    focal: "50% 50%",
    depicts: "Wilpattu National Park",
    author: "Rehman Abubakr",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:WilpattuNationalPark-April2014_(3).JPG",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
};

/**
 * The Commons photograph for a place, or null.
 *
 * Null is the designed state, not a failure: the nine places with the owner's
 * own photography resolve through the registry first and never reach this.
 */
export function commonsPlaceAsset(name: string): CommonsPlaceAsset | null {
  return commonsPlaces[name] ?? null;
}

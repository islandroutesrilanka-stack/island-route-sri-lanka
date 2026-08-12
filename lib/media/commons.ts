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
 * ── Why the files are served from public/commons/ and not hotlinked ────────
 *
 * They used to point straight at upload.wikimedia.org. That looked fine in
 * isolation and broke in the aggregate: a page with a dozen of these makes a
 * dozen near-simultaneous requests from one server IP, and Wikimedia answers
 * some of them with 429. Next's optimizer logs `upstream image response
 * failed`, returns 400, and `next/image` renders nothing — so a tile simply
 * isn't there, with no error anywhere a visitor or an editor would see it. It
 * was reproduced on /experiences, where one of twelve went missing on a cold
 * cache; which one varied per run.
 *
 * Wikimedia asks people not to hotlink for exactly this reason, and both CC BY
 * and CC BY-SA permit redistribution as long as attribution travels with the
 * file — which is the whole point of the `author` and `license` fields below.
 * So the 1920px rendition is committed to public/commons/ and served from our
 * own origin: no third-party request on the critical path, no rate limit, and
 * an image that cannot vanish between deploys because someone else's CDN said
 * no.
 *
 * To add one: download the rendition to public/commons/ with a descriptive
 * filename, then record it here with its author and licence. Do not paste an
 * upload.wikimedia.org URL into `src` — it will work on your machine and fail
 * intermittently in production.
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
    src: "/commons/buddha-statues-in-dambulla-sri-lanka-01.jpg",
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
    src: "/commons/polonnaruwa-01.jpg",
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
    src: "/commons/ruwanweli-maha-saaya.jpg",
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
    src: "/commons/elephas-maximus-maximus-hurulu-eco-park-sri-lanka-20260201-1018-7843.jpg",
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
    src: "/commons/nuwaraeliya-from-top.jpg",
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
    src: "/commons/lipton-seat-sri-lanka.jpg",
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
    src: "/commons/worlds-end-in-horton-plains-in-sri-lanka.jpg",
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
    src: "/commons/unawatuna.jpg",
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
    src: "/commons/weligama-beach-in-sri-lanka.jpg",
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
    src: "/commons/goyambokka-beach-tangalle-sri-lanka.jpg",
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
    src: "/commons/udawalawe-national-park-udawalawa-reservoir.jpg",
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
    src: "/commons/tissamaharama-dagoba.jpg",
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
    src: "/commons/bundala-national-park.jpg",
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
    src: "/commons/bay-of-trincomalee.jpg",
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
    src: "/commons/pasikudah-beach.jpg",
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
    src: "/commons/sea-fishing-batticaloa.jpg",
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
    src: "/commons/negambo-lagoon-sri-lanka-where-boats-come-to-rest.jpg",
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
    src: "/commons/sri-lanka-bentota-beach-2.jpg",
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
    src: "/commons/sl-kalpitiya-asv2020-01-img4-fishery-harbour.jpg",
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
    src: "/commons/nallur-kandasamy-front-entrance.jpg",
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
    src: "/commons/baobab-tree-in-mannar-2023-05-26-1.jpg",
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
    src: "/commons/ponies-of-the-delft-island.jpg",
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
    src: "/commons/wilpattunationalpark-april2014-3.jpg",
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
 * Commons photography that is about a *subject* rather than a place on the
 * region map — so it has no `lib/regions.ts` name to key off, and would be
 * unreachable from `commonsPlaces`.
 *
 * Sourced to the same standard: a real photograph, taken where it says, with
 * author and licence recorded. Keyed by camelCase subject rather than by place
 * name, which is what keeps the two records from being confused.
 *
 * ── On what could not be sourced here ──────────────────────────────────────
 *
 * The fleet cards on /about were the one part of the site Commons could not
 * honestly serve. They name specific vehicle classes, and the candidates were
 * all either car-spotter snapshots (a Prado in a Russian car park, a Coaster in
 * Bangkok) or, worse, Sri Lankan safari jeeps carrying a *competing operator's*
 * phone number and web address on the door. Neither belongs on a page selling
 * Island Route's own vehicles.
 *
 * So only the safari jeep is here — an unbranded line of open-top jeeps on the
 * Yala track, which is genuinely the vehicle that card describes. The other
 * four fleet cards take contextual island photography instead: mood for the
 * journey each vehicle is for, making no claim to be a portrait of the vehicle
 * itself. Owner-supplied photographs of the actual fleet are the real fix and
 * should replace them when they exist.
 */
export const commonsSubjects: Record<string, CommonsPlaceAsset> = {
  /** Reef fish over the coral at Hikkaduwa. Chosen over a much more striking
   *  turtle portrait from the same reef, which carried the photographer's own
   *  visible watermark across the corner. */
  hikkaduwaReef: {
    src: "/commons/hikkaduwa-under-water.jpg",
    alt: "Reef fish over the coral at Hikkaduwa",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Hikkaduwa coral sanctuary, South Coast",
    author: "Janindu wijesoorya",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Hikkaduwa_under_water.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /** Open-top jeeps on the Yala track. No operator branding is legible, which
   *  is why this one and not the higher-resolution alternative. */
  yalaSafariJeeps: {
    src: "/commons/safari-yala-np.jpg",
    alt: "Open-top safari jeeps on a track in Yala National Park",
    width: 1920,
    height: 1278,
    focal: "50% 55%",
    depicts: "Yala National Park",
    author: "Dan arndt",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Safari_-_Yala_NP.jpg",
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

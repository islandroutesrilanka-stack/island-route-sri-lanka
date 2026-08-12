import type { MediaAsset } from "./types";
import { media } from "./registry";
import { commonsPlaces, type CommonsPlaceAsset } from "./commons";

/**
 * Photography for the twelve experience categories.
 *
 * ── Why this file exists ───────────────────────────────────────────────────
 *
 * /experiences shipped with no photographs at all: `ExperienceCard` rendered a
 * `GradientPanel` for every tile, and its header comment said so ("Deliberately
 * no photography… Each tile takes an image later with no change to its
 * callers"). This is that later. Nothing about the card's contract changed —
 * it now asks this module for an asset and passes it to `<Img>`.
 *
 * ── Where the images come from, and why not from a stock library ───────────
 *
 * Three sources, in descending order of how much is already known about them:
 *
 *   1. `lib/media/registry.ts` — the owner's own photography and the handful of
 *      stock assets whose location has actually been checked. Six categories
 *      resolve here, so six of these images are already on the site elsewhere
 *      and cost nothing new.
 *   2. `lib/media/commons.ts` — the region explorer's Commons set. Three
 *      categories are best illustrated by a place that file already carries
 *      (Horton Plains for Nature, Lipton's Seat for Tea Country, Negombo's
 *      fishing boats for Local Life), so they are re-used by reference rather
 *      than re-sourced.
 *   3. Three new Commons files, below, for the categories nothing existing
 *      covered: Food, Wellness and Adventure.
 *
 * The rule the registry's header sets out still holds and was not bent here:
 * `verifiedLocation: true` means someone opened the file's Commons page and
 * confirmed the photograph shows what it claims to. Every entry below passed
 * that, and `ExperienceCard` keeps `requireVerifiedLocation` on — so if one of
 * these is ever swapped for something unchecked, the tile returns to the
 * gradient instead of quietly showing the wrong country.
 *
 * ── Licensing is an obligation, not a footnote ─────────────────────────────
 *
 * The Commons entries are CC BY / CC BY-SA / CC BY 3.0 — all of which require
 * the photographer to be named and the licence stated. `author` and
 * `provenance.license` carry that, `experienceCredits()` collects it, and the
 * index renders it. Do not add a Commons entry without both fields filled in
 * from the file's own metadata.
 */

/**
 * The three files sourced specifically for this page.
 *
 * Typed as `CommonsPlaceAsset` deliberately: that type makes `author` and a
 * stock-narrowed `provenance` mandatory, so an entry that forgets its
 * attribution is a type error rather than a licence breach.
 *
 * `src` points at public/commons/, not at upload.wikimedia.org. Hotlinking a
 * dozen Commons files from one page earns a 429 on some of them, and a 429
 * through Next's optimizer renders as an absent tile rather than an error —
 * see the note in lib/media/commons.ts. `provenance.url` still points at the
 * Commons file page, because that is where the licence lives.
 */
const commonsExperiences: Record<string, CommonsPlaceAsset> = {
  food: {
    src: "/commons/sri-lankan-chicken-curry.jpg",
    alt: "A Sri Lankan rice and curry spread, with chicken curry and several accompaniments",
    width: 1920,
    height: 1078,
    focal: "50% 50%",
    depicts: "Sri Lankan rice and curry",
    author: "Swarnamala Priyadarshani",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Sri_lankan_chicken_curry.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /**
   * An actual Ayurveda house at Aluthgama, on the Bentota river — laterite
   * walls, tiled roof, mango trees, a path worn through the grass. Chosen over
   * the glossy spa photography a stock search returns because the category's
   * own copy promises "Ayurveda with a lineage behind it", and this is what
   * that looks like. No signage, no branding and nobody identifiable in frame,
   * so it illustrates the practice rather than advertising one establishment.
   */
  wellness: {
    src: "/commons/aluthgama-sahana-ayurveda-panoramio.jpg",
    alt: "A laterite-walled Ayurveda treatment house under mango trees at Aluthgama",
    width: 1920,
    height: 1280,
    focal: "50% 55%",
    depicts: "Aluthgama, West Coast",
    author: "Banja-Frans Mulder",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Aluthgama,_Sahana_Ayurveda_-_panoramio.jpg",
      license: "CC BY 3.0",
      verifiedLocation: true,
    },
  },
  adventure: {
    src: "/commons/hike-to-little-adam-s-peak-ella-rock.jpg",
    alt: "Ella Rock and the valley below, seen from the trail up Little Adam's Peak",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Little Adam's Peak, Ella",
    author: "Ankur Panchbudhe",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Hike_to_Little_Adam%27s_Peak_-_Ella_Rock.jpg",
      license: "CC BY 2.0",
      verifiedLocation: true,
    },
  },
};

/**
 * Category slug → photograph. Keyed by `ExperienceCategory.slug`, so a renamed
 * category shows up as a gradient tile rather than as a crash, and the key is
 * greppable across `lib/experiences.ts` and this file.
 *
 * Each choice is the most literal reading of the category's own blurb — the
 * leopard for "the patience that finds a leopard", the point break for "there
 * is always a shore that's working", the train bridge for "fewer places,
 * longer stays". Where the blurb names a thing, the photograph shows it.
 */
export const experienceMedia: Record<string, MediaAsset> = {
  wildlife: media.yalaLeopard,
  "surf-ocean": media.whiskyPoint,
  beaches: media.arugamBayEvening,
  "culture-heritage": media.sigiriyaRock,
  food: commonsExperiences.food,
  wellness: commonsExperiences.wellness,
  adventure: commonsExperiences.adventure,
  nature: commonsPlaces["Horton Plains"],
  "tea-country": commonsPlaces.Haputale,
  "local-life": commonsPlaces.Negombo,
  "slow-travel": media.nineArchBridge,
  luxury: media.galleFortStreet,
};

/**
 * The photograph for a category, or null.
 *
 * Null is a designed state, not a failure — `<Img>` renders the gradient
 * treatment for it, which is exactly what every tile looked like before.
 */
export function experienceAsset(slug: string): MediaAsset | null {
  return experienceMedia[slug] ?? null;
}

export type ExperienceCredit = {
  src: string;
  label: string;
  author: string;
  url: string;
  license: string;
};

/**
 * Attribution rows for a set of categories, in the order given.
 *
 * Only the Commons assets appear: the registry's own photography is the
 * owner's and needs no credit line, and `"author" in asset` is what separates
 * the two without a second lookup table to keep in sync.
 */
export function experienceCredits(slugs: string[]): ExperienceCredit[] {
  const seen = new Set<string>();
  const out: ExperienceCredit[] = [];

  for (const slug of slugs) {
    const asset = experienceMedia[slug];
    if (!asset || !("author" in asset)) continue;
    const a = asset as CommonsPlaceAsset;
    if (seen.has(a.src)) continue;
    seen.add(a.src);
    out.push({
      src: a.src,
      label: a.depicts ?? a.alt,
      author: a.author,
      url: a.provenance.url,
      license: a.provenance.license,
    });
  }

  return out;
}

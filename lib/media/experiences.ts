import type { MediaAsset } from "./types";
import { media } from "./registry";
import {
  commonsPlaces,
  commonsSubjects,
  type CommonsPlaceAsset,
} from "./commons";

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
 * The Commons entries are CC BY-SA 4.0 and CC BY 2.0/3.0 — all of which
 * require the photographer to be named and the licence stated. `author` and
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
  /**
   * A whole plate, not a single dish.
   *
   * The first Food tile was a close crop of chicken curry in a white bowl. It
   * was accurately captioned and, with a scrim over it, it passed. With the
   * scrim gone it is a bowl of brown gravy. Rice and curry is a *spread* — the
   * thing worth photographing is the ring of small dishes around the rice, and
   * the colour that comes with it: beetroot, carrot, okra, raita.
   *
   * Near-square at source (2400x2448), which means the wide hero frame lands
   * *inside* the plate rather than around it: what you see is five or six of
   * the dishes at close range, not the whole spread. That is a detail crop by
   * arithmetic rather than by choice, and it happens to be the right one —
   * food is photographed close, and the card and gallery tiles, which are
   * nearer to square, still show the ring.
   */
  food: {
    src: "/commons/sri-lankan-rice-and-curry-plate.jpg",
    alt: "A Sri Lankan rice and curry plate: rice ringed by chicken curry, beetroot, potato, okra, raita, grated carrot and cucumber",
    width: 2400,
    height: 2448,
    focal: "50% 50%",
    depicts: "Sri Lankan rice and curry",
    author: "Netha Hussain",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Sri_Lankan_meal_in_restaurant_style.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /**
   * Lunuganga: Geoffrey Bawa's country estate at Bentota, and the reference
   * point for what "slow" looks like on this island — a frangipani laid out
   * over a mown lawn, the tiled roof of the bungalow behind it.
   *
   * It replaces an Ayurveda house at Aluthgama that had to go for a reason
   * nothing to do with taste: the file was 900x600 at source and this registry
   * declared it 1920x1280, so the hero was upscaling a small photograph across
   * the full height of the viewport. Anything that replaced it had to be big
   * first and right second. This one is 8064x4536 at source.
   *
   * No signage, no branding, nobody identifiable in frame — the same test the
   * Aluthgama file passed, kept for the same reason. It illustrates the idea
   * the category sells rather than advertising an establishment.
   */
  wellness: {
    src: "/commons/lunuganga-bentota-garden.jpg",
    alt: "A frangipani tree spread across the lawn at Lunuganga, with the tiled roof of Geoffrey Bawa's bungalow behind it",
    width: 1920,
    height: 1080,
    focal: "50% 50%",
    depicts: "Lunuganga, Bentota",
    author: "Eco2004",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Lunuganga_-_Bungalow_Back.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
  /**
   * Tents on the Narangala ridge at first light. The category promises "ridge
   * walks, river days and the parts of the island roads don't reach", and this
   * is two of those three in one frame.
   *
   * It replaces a hazy midday view of Ella Rock — a competent photograph of a
   * place, with nothing happening in it. The people here are small enough to
   * read as scale rather than as portraits, and the low sun does the work the
   * old frame's flat light could not.
   */
  adventure: {
    src: "/commons/narangala-ridge-camp.jpg",
    alt: "Tents pitched along the grass ridge at Narangala at sunrise, with hikers gathered on the summit beyond",
    width: 2400,
    height: 1600,
    focal: "50% 50%",
    depicts: "Narangala, Uva Highlands",
    author: "Ahamed rasheed",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Hikers_in_Narangala_Sri_Lanka.jpg",
      license: "CC BY-SA 4.0",
      verifiedLocation: true,
    },
  },
};

/**
 * Two dishes, for the Food gallery below.
 *
 * They are here rather than in `commonsExperiences` because they are not
 * category headers — nothing about them says "Sri Lanka" at hero scale, and a
 * dish photographed on a table is a detail shot by nature. In a mosaic tile
 * that is exactly what is wanted.
 *
 * Food is the only category the place registry could not fill honestly. Every
 * other gallery is built from photographs the site already owns or already
 * credits; a food gallery assembled out of coastline would have been a gallery
 * about somewhere else.
 */
const commonsDishes: Record<string, CommonsPlaceAsset> = {
  curdAndTreacle: {
    src: "/commons/curd-and-kithul-treacle.jpg",
    alt: "Kithul treacle poured over buffalo curd in a glass bowl, beside the clay pot it was set in",
    width: 1600,
    height: 1067,
    focal: "50% 50%",
    depicts: "Buffalo curd and kithul treacle",
    author: "Hafiz Issadeen, Dharga Town, Sri Lanka",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Curd_and_treacle.jpg",
      license: "CC BY 2.0",
      verifiedLocation: true,
    },
  },
  kottu: {
    src: "/commons/kottu-roti-ella.jpg",
    alt: "A steel platter of chicken kottu roti on a wooden table in Ella",
    width: 1600,
    height: 1200,
    focal: "50% 50%",
    depicts: "Kottu roti, Ella",
    author: "Adam Jones from Kelowna, BC, Canada",
    provenance: {
      kind: "stock",
      source: "Wikimedia Commons",
      url: "https://commons.wikimedia.org/wiki/File:Kothtu_Rotti_-_Down_Town_Rotti_House_-_Ella_-_Sri_Lanka_(14133300583).jpg",
      license: "CC BY-SA 2.0",
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

/**
 * Five photographs per category, for the mosaic on the detail page.
 *
 * ── Exactly five, and never the hero ──────────────────────────────────────
 *
 * The mosaic is one lead frame two columns wide and two rows tall, with four
 * tiles filling the rows beside it. Four or six would leave a hole in it, so
 * `ExperienceGallery` renders nothing below five and ignores anything past it.
 * None of these repeats the category's own hero, which is the one duplication
 * a visitor would actually notice, because both are on screen within a scroll
 * of each other.
 *
 * ── The first entry is the lead ───────────────────────────────────────────
 *
 * Position one is printed at four times the area of the others, so it is the
 * only slot where a soft file, a flat sky or a crowd shows. Every row here was
 * ordered by looking at the rendered band rather than by reading the list: the
 * Wildlife row led on a queue of safari jeeps, which is a photograph of the
 * thing a private trip is sold as an escape from, and Culture led on the one
 * genuinely low-resolution file in the set. Both moved.
 *
 * No photograph leads two galleries. Tiles repeat between categories freely —
 * Tangalle belongs in Beaches, in Wellness and in Slow travel, and no visitor
 * sees two of those pages at once — but a lead is the image a page is
 * remembered by, and two pages should not be remembered by the same one.
 *
 * Adding a category means adding a row here. A missing row is a missing band,
 * not a broken page.
 */
export const experienceGallery: Record<string, MediaAsset[]> = {
  wildlife: [
    media.lagoonElephant,
    commonsPlaces.Udawalawe,
    media.lagoonCrocodile,
    commonsPlaces.Wilpattu,
    media.lagoonHeronSunset,
  ],
  "surf-ocean": [
    media.arugamBay,
    media.surfRightHander,
    media.elephantRock,
    commonsPlaces.Weligama,
    commonsSubjects.hikkaduwaReef,
  ],
  beaches: [
    media.mirissaCoconutHill,
    commonsPlaces.Unawatuna,
    commonsPlaces.Tangalle,
    commonsPlaces.Pasikuda,
    media.elephantRockSandbar,
  ],
  "culture-heritage": [
    commonsPlaces.Anuradhapura,
    commonsPlaces.Dambulla,
    commonsPlaces.Polonnaruwa,
    media.kandyTempleMoat,
    commonsPlaces.Jaffna,
  ],
  /* Two dishes and the two harbours the fish on them came from, then the one
     street on the site that looks like somewhere you would stop and eat. */
  food: [
    commonsDishes.curdAndTreacle,
    commonsDishes.kottu,
    commonsPlaces.Negombo,
    commonsPlaces.Kalpitiya,
    media.galleFortStreet,
  ],
  wellness: [
    commonsPlaces.Tangalle,
    commonsPlaces.Bentota,
    commonsPlaces["Horton Plains"],
    media.lagoonHeronSunset,
    commonsPlaces.Haputale,
  ],
  adventure: [
    media.pottuvilPaddleboards,
    commonsPlaces["Horton Plains"],
    media.lagoonMangroveBoat,
    commonsSubjects.hikkaduwaReef,
    media.elephantRock,
  ],
  nature: [
    commonsPlaces.Wilpattu,
    commonsPlaces.Bundala,
    media.pottuvilLagoon,
    media.lagoonHeronSunset,
    commonsPlaces.Mannar,
  ],
  "tea-country": [
    media.nineArchBridge,
    media.highlandTrainDoor,
    commonsPlaces["Nuwara Eliya"],
    commonsPlaces["Horton Plains"],
    media.kandyTempleMoat,
  ],
  "local-life": [
    commonsPlaces.Batticaloa,
    commonsPlaces.Kalpitiya,
    commonsPlaces.Delft,
    media.colomboLotusTower,
    commonsPlaces.Jaffna,
  ],
  "slow-travel": [
    media.highlandTrainDoor,
    commonsPlaces.Tangalle,
    commonsPlaces.Delft,
    commonsPlaces.Mannar,
    media.lagoonMangroveBoat,
  ],
  luxury: [
    media.elephantRockSandbar,
    media.mirissaCoconutHill,
    commonsPlaces.Pasikuda,
    commonsPlaces.Bentota,
    media.arugamBay,
  ],
};

/**
 * The mosaic set for a category, or an empty list — which renders no band.
 *
 * The filter is not defensive habit. `Record<string, T>` index access is
 * unchecked under this tsconfig, so `commonsPlaces.hikkaduwaReef` — a real
 * asset, in the wrong one of the two Commons records — typechecks cleanly and
 * arrives here as `undefined`. It cost three prerendered pages before this
 * line existed. A mis-keyed row now costs its own band and nothing else.
 */
export function experienceGalleryAssets(slug: string): MediaAsset[] {
  return (experienceGallery[slug] ?? []).filter(Boolean);
}

export type ExperienceCredit = {
  src: string;
  label: string;
  author: string;
  url: string;
  license: string;
};

/**
 * Attribution rows for a list of assets, in the order given and de-duplicated.
 *
 * Only the Commons assets appear: the registry's own photography is the
 * owner's and needs no credit line, and `"author" in asset` is what separates
 * the two without a second lookup table to keep in sync.
 *
 * Takes assets rather than slugs because the galleries are not keyed by
 * category — a band mixes owner photography, place files and dish files, and
 * every one of them has to be credited by the same rule.
 */
export function assetCredits(
  assets: (MediaAsset | null | undefined)[],
): ExperienceCredit[] {
  const seen = new Set<string>();
  const out: ExperienceCredit[] = [];

  for (const asset of assets) {
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

/** Attribution rows for a set of categories' header photographs. */
export function experienceCredits(slugs: string[]): ExperienceCredit[] {
  return assetCredits(slugs.map((slug) => experienceMedia[slug]));
}

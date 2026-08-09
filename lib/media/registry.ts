/**
 * The typed media registry.
 *
 * Every asset the site uses is declared here with its source, licence and — for
 * anything making a place claim — whether a human has confirmed it shows that
 * place. Git is deliberately the home for this rather than a database: these are
 * temporary stock assets with provenance to track, and git gives history, diffs
 * and code review on every change. A `media` table arrives in a later phase, at
 * which point these rows migrate into it and component props do not change.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * VERIFICATION STATUS: 0 of 9 location-specific assets verified.
 *
 * Every `verifiedLocation` below is `false` and must stay false until a human
 * opens the source page and confirms the image. Candidates and the sign-off
 * sheet live in MEDIA-ASSETS.md.
 *
 * Assets with verifiedLocation:false still render fine as atmospheric
 * background. They are refused only where a specific place is being claimed —
 * see isLocationVerified() in ./types.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { MediaAsset, MediaProvenance } from "./types";
import { isPlaceholder, isLocationVerified } from "./types";

/** Consistent Unsplash transform params. */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * Unsplash stock, location UNVERIFIED.
 * This is the honest default for every inherited asset: we know where it came
 * from, we have not confirmed what it shows.
 */
const unsplash = (id: string): MediaProvenance => ({
  kind: "stock",
  source: "Unsplash",
  url: `https://unsplash.com/ (asset id ${id})`,
  license: "Unsplash License",
  verifiedLocation: false,
});

/* ------------------------------- The registry ------------------------------- */

export const media = {
  /* — Signature ————————————————————————————————————————————————— */
  heroTrain: {
    src: u("photo-1552465011-b4e21bf6e79a", 2200),
    alt: "A train travelling through hill country",
    depicts: "Highland railway, Sri Lanka (UNVERIFIED)",
    focal: "50% 50%",
    provenance: unsplash("photo-1552465011-b4e21bf6e79a"),
  },
  sigiriya: {
    src: u("photo-1546708973-b339540b5162"),
    alt: "A rock fortress rising above forest",
    depicts: "Sigiriya, Cultural Triangle (UNVERIFIED — may be Pidurangala)",
    provenance: unsplash("photo-1546708973-b339540b5162"),
  },
  templeKandy: {
    src: u("photo-1602216056096-3b40cc0c9944"),
    alt: "A Buddhist temple",
    depicts: "Temple of the Sacred Tooth Relic, Kandy (UNVERIFIED)",
    provenance: unsplash("photo-1602216056096-3b40cc0c9944"),
  },

  /* — Coast & surf ————————————————————————————————————————————— */
  beachPanorama: {
    src: u("photo-1507525428034-b723cf961d3e", 2000),
    alt: "A wide tropical shoreline",
    provenance: unsplash("photo-1507525428034-b723cf961d3e"),
  },
  beachPalms: {
    src: u("photo-1506929562872-bb421503ef21"),
    alt: "Palm trees along a shoreline",
    provenance: unsplash("photo-1506929562872-bb421503ef21"),
  },
  beachAerial: {
    src: u("photo-1505142468610-359e7d316be0"),
    alt: "A coastline seen from above",
    provenance: unsplash("photo-1505142468610-359e7d316be0"),
  },
  beachChairs: {
    src: u("photo-1519046904884-53103b34b206"),
    alt: "Chairs on a quiet beach",
    provenance: unsplash("photo-1519046904884-53103b34b206"),
  },
  beachSunset: {
    src: u("photo-1468413253725-0d5181091126"),
    alt: "A shoreline at sunset",
    provenance: unsplash("photo-1468413253725-0d5181091126"),
  },
  surfWave: {
    src: u("photo-1502680390469-be75c86b636f"),
    alt: "A breaking wave",
    depicts: "Surf break (UNVERIFIED — not confirmed as Arugam Bay)",
    provenance: unsplash("photo-1502680390469-be75c86b636f"),
  },
  seaTurtle: {
    src: u("photo-1544551763-46a013bb70d5"),
    alt: "A sea turtle underwater",
    provenance: unsplash("photo-1544551763-46a013bb70d5"),
  },

  /* — Hills ————————————————————————————————————————————————————— */
  mistyHills: {
    src: u("photo-1470071459604-3b5ec3a7fe05"),
    alt: "Mist over forested hills",
    depicts: "Hill country (UNVERIFIED)",
    provenance: unsplash("photo-1470071459604-3b5ec3a7fe05"),
  },
  sunraysValley: {
    src: u("photo-1469474968028-56623f02e42e"),
    alt: "Sunlight falling across a valley",
    provenance: unsplash("photo-1469474968028-56623f02e42e"),
  },

  /* — Wildlife ————————————————————————————————————————————————— */
  elephants: {
    src: u("photo-1547471080-7cc2caa01a7e"),
    alt: "Elephants in the wild",
    depicts: "Elephants (UNVERIFIED — species and country unconfirmed)",
    provenance: unsplash("photo-1547471080-7cc2caa01a7e"),
  },
  elephantHerd: {
    src: u("photo-1557050543-4d5f4e07ef46"),
    alt: "A herd of elephants",
    depicts: "Elephant herd (UNVERIFIED — species and country unconfirmed)",
    provenance: unsplash("photo-1557050543-4d5f4e07ef46"),
  },
  leopard: {
    src: u("photo-1456926631375-92c8ce872def"),
    alt: "A leopard",
    depicts: "Leopard (UNVERIFIED — likely not Panthera pardus kotiya)",
    provenance: unsplash("photo-1456926631375-92c8ce872def"),
  },
  safariJeep: {
    src: u("photo-1516426122078-c23e76319801"),
    alt: "A safari vehicle on a track",
    provenance: unsplash("photo-1516426122078-c23e76319801"),
  },

  /* — Journeys & fleet ————————————————————————————————————————— */
  coastalDrive: {
    src: u("photo-1533473359331-0135ef1b58bf"),
    alt: "A road following a coastline",
    provenance: unsplash("photo-1533473359331-0135ef1b58bf"),
  },
  drivingWheel: {
    src: u("photo-1449965408869-eaa3f722e40d"),
    alt: "A driver at the wheel",
    provenance: unsplash("photo-1449965408869-eaa3f722e40d"),
  },
} satisfies Record<string, MediaAsset>;

export type MediaKey = keyof typeof media;

/* ---------------------------- Retired assets ------------------------------- */
/**
 * Deliberately absent from the registry above, per the approved plan:
 *
 *   cityLights · sedanNight · forest · greenMountains · mountainLake · lakeCanoe
 *
 * All were generic, non-Sri-Lankan stock. Slots that used them now take a
 * non-photographic treatment (GradientPanel) rather than filler photography.
 * They remain in the legacy map below only so the 19 existing importers of
 * lib/images.ts keep compiling until each page is migrated.
 */

/* ------------------------- Production placeholder guard --------------------- */
/**
 * A development placeholder must never reach a visitor. Rather than trusting
 * anyone to remember, this fails the production build at module load.
 */
const placeholders = Object.entries(media).filter(([, a]) =>
  isPlaceholder(a as MediaAsset)
);

if (process.env.NODE_ENV === "production" && placeholders.length > 0) {
  throw new Error(
    `[media] ${placeholders.length} placeholder asset(s) present in a production build: ` +
      `${placeholders.map(([k]) => k).join(", ")}. ` +
      `Replace them with verified assets, or remove them before shipping.`
  );
}

/* ------------------------------ Legacy bridge ------------------------------- */
/**
 * Flat URL map preserving the exact shape of the old `img` export, including
 * the six retired keys, so all 19 existing importers keep working untouched
 * while pages migrate to the typed registry one phase at a time.
 *
 * @deprecated Import `media` and pass MediaAsset objects instead.
 */
export const legacyImg = {
  heroTrain: media.heroTrain.src,
  sigiriya: media.sigiriya.src,
  templeKandy: media.templeKandy.src,
  beachPanorama: media.beachPanorama.src,
  beachPalms: media.beachPalms.src,
  beachAerial: media.beachAerial.src,
  beachChairs: media.beachChairs.src,
  beachSunset: media.beachSunset.src,
  surfWave: media.surfWave.src,
  seaTurtle: media.seaTurtle.src,
  mistyHills: media.mistyHills.src,
  sunraysValley: media.sunraysValley.src,
  elephants: media.elephants.src,
  elephantHerd: media.elephantHerd.src,
  leopard: media.leopard.src,
  safariJeep: media.safariJeep.src,
  coastalDrive: media.coastalDrive.src,
  drivingWheel: media.drivingWheel.src,

  // Retired — kept only for legacy call sites. Not in the typed registry.
  greenMountains: u("photo-1464822759023-fed622ff2c3b"),
  forest: u("photo-1441974231531-c6227db76b6e"),
  lakeCanoe: u("photo-1476514525535-07fb3b4ae5f1"),
  mountainLake: u("photo-1501785888041-af3ef285b470"),
  sedanNight: u("photo-1549317661-bd32c8ce0db2"),
  cityLights: u("photo-1449824913935-59a10b8d2000"),
};

/**
 * Neutral branded social card — 1200×630, wordmark over an abstract contour
 * field. Deliberately depicts no place and contains no photography, so it can
 * stand in for any page without implying anything about a destination.
 */
export const OG_FALLBACK = "/og-default.png";

/** Crops to the 1200×630 ratio social platforms expect. */
export function toOgImage(src: string): string {
  // Previously fell back to the hero train photo, which meant a destination
  // with no image shared a picture of a train captioned with its own name.
  // An empty source now resolves to the neutral brand card instead.
  if (!src) return OG_FALLBACK;
  if (!src.includes("images.unsplash.com")) return src;
  const [base] = src.split("?");
  return `${base}?auto=format&fit=crop&w=1200&h=630&q=80`;
}

/**
 * The social image for a page that names a specific place.
 *
 * Metadata is generated outside the render tree, so it never passed through
 * <Img> and the verification guard did not apply to it — a page could refuse to
 * *display* an unverified photograph while still *sharing* it. This closes that
 * path using the same `isLocationVerified` predicate, so there is still exactly
 * one definition of "verified" in the codebase.
 */
export function toVerifiedOgImage(asset: MediaAsset | null | undefined): string {
  return isLocationVerified(asset) && asset ? toOgImage(asset.src) : OG_FALLBACK;
}

/** Default social sharing image for the whole site. */
export const ogDefault = toOgImage(legacyImg.heroTrain);

/**
 * A destination's image as a MediaAsset.
 *
 * Destination images arrive as bare URL strings — from the seed content or from
 * Supabase — and are rendered beside a place name, which makes them location
 * claims. This wraps them so they carry `depicts` and, crucially, an honest
 * `verifiedLocation: false` until a human confirms otherwise. Consumers gate on
 * it via <Img requireVerifiedLocation>.
 *
 * Deliberately thin: it delegates to fromCmsUrl rather than restating the
 * provenance rules, so there is exactly one place where an asset can be
 * declared verified.
 */
export function destinationAsset(d: {
  name: string;
  region?: string;
  image: string;
}): MediaAsset | null {
  return fromCmsUrl(d.image, d.name, {
    depicts: d.region ? `${d.name}, ${d.region}` : d.name,
  });
}

/** Build a MediaAsset from a bare CMS URL, so components stay contract-pure. */
export function fromCmsUrl(
  src: string,
  alt: string,
  opts: { depicts?: string; verifiedLocation?: boolean; focal?: MediaAsset["focal"] } = {}
): MediaAsset | null {
  if (!src) return null;
  return {
    src,
    alt,
    focal: opts.focal,
    depicts: opts.depicts,
    provenance: { kind: "cms", verifiedLocation: opts.verifiedLocation ?? false },
  };
}

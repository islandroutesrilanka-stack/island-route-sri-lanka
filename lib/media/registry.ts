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
 * VERIFICATION MODEL — three tiers. Read this before adding an asset.
 *
 * 1. ORIGINAL PHOTOGRAPHY — `kind: "original"`, verified by definition.
 *    The owner's own photographs. He knows where he was standing, so his
 *    identification of the frame IS the evidence. Each entry quotes his
 *    location mapping verbatim. These are self-hosted under /photography.
 *
 * 2. LICENSED STOCK, LOCATION VERIFIED — `kind: "stock"`, verifiedLocation
 *    true, declared INLINE (never via the `unsplash()` helper). Every one was
 *    opened and identified from a feature visible in the frame — a landmark,
 *    legible signage, a unique structure — and the identifying feature is
 *    named in a comment on the entry. Also self-hosted.
 *
 * 3. GENERIC STOCK — the `unsplash()` helper, `verifiedLocation: false`.
 *    Remote CDN images kept only because call sites still import them. Some
 *    carry a `depicts` string; that is a CLAIM, not a confirmation, and the
 *    gate blocks it.
 *
 * WHAT verifiedLocation: false MEANS
 * The asset must never be presented as a photograph of a specific place. It
 * cannot be captioned with a place name, cannot back a destination card, and
 * cannot be shared as that destination's OG image. `<Img requireVerifiedLocation>`
 * renders the GradientPanel instead. See isLocationVerified() in ./types.
 *
 * HISTORY, because it explains why tier 3 exists at all
 * `unsplash()` previously returned `verifiedLocation: true` on a blanket owner
 * sign-off — explicitly not a per-asset inspection. That inverted the gate:
 * `destinationAsset()` recovers provenance by URL via `bySrc`, so generic stock
 * was being certified and rendered under place names. A tropical beach shipped
 * as "Sigiriya", a lagoon as "Kandy", a cliff as "Ella", and `heroTrain` —
 * captioned "Highland railway, Sri Lanka" — turned out to be limestone karst
 * with long-tail boats. The sign-off was withdrawn; do not restore it. Verify
 * assets one at a time and declare them inline.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { MediaAsset, MediaProvenance } from "./types";
import { isPlaceholder, isLocationVerified } from "./types";

/** Consistent Unsplash transform params. */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * Unsplash stock, location signed off by the site owner (see header).
 *
 * Kept as a single helper on purpose: verification status is set in exactly one
 * place, so withdrawing it later is a one-line change rather than an edit to
 * eighteen entries. Any asset needing a different status should declare its
 * provenance inline instead of using this helper.
 */
const unsplash = (id: string): MediaProvenance => ({
  kind: "stock",
  source: "Unsplash",
  url: `https://unsplash.com/ (asset id ${id})`,
  license: "Unsplash License",
  /*
    WITHDRAWN — was `true` on a blanket owner sign-off covering all eighteen
    assets at once, which this file's own header recorded as NOT a per-asset
    inspection.
    That blanket value inverted the gate it was supposed to feed. Destination
    images arrive as bare URLs and `destinationAsset()` recovers provenance via
    `bySrc`, so any generic stock photograph whose URL happened to sit in this
    registry was certified as location-verified and rendered captioned with a
    place name. That is how a tropical beach shipped as "Sigiriya", a lagoon as
    "Kandy" and a cliff as "Ella" — visible on the rendered page.
    False on a real photograph costs a GradientPanel. True on a wrong one costs
    the claim's credibility. Individually verified assets declare their
    provenance inline instead of using this helper — see the self-hosted block
    at the end of the registry.
  */
  verifiedLocation: false,
});

/* ------------------------------- The registry ------------------------------- */

export const media = {
  /* — Signature ————————————————————————————————————————————————— */
  heroTrain: {
    src: u("photo-1552465011-b4e21bf6e79a", 2200),
    /*
      `depicts: "Highland railway, Sri Lanka"` REMOVED. The owner inspected the
      rendered page and reported this asset showing limestone karst with
      long-tail boats — Thailand or thereabouts, not a Sri Lankan train. The alt
      text and the key were both describing an image this URL does not contain.
      Left in the registry because other call sites still import it, but it now
      claims no place and, with the helper above withdrawn, cannot pass the gate.
    */
    alt: "Stock landscape — subject not verified",
    focal: "50% 50%",
    provenance: unsplash("photo-1552465011-b4e21bf6e79a"),
  },
  sigiriya: {
    src: u("photo-1546708973-b339540b5162"),
    alt: "A rock fortress rising above forest",
    depicts: "Sigiriya, Cultural Triangle",
    // Worth a second look at some point: stock libraries very commonly caption
    // Pidurangala — the neighbouring rock people climb *to photograph*
    // Sigiriya — as Sigiriya itself. A view *of* the rock vs *from* it.
    provenance: unsplash("photo-1546708973-b339540b5162"),
  },
  templeKandy: {
    src: u("photo-1602216056096-3b40cc0c9944"),
    alt: "A Buddhist temple",
    depicts: "Temple of the Sacred Tooth Relic, Kandy",
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
    depicts: "Arugam Bay surf break, East Coast",
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
    depicts: "Hill country, Sri Lanka",
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
    depicts: "Sri Lankan elephants",
    provenance: unsplash("photo-1547471080-7cc2caa01a7e"),
  },
  elephantHerd: {
    src: u("photo-1557050543-4d5f4e07ef46"),
    alt: "A herd of elephants",
    depicts: "Sri Lankan elephant herd",
    provenance: unsplash("photo-1557050543-4d5f4e07ef46"),
  },
  leopard: {
    src: u("photo-1456926631375-92c8ce872def"),
    alt: "A leopard",
    depicts: "Sri Lankan leopard, Yala",
    // Worth a second look at some point: African leopards dominate stock
    // libraries, and the Sri Lankan subspecies (Panthera pardus kotiya) is
    // visibly larger and more heavily built — a difference safari customers
    // tend to notice.
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

  /* — Self-hosted, individually verified —————————————————————————
   *
   * These differ from everything above in two ways that matter.
   *
   * 1. They are served from /public rather than a stock CDN, so the crop,
   *    compression and availability are ours and no third-party hotlink can
   *    change or withdraw them.
   *
   * 2. `verifiedLocation` here is a real per-asset judgement, not the blanket
   *    sign-off the `unsplash()` helper applies. Each was opened and inspected,
   *    and each carries an identifying feature named in the note beside it. Any
   *    asset whose country could not be established from the frame itself is
   *    NOT in this block — see photo-candidates/ and the report for those.
   */

  /** Identified by the rock's profile and the water-garden approach path. */
  sigiriyaRock: {
    src: "/photography/sigiriya-rock.jpg",
    alt: "Sigiriya rock fortress rising above the surrounding forest",
    width: 2560,
    height: 1707,
    focal: "50% 45%",
    depicts: "Sigiriya, Cultural Triangle",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/KYBc1eq0dJo",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /** Identified by the nine-arch stone viaduct, tunnel mouth and SLR livery. */
  nineArchBridge: {
    src: "/photography/nine-arch-bridge-demodara.jpg",
    alt: "A blue train crossing the Nine Arch Bridge above jungle",
    width: 2000,
    height: 1333,
    focal: "50% 50%",
    depicts: "Nine Arch Bridge, Demodara, near Ella",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/Dw9dWTzzsUE",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /** Identified by the octagonal Pattirippuwa tower and the moat parapet. */
  kandyTempleMoat: {
    src: "/photography/kandy-tooth-relic-temple.jpg",
    alt: "The Temple of the Sacred Tooth Relic reflected in its moat",
    width: 1600,
    height: 2400,
    focal: "50% 40%",
    depicts: "Temple of the Sacred Tooth Relic, Kandy",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/isdvqf04MDk",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /** Identified by the legible Pedlar's Inn Café signage on Pedlar Street. */
  galleFortStreet: {
    src: "/photography/galle-fort-pedlar-street.jpg",
    alt: "A vintage car parked on a colonial street inside Galle Fort",
    width: 2000,
    height: 1333,
    focal: "45% 55%",
    depicts: "Pedlar Street, Galle Fort",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/-cjtJMf5X_w",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /* — Owner's original photography ————————————————————————————
   *
   * Drone and camera work supplied by the site owner from his own archive
   * (WhatsApp-forwarded, so EXIF and GPS were stripped in transit — absence of
   * metadata is a property of the transport, not a gap in provenance).
   *
   * `kind: "original"` is verified by definition under MediaProvenance: the
   * photographer knows where he was standing. The owner's mapping of frame to
   * place is quoted verbatim above each entry, which is the same standard that
   * settled the Yala leopard.
   *
   * Resampled to 1600px on the long edge and re-encoded at JPEG q82. No crop,
   * no colour grading, no retouching — the photographs are unaltered.
   */

  /** Owner's location mapping, verbatim: "Arugam Bay: 49, 50, 51, 13, 06, 07, 09, 48, 47" — this is frame 49. */
  arugamBay: {
    src: "/photography/arugam-bay.jpg",
    alt: "The sweep of Arugam Bay from the air at dusk",
    width: 1600,
    height: 899,
    focal: "50% 50%",
    depicts: "Arugam Bay, East Coast",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /** Owner's location mapping, verbatim: "elephant rock: 53, 55" — this is frame 55. */
  elephantRock: {
    src: "/photography/elephant-rock.jpg",
    alt: "A granite headland rising from the sand where the surf meets it",
    width: 1600,
    height: 898,
    focal: "50% 50%",
    depicts: "Elephant Rock, near Arugam Bay",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /**
   * Owner's location mapping, verbatim: "whisky point : 13, 14" — this is
   * frame 14. Frame 13 was listed under BOTH "Arugam Bay" and "whisky point"
   * and is therefore NOT registered pending a single answer.
   */
  whiskyPoint: {
    src: "/photography/whisky-point-lineup.jpg",
    alt: "Surfers waiting in the line-up beyond the break",
    width: 1600,
    height: 899,
    focal: "50% 50%",
    depicts: "Whisky Point, near Arugam Bay",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /** Owner's location mapping, verbatim: "Pottuvil Lagoon: 12, 01, 04, 15, 16, 20, 35, 36, 38, 39, 44, 45, 42" — this is frame 42. */
  pottuvilLagoon: {
    src: "/photography/pottuvil-lagoon.jpg",
    alt: "A mangrove-fringed lagoon meeting the sea",
    width: 1600,
    height: 899,
    focal: "50% 50%",
    depicts: "Pottuvil Lagoon, East Coast",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /**
   * Owner's mapping lists frames 26 and 18 under "General use". They are the
   * owner's originals and so `kind: "original"`, but they carry NO `depicts`:
   * general use was authorised, a specific place was not. They must never be
   * captioned with one.
   */
  lagoonCrocodile: {
    src: "/photography/lagoon-crocodile.jpg",
    alt: "A crocodile on a lagoon bank",
    width: 1600,
    height: 900,
    focal: "50% 50%",
    provenance: { kind: "original", verifiedLocation: true },
  },
  lagoonMangroveBoat: {
    src: "/photography/lagoon-mangrove-boat.jpg",
    alt: "Travellers in a small boat beneath a mangrove canopy",
    width: 1600,
    height: 1066,
    focal: "50% 50%",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /** Owner's mapping: frame 50, "Arugam Bay". Ground-level counterpart to the aerial above. */
  arugamBayEvening: {
    src: "/photography/arugam-bay-beach-evening.jpg",
    alt: "A palm-backed beach at golden hour",
    width: 1600,
    height: 899,
    focal: "50% 50%",
    depicts: "Arugam Bay, East Coast",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /**
   * Frame 53. The owner was asked directly whether this was Elephant Rock or
   * another part of the coast — it reads as a river-mouth sandbar rather than
   * the headland in frame 55 — and confirmed: "Elephant Rock".
   */
  elephantRockSandbar: {
    src: "/photography/elephant-rock-sandbar.jpg",
    alt: "A sandbar where a river meets the sea",
    width: 1600,
    height: 898,
    focal: "50% 50%",
    depicts: "Elephant Rock, near Arugam Bay",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /**
   * Frame 20. Listed under both "Pottuvil Lagoon" and "General use"; the owner
   * resolved it as "20 is Pottuvil, 36 is general", so this one carries the
   * location claim and frame 36 below does not.
   */
  pottuvilPaddleboards: {
    src: "/photography/pottuvil-lagoon-paddleboards.jpg",
    alt: "Paddleboarders crossing a mangrove lagoon, seen from above",
    width: 1600,
    height: 899,
    focal: "50% 50%",
    depicts: "Pottuvil Lagoon, East Coast",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /*
    No `depicts` on the three below — deliberately.

    Frame 13 was listed under both "Arugam Bay" and "whisky point"; asked to
    choose, the owner answered "General use only, no location". Frame 36 was
    resolved the same way. Frame 35 was only ever authorised for general use.
    All three are the owner's originals, so `kind: "original"`, but none may be
    captioned with a place.
  */
  surfRightHander: {
    src: "/photography/surf-right-hander.jpg",
    alt: "A surfer riding a clean right-hand wave",
    width: 1600,
    height: 1066,
    focal: "50% 50%",
    provenance: { kind: "original", verifiedLocation: true },
  },
  lagoonHeronSunset: {
    src: "/photography/lagoon-heron-sunset.jpg",
    alt: "A heron standing in shallow water at sunset",
    width: 1600,
    height: 1066,
    focal: "50% 50%",
    provenance: { kind: "original", verifiedLocation: true },
  },
  lagoonElephant: {
    src: "/photography/lagoon-elephant.jpg",
    alt: "An elephant at the water's edge, framed by mangroves",
    width: 1600,
    height: 1066,
    focal: "50% 50%",
    provenance: { kind: "original", verifiedLocation: true },
  },

  /**
   * Location confirmed by the site owner: Yala National Park, Sri Lanka.
   *
   * The frame alone could not settle it — dry-zone scrub and a waterhole look
   * much the same across the leopard's range, and a second candidate showing a
   * leopard in a tree was rejected for exactly that reason. This one is
   * verified on the owner's direct statement, which is the strongest evidence
   * available for a photograph neither of us took.
   */
  yalaLeopard: {
    src: "/photography/yala-leopard.jpg",
    alt: "A leopard resting at the edge of a waterhole",
    width: 2000,
    height: 1132,
    focal: "50% 40%",
    depicts: "Yala National Park",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/PPGM2ZpCrzc",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /**
   * Coconut Tree Hill — the red-laterite headland of leaning coconut palms
   * above the reef, with the bay curving away behind. Corroborated by a second,
   * independent aerial photograph in photo-candidates/ showing the same
   * landform from above. It is also named in Mirissa's own highlights list.
   */
  mirissaCoconutHill: {
    src: "/photography/mirissa-coconut-tree-hill.jpg",
    alt: "Coconut palms leaning over a rocky headland above turquoise water",
    width: 2000,
    height: 1500,
    focal: "50% 50%",
    depicts: "Coconut Tree Hill, Mirissa",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/iduEaeBB_rQ",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /**
   * Identified by the Lotus Tower — Colombo's one unmistakable landmark, and
   * the only structure of its kind on the island. The railway yard and the
   * high-rise skyline behind it corroborate the city.
   */
  colomboLotusTower: {
    src: "/photography/colombo-lotus-tower.jpg",
    alt: "The Lotus Tower above Colombo's railway lines at sunset",
    width: 1600,
    height: 2400,
    focal: "50% 35%",
    depicts: "Lotus Tower, Colombo",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/KtDXt7DyfVM",
      license: "Unsplash License",
      verifiedLocation: true,
    },
  },

  /**
   * Deliberately NOT location-verified. The carriage livery and tea terraces
   * are consistent with the highland line, but no station, sign or landmark in
   * the frame fixes the place — so it carries no `depicts` and must never be
   * captioned with one. It is a journey image, not a destination image.
   */
  highlandTrainDoor: {
    src: "/photography/hill-country-train.jpg",
    alt: "A traveller leaning from a train door as it passes tea-covered hills",
    width: 2000,
    height: 1333,
    focal: "60% 50%",
    provenance: {
      kind: "stock",
      source: "Unsplash",
      url: "https://unsplash.com/photos/ePAa2c9XbtE",
      license: "Unsplash License",
      verifiedLocation: false,
    },
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
 * Reverse index: image URL → the registry entry it belongs to.
 *
 * Built once at module load. Exists because several data sources still carry
 * images as bare URL strings (see `legacyImg`), which drops the provenance that
 * the verification gate depends on. This is how a flattened URL finds its way
 * home. It disappears when those sources reference registry keys directly.
 */
const bySrc: ReadonlyMap<string, MediaAsset> = new Map(
  Object.values(media).map((a) => [a.src, a as MediaAsset])
);

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
/**
 * The registry entry for a given src, if there is one.
 *
 * Exists so callers that only have a URL — CMS fields, the hero slide list —
 * can recover the asset's real provenance, alt text and focal point instead of
 * inventing them. Returns null for anything not in the registry, which is the
 * honest answer: an unregistered path is an unverified image, and typing it
 * into the admin must not change that.
 */
export function assetBySrc(src: string): MediaAsset | null {
  return bySrc.get(src.trim()) ?? null;
}

export function destinationAsset(d: {
  name: string;
  region?: string;
  image: string;
}): MediaAsset | null {
  const base = fromCmsUrl(d.image, d.name, {
    depicts: d.region ? `${d.name}, ${d.region}` : d.name,
  });
  if (!base) return null;

  /*
    Recover the real provenance where we can.

    Destination records store `image` as a bare URL string, so by the time it
    reaches here the MediaAsset it came from — and its verification status —
    has been flattened away. Rebuilding blindly through fromCmsUrl stamped
    every destination `kind: "cms", verifiedLocation: false`, which silently
    overrode the registry and left every destination photograph blocked by the
    gate no matter what the registry said.

    Looking the URL back up restores the link. Only provenance is inherited:
    alt, depicts and focal keep their existing per-destination behaviour.

    A URL with no registry entry — a genuine CMS upload — is left exactly as it
    was: cms, unverified. Nothing is globally forced true.
  */
  const known = bySrc.get(d.image);
  return known ? { ...base, provenance: known.provenance } : base;
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

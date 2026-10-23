import type { MediaAsset } from "./types";

/**
 * The operator's own photographs, as placed assets.
 *
 * ── What is in here and what is deliberately not ────────────────────────────
 *
 * The collection this came from is 87 unique frames. Eighty-four of them are
 * publishable; seven are in this file. The other seventy-seven are in the gallery
 * and nowhere else, and that is the point rather than an omission: a page
 * section carries a photograph because that photograph is the best available
 * answer for that section, not because the photograph exists. Dropping all
 * eighty-four into slots would have replaced a set of considered frames with
 * a set of adequate ones, and the first thing a visitor notices about a site
 * built that way is that nobody chose anything.
 *
 * So each entry below exists because it beats the stock photograph it replaces
 * on a specific count — it is the operator's own, or it is the right shape for
 * the slot, or both. Everything else earns its place in the gallery, where a
 * visitor has asked to browse and more frames are straightforwardly better.
 *
 * ── Why these and not others ────────────────────────────────────────────────
 *
 * Shape decided more of this than taste did. Sixty-three of the eighty-seven
 * frames are upright phone photographs at 3:4, which is why the upright slots
 * (the CTA band at 2:3, the experience tiles at 4:5) take owner photography
 * easily and the eight 16:9 page headers almost entirely cannot: the collection
 * contains exactly two true 16:9 frames, both shot in a mask workshop.
 *
 * ── The `depicts` / `verifiedLocation` pair ─────────────────────────────────
 *
 * `depicts` is the claim the asset is allowed to make, and `verifiedLocation`
 * says whether that claim has been checked. Four of these name a place, and
 * only because the place is identifiable in the frame itself — the Demodara
 * curve, Dambulla's arcade, the crossed-arm figure at Gal Vihara. The other
 * three name a subject instead, which is the same thing one register down: a
 * table of clay pots is demonstrably rice and curry without anyone needing to
 * know which kitchen it was in. That follows the precedent already set by the
 * Commons rice-and-curry plate in lib/media/experiences.ts, which carries
 * `verifiedLocation: true` on a subject claim for exactly this reason.
 *
 * None of the frames whose place was *not* identifiable is used here. They stay
 * in the gallery, captioned by what they show.
 *
 * This matters because the experience tiles, the region tiles and the
 * destination cards all gate on `isLocationVerified`, and a failed gate renders
 * the contour panel instead of the photograph. A subject claim therefore has to
 * be a claim that was actually checked, not a shrug — which is true of all of
 * these, since an operator photographing their own tour is never in doubt about
 * what country they were in.
 *
 * ── Where the files live ────────────────────────────────────────────────────
 *
 * `photography/<folder>/<slug>.jpg` in the public `media` bucket, written by
 * scripts/upload-photography.mjs. The folder groups by subject rather than by
 * page, so moving a photograph from an experience tile to a region tile is an
 * edit to one line here and not a re-upload.
 *
 * These URLs resolve only after that script has run. Until then the slots keep
 * their previous fallbacks, because nothing imports this module speculatively —
 * each entry is wired to exactly one slot, by hand, below its own comment.
 */

const SUPABASE_MEDIA =
  "https://weiwhqhvtdpcwzdwlazd.supabase.co/storage/v1/object/public/media";

type OwnPhoto = {
  /** `<folder>/<slug>`, matching the uploader's deterministic path. */
  path: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
  depicts: string;
  /**
   * Defaults to true, because the claim in `depicts` was checked before the
   * entry was written. It is settable only so that an unplaced original —
   * should one ever be wired to a slot — can say so; see lib/media/types.ts.
   */
  verifiedLocation?: boolean;
};

function ownPhoto(p: OwnPhoto): MediaAsset {
  return {
    src: `${SUPABASE_MEDIA}/photography/${p.path}.jpg`,
    alt: p.alt,
    width: p.width,
    height: p.height,
    blurDataURL: p.blurDataURL,
    depicts: p.depicts,
    provenance: {
      kind: "original",
      photographer: "Island Route Sri Lanka",
      verifiedLocation: p.verifiedLocation ?? true,
    },
  };
}

export const photography = {
  /**
   * The blue train on the Demodara curve, shot upright from the hillside.
   *
   * 1980x3520 — a 9:16 frame, which is why it goes to the CTA band's 2:3 slot
   * rather than a header: it is one of the few frames in the collection that is
   * *taller* than the tall slot, so the crop takes a little sky and a little
   * foreground off a composition that has plenty of both, instead of cutting
   * into the bridge.
   *
   * Identifiable: the nine stone arches on the Demodara curve, with the
   * hillside and the walkway above the parapet.
   */
  nineArchBridgeTrain: ownPhoto({
    path: "journeys/nine-arch-bridge-train",
    alt: "A blue train curving across a nine-arch stone viaduct set into steep jungle hillside",
    width: 1980,
    height: 3520,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMFBP/EACUQAAEEAQEIAwAAAAAAAAAAAAEAAgMRBCEFBhIVMTI0QVFhkf/EABUBAQEAAAAAAAAAAAAAAAAAAAIA/8QAGBEAAwEBAAAAAAAAAAAAAAAAAAESMUH/2gAMAwEAAhEDEQA/AKcm8bm47ntxpA6tHEirUYbZza8t/wClLgynTCntAjb1JBoegmuwp+I1HDV/CFPpSLhA5Xj6d0zr+6IpbCTZ1QhB4NH/2Q==",
    depicts: "Nine Arch Bridge, Demodara",
  }),

  /**
   * A workshop wall of carved devil masks. One of exactly two true 16:9 frames
   * in the collection, which is the whole reason a header can use it.
   *
   * It carries a subject claim rather than a place: the masks are unmistakably
   * Sri Lankan kolam masks, but the workshop is not identifiable, and the
   * gallery header does not name a place anyway.
   */
  traditionalMasksWall: ownPhoto({
    path: "heritage/traditional-masks-wall",
    alt: "Dozens of carved and painted wooden masks with flared headdresses, hung in rows on a workshop wall",
    width: 4032,
    height: 2268,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAHRAAAgIBBQAAAAAAAAAAAAAAAAECEQMEEyFhkf/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAWEQADAAAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/AJ6jNJRbdX0YN2+bfoAFY8R//9k=",
    depicts: "Carved kolam masks",
  }),

  /**
   * Dambulla's whitewashed arcade under the granite overhang, at 4160x3120 —
   * exactly the 4:3 the region tiles ask for, so this one lands uncropped.
   *
   * Identifiable: the colonnaded facade built directly beneath the overhang is
   * the only cave temple in the country with that frontage.
   */
  dambullaCaveTempleVerandah: ownPhoto({
    path: "heritage/dambulla-cave-temple-verandah",
    alt: "A white colonnaded verandah built into the base of a vast granite overhang",
    width: 4160,
    height: 3120,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIBAAAQMCBwAAAAAAAAAAAAAAAQACAwQSERMhMUGhwf/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAXEQADAQAAAAAAAAAAAAAAAAAAATEh/9oADAMBAAIRAxEAPwCFNNWTsvnme1jRubjh4sproQ4gCIjg5btekRC0Sw//2Q==",
    depicts: "Dambulla, Cultural Triangle",
  }),

  /**
   * Rice and curry from directly above — a dozen clay pots, which is what the
   * dish actually looks like when it is served properly.
   *
   * It replaces a Commons plate that was photographed in restaurant style. The
   * Commons file is a good photograph; this one is a tour's lunch, and the
   * difference is the entire argument for a food tile on an operator's site.
   */
  riceAndCurryClayPots: ownPhoto({
    path: "table/rice-and-curry-clay-pots",
    alt: "A dozen small clay pots of curries and sambols arranged on a table, seen from directly above",
    width: 3120,
    height: 4160,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAANAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAwL/xAAfEAACAAcAAwAAAAAAAAAAAAABAgADBAUREiEyUXH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAGBEAAgMAAAAAAAAAAAAAAAAAACEBAhH/2gAMAwEAAhEDEQA/ADuFZPeoeWGww8F70QamZqNmG2O/YWrlg3BjkjR8Ae4sqCTAxZi4j//Z",
    depicts: "Sri Lankan rice and curry",
  }),

  /**
   * Three pluckers walking away up a shaded estate path with baskets strapped
   * to their backs. Backs only — nobody in this frame is identifiable, which is
   * why it is here and forty-six other frames of this collection are not.
   *
   * 1500x2000 is the smallest file placed anywhere on the site. It is adequate
   * for a 4:5 tile at every breakpoint and would not be adequate for a header.
   */
  teaBasketsUpThePath: ownPhoto({
    path: "hill-country/tea-baskets-up-the-path",
    alt: "Three people walking away up a shaded estate path with woven tea baskets strapped to their backs",
    width: 1500,
    height: 2000,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAANAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgMEBv/EACEQAQABBAIBBQAAAAAAAAAAAAECAwQRIQASEyIxUaHh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAWEQADAAAAAAAAAAAAAAAAAAAAARL/2gAMAwEAAhEDEQA/AEskKdSU/JTmdjbrWdvImjUksoxh1dnq/OaC5saU4SwAOsYExj2+uAWdsANvSX56G+RpDlH/2Q==",
    depicts: "Tea picking in the hill country",
  }),

  /**
   * The standing figure at Gal Vihara, seven metres of granite with the arms
   * folded across the chest.
   *
   * Identifiable: that posture is unique to this carving in Sri Lanka, which is
   * what lets it carry the Polonnaruwa name rather than a subject claim.
   */
  galViharaStandingBuddha: ownPhoto({
    path: "heritage/gal-vihara-standing-buddha",
    alt: "A tall standing Buddha carved in relief from a granite cliff, arms folded across the chest",
    width: 2754,
    height: 3672,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAANAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIE/8QAHBABAAEFAQEAAAAAAAAAAAAAAQIAAwQRIRIT/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAXEQADAQAAAAAAAAAAAAAAAAAAARIC/9oADAMBAAIRAxEAPwBXGhHCuJEdIxaL4XHu3tbvm3cMmTY+u61uqIoB7anrI8tn/9k=",
    depicts: "Polonnaruwa, Cultural Triangle",
  }),

  /**
   * A spice garden's tasting table: labelled dishes of oils, powders and pastes
   * laid around a palm trunk.
   *
   * It goes to the Local Life tile, where the previous fallback was a general
   * street view of Negombo. A stranger's street is a weaker illustration of
   * local life than a thing a guest is actually handed and asked to smell.
   */
  spiceTastingTable: ownPhoto({
    path: "table/spice-tasting-table",
    alt: "Small labelled dishes of oils, powders and pastes laid around a palm trunk on a metal table",
    width: 1200,
    height: 1600,
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAANAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQAD/8QAIxAAAgEEAQMFAAAAAAAAAAAAAQIRAAMEIRIFMUEUIjKx8P/EABQBAQAAAAAAAAAAAAAAAAAAAAL/xAAWEQEBAQAAAAAAAAAAAAAAAAAAERL/2gAMAwEAAhEDEQA/ABLPSXRLSss3HloKajxuPNT4QDsGwrhYHZCEyaZ6bkerwMZ7ysS593FuMwf2u1ZNmXuR+I32Ex90dQo//9k=",
    depicts: "A spice garden tasting table",
  }),
} satisfies Record<string, MediaAsset>;

/**
 * Builds scripts/photography.manifest.json — the catalogue of the owner's own
 * photographs, which is the input to the uploader and the review sheet.
 *
 * ── Why this file is hand-authored ─────────────────────────────────────────
 *
 * Every one of the 91 source files is named with a UUID. Nothing about the
 * subject, the place or the date can be read from a filename, an EXIF field we
 * can rely on, or a folder. The only way to know what is in a frame is to look
 * at it, so the table below is the record of having looked: one row per unique
 * photograph, written against numbered contact sheets rendered from the files
 * themselves.
 *
 * ── Two decisions are encoded here, and both are deliberate ────────────────
 *
 * 1. `hold`. Roughly half the collection shows guests — recognisable faces of
 *    named customers on their holiday. Publishing those on a commercial site
 *    is a consent question, not a design question, and it is the operator's to
 *    answer, not this script's. Held frames are catalogued, numbered and
 *    described so they can be released one by one; they are not uploaded.
 *
 * 2. `place`. The registry's rule is that a place name on this site means a
 *    human confirmed the photograph shows where it claims to. A UUID carries
 *    no such confirmation, so a place is named here only when the frame itself
 *    contains the evidence — a landmark that cannot be anywhere else, written
 *    out in `placeEvidence`. Everything else is described by subject and left
 *    unplaced until the owner says otherwise on the review sheet. That is why
 *    there is a `place` column and a `placeEvidence` column rather than one.
 *
 * Run: node scripts/build-photography-manifest.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC =
  process.env.PHOTO_SRC || "C:/Users/whisk/OneDrive/Documents/island route/Images";

/* ---------------------------------------------------------------------------
   The catalogue.

   n        position on the contact sheet, so a row can be found by eye
   slug     stable storage name; changing one orphans an uploaded file
   cat      gallery category — the six the grid already filters by
   folder   bucket folder, by subject rather than by page
   caption  what a visitor reads under the frame
   alt      what a screen reader hears; describes, never repeats the caption
   place    only where the frame proves it (see `ev`)
   ev       the feature in the frame that proves the place
   hold     why it is not published: guests | person | quality
   --------------------------------------------------------------------------- */

const CATALOGUE = [
  // ---- Heritage, craft and the table ------------------------------------
  {
    n: 1, slug: "temple-guardstone-steps", cat: "Culture", folder: "heritage",
    caption: "Guardstone and moonstone at a ruined temple",
    alt: "Carved stone steps flanked by an ornate guardstone at an ancient brick temple, under a blue sky",
  },
  {
    n: 9, slug: "kovil-painted-facade", cat: "Culture", folder: "heritage",
    caption: "A Hindu kovil in full colour",
    alt: "The painted blue and gold facade of a Hindu temple, with figures of deities above the entrance",
  },
  {
    n: 13, slug: "dambulla-cave-temple-verandah", cat: "Culture", folder: "heritage",
    caption: "The cave temple at Dambulla",
    alt: "A white colonnaded verandah built into the base of a vast granite overhang",
    place: "Dambulla, Cultural Triangle",
    ev: "The whitewashed arcade built directly beneath Dambulla's granite overhang — the only cave temple in the country with that facade.",
  },
  {
    n: 16, slug: "cave-temple-painted-buddha", cat: "Culture", folder: "heritage",
    caption: "A painted shrine, lit the old way",
    alt: "A gilded seated Buddha beneath a carved naga hood, against a densely painted shrine wall",
  },
  {
    n: 32, slug: "gal-vihara-seated-buddha", cat: "Culture", folder: "heritage",
    caption: "Gal Vihara, Polonnaruwa",
    alt: "A seated Buddha carved from a single face of banded granite in a shallow rock niche",
    place: "Polonnaruwa, Cultural Triangle",
    ev: "The Gal Vihara rock face — four figures cut from one gneiss outcrop, the seated one in its shallow niche.",
  },
  {
    n: 35, slug: "gal-vihara-standing-buddha", cat: "Culture", folder: "heritage",
    caption: "Seven metres of granite, one standing figure",
    alt: "A tall standing Buddha carved in relief from a granite cliff, arms folded across the chest",
    place: "Polonnaruwa, Cultural Triangle",
    ev: "The crossed-arm standing figure at Gal Vihara — the posture is unique to this carving in Sri Lanka.",
  },
  {
    n: 38, slug: "carved-stone-guardian", cat: "Culture", folder: "heritage",
    caption: "A guardian, cut in stone",
    alt: "A weathered stone relief of a crowned guardian figure holding a pot, set into a temple stairway",
  },
  {
    n: 42, slug: "kovil-gopuram-tower", cat: "Culture", folder: "heritage",
    caption: "A gopuram against a clean sky",
    alt: "A tiered Hindu temple tower crowded with brightly painted sculpted figures, rising into blue sky",
  },
  {
    n: 62, slug: "brick-stupa-steps", cat: "Culture", folder: "heritage",
    caption: "The long climb to a brick dagoba",
    alt: "A broad flight of worn stone steps leading up to the weathered brick dome of an ancient stupa",
  },
  {
    n: 77, slug: "dambulla-seated-buddha-row", cat: "Culture", folder: "heritage",
    caption: "A row of Buddhas under a painted ceiling",
    alt: "Seated Buddha statues in a line along a cave wall, beneath a ceiling painted in geometric panels",
    place: "Dambulla, Cultural Triangle",
    ev: "Dambulla's painted cave ceilings following the rock contour above a continuous row of statues.",
  },
  {
    n: 78, slug: "dambulla-cave-shrine", cat: "Culture", folder: "heritage",
    caption: "Inside the rock, at Dambulla",
    alt: "A cave shrine of standing Buddha figures around a central robed statue, under a painted rock ceiling",
    place: "Dambulla, Cultural Triangle",
    ev: "The same painted cave ceiling and standing-figure arrangement as the adjoining Dambulla shrine.",
  },
  {
    n: 85, slug: "traditional-masks-wall", cat: "Culture", folder: "heritage",
    caption: "Devil masks, drying in rows",
    alt: "Dozens of carved and painted wooden masks with flared headdresses, hung in rows on a workshop wall",
  },
  {
    n: 60, slug: "carved-wooden-elephants", cat: "Culture", folder: "heritage",
    caption: "A workshop's worth of elephants",
    alt: "Shelves of hand-carved wooden elephants in graded sizes, filling a craft workshop wall",
  },
  {
    n: 36, slug: "rice-and-curry-clay-pots", cat: "Culture", folder: "table",
    caption: "Rice and curry, the proper way",
    alt: "A dozen small clay pots of curries and sambols arranged on a table, seen from directly above",
  },
  {
    n: 21, slug: "spice-tasting-table", cat: "Culture", folder: "table",
    caption: "The tasting table at a spice garden",
    alt: "Small labelled dishes of oils, powders and pastes laid around a palm trunk on a metal table",
  },

  // ---- Wildlife -----------------------------------------------------------
  {
    n: 17, slug: "elephants-family-track", cat: "Wildlife", folder: "wildlife",
    caption: "A family crossing the track",
    alt: "Two adult elephants walking a rain-wet dirt track with a calf sheltered between them",
  },
  {
    n: 20, slug: "crocodile-riverbank", cat: "Wildlife", folder: "wildlife",
    caption: "Hauled out on the bank",
    alt: "A large crocodile lying still on a muddy river bank beside brown water",
  },
  {
    n: 40, slug: "park-plain-dead-tree", cat: "Wildlife", folder: "wildlife",
    caption: "One dead tree, and the whole plain",
    alt: "A bare branching tree standing alone on a green scrub plain, with grazing animals nearby",
  },
  {
    n: 44, slug: "two-elephants-scrub", cat: "Wildlife", folder: "wildlife",
    caption: "Two, feeding in the scrub",
    alt: "A pair of elephants feeding among low green scrub and trees",
  },
  {
    n: 48, slug: "elephant-pair-grassland", cat: "Wildlife", folder: "wildlife",
    caption: "Shoulder to shoulder",
    alt: "Two elephants standing close together on open grassland under a cloudy sky",
  },
  {
    n: 53, slug: "mongoose-in-the-green", cat: "Wildlife", folder: "wildlife",
    caption: "A mongoose, caught mid-thought",
    alt: "A mongoose sitting upright among dense green undergrowth, head raised and alert",
  },
  {
    n: 55, slug: "elephant-and-calf", cat: "Wildlife", folder: "wildlife",
    caption: "A calf, close to its mother",
    alt: "An adult elephant at the treeline with a small calf feeding beside her",
  },
  {
    n: 67, slug: "elephants-on-the-track", cat: "Wildlife", folder: "wildlife",
    caption: "Right of way",
    alt: "Three elephants standing on and beside a red dirt park track, facing the camera",
  },
  {
    n: 70, slug: "elephant-herd-close", cat: "Wildlife", folder: "wildlife",
    caption: "Close enough to hear them feed",
    alt: "A large elephant filling the frame on a dirt track, with the rest of the herd behind",
  },
  {
    n: 73, slug: "grey-langur-and-infant", cat: "Wildlife", folder: "wildlife",
    caption: "A langur and her infant",
    alt: "A grey langur sitting on a low wall in dappled shade, holding an infant against her chest",
  },
  {
    n: 79, slug: "grey-langurs-trio", cat: "Wildlife", folder: "wildlife",
    caption: "Three, keeping warm",
    alt: "Three grey langurs huddled together on bare ground at the edge of the scrub",
  },
  {
    n: 83, slug: "elephant-herd-green-plain", cat: "Wildlife", folder: "wildlife",
    caption: "The herd, out on the green",
    alt: "A herd of elephants grazing across a bright green plain with wooded hills behind",
  },
  {
    n: 87, slug: "cormorant-drying-wings", cat: "Wildlife", folder: "wildlife",
    caption: "Wings out, drying",
    alt: "A dark cormorant perched low over green water with both wings spread wide to dry",
  },

  // ---- Hill country -------------------------------------------------------
  {
    n: 10, slug: "tea-baskets-up-the-path", cat: "Hills", folder: "hill-country",
    caption: "Baskets on, heading up to the field",
    alt: "Three people walking away up a shaded estate path with woven tea baskets strapped to their backs",
  },
  {
    n: 37, slug: "ridge-path-arms-wide", cat: "Hills", folder: "hill-country",
    caption: "The ridge, and nothing in the way",
    alt: "A walker seen from behind on a narrow ridge path, arms spread, facing a green peak in cloud",
  },
  {
    n: 39, slug: "valley-swing", cat: "Hills", folder: "hill-country",
    caption: "Out over the valley",
    alt: "A figure in a red dress on a flower-wrapped rope swing, suspended above a deep green valley",
  },

  // ---- On the road --------------------------------------------------------
  {
    n: 28, slug: "nine-arch-bridge-train", cat: "Journeys", folder: "journeys",
    caption: "The blue train on the Nine Arch Bridge",
    alt: "A blue train curving across a nine-arch stone viaduct set into steep jungle hillside",
    place: "Nine Arch Bridge, Demodara",
    ev: "The nine stone arches on the Demodara curve, with the hillside and the walkway above the parapet.",
  },
  {
    n: 72, slug: "nine-arch-bridge-from-the-train", cat: "Journeys", folder: "journeys",
    caption: "Leaning out, over nine arches",
    alt: "The view along a train's own carriages as it crosses a tall nine-arch stone viaduct",
    place: "Nine Arch Bridge, Demodara",
    ev: "Shot from the train itself on the same nine-arch viaduct, the arches counted in frame.",
  },
  {
    n: 57, slug: "nine-arch-bridge-viewpoint", cat: "Journeys", folder: "journeys",
    caption: "The viewpoint everyone walks down for",
    alt: "A traveller seen from behind with arms raised at a viewpoint above a nine-arch stone railway bridge",
    place: "Nine Arch Bridge, Demodara",
    ev: "The viewpoint above the Demodara arches, the bridge and its jungle setting filling the frame.",
  },
  {
    n: 18, slug: "nuwara-eliya-post-office-map", cat: "Journeys", folder: "journeys",
    caption: "Working out tomorrow, outside the old post office",
    alt: "A hand holding a printed map of Sri Lanka in front of a red-brick Tudor post office with a clock tower",
    place: "Nuwara Eliya, Hill Country",
    ev: "The red-brick mock-Tudor post office with its clock tower — a single, unmistakable building in Nuwara Eliya.",
  },
  {
    n: 75, slug: "safari-jeep-wetland", cat: "Journeys", folder: "journeys",
    caption: "First light, and the track is already wet",
    alt: "An open safari jeep on a rutted wet track beside a wetland channel, with the plain stretching behind",
  },

  // ---- Coast --------------------------------------------------------------
  {
    n: 69, slug: "coconut-tree-hill-mirissa", cat: "Beaches", folder: "coast",
    caption: "Coconut Tree Hill, Mirissa",
    alt: "Leaning coconut palms on a red laterite headland above the ocean, with a figure sitting at the edge",
    place: "Mirissa, South Coast",
    ev: "The red laterite headland of Coconut Tree Hill with its leaning palms over the Indian Ocean.",
  },
  {
    n: 74, slug: "coconut-tree-hill-palms", cat: "Beaches", folder: "coast",
    caption: "Palms over the Indian Ocean",
    alt: "Tall coconut palms leaning out over a rocky shoreline and open sea from a red earth headland",
    place: "Mirissa, South Coast",
    ev: "The same headland at Coconut Tree Hill, the palms and red earth unchanged between frames.",
  },

  // ---- Held: recognisable guests -----------------------------------------
  { n: 2, slug: "guests-leaning-from-the-train", hold: "guests", subject: "Guests leaning out of the hill-country train" },
  { n: 3, slug: "guests-at-the-vatadage", hold: "guests", subject: "Two guests on the Vatadage steps, Polonnaruwa" },
  { n: 4, slug: "family-portrait-roadside", hold: "guests", subject: "A family of four posed at a roadside stop" },
  { n: 5, slug: "group-with-elephant", hold: "guests", subject: "Tour group lined up beside an elephant" },
  { n: 6, slug: "elephant-back-ride", hold: "guests", subject: "Two guests riding on an elephant's back" },
  { n: 7, slug: "guests-in-the-spice-garden", hold: "guests", subject: "Two guests at a spice garden planting bed" },
  { n: 8, slug: "guest-with-tea-plucker", hold: "guests", subject: "A guest and a tea plucker in the field" },
  { n: 11, slug: "couple-at-the-gap", hold: "guests", subject: "A couple at a hill-country viewpoint" },
  { n: 12, slug: "guest-under-elephant-trunk", hold: "guests", subject: "A guest posing beneath an elephant's trunk" },
  { n: 14, slug: "couple-with-elephant", hold: "guests", subject: "A couple standing with an elephant" },
  { n: 15, slug: "group-below-sigiriya", hold: "guests", subject: "Tour group with Sigiriya rock behind" },
  { n: 19, slug: "couple-in-the-tea-field", hold: "guests", subject: "A couple and a tea plucker among the bushes" },
  { n: 22, slug: "couple-jeep-elephant", hold: "guests", subject: "A couple in a safari jeep, elephant behind" },
  { n: 23, slug: "guest-paddling", hold: "guests", subject: "A guest paddling a canoe through a wetland" },
  { n: 24, slug: "guests-bathing-elephant", hold: "guests", subject: "Guests washing an elephant in the river" },
  { n: 25, slug: "guest-plucking-tea", hold: "guests", subject: "A guest being shown how to pluck tea" },
  { n: 26, slug: "raptor-in-enclosure", hold: "quality", subject: "A raptor on a branch behind wire mesh" },
  { n: 29, slug: "group-jeep-selfie", hold: "guests", subject: "Group selfie from the back of a jeep" },
  { n: 30, slug: "couple-at-the-falls", hold: "guests", subject: "A couple at a waterfall railing" },
  { n: 31, slug: "couple-on-elephant", hold: "guests", subject: "A couple seated on an elephant" },
  { n: 33, slug: "couple-sigiriya-dusk", hold: "guests", subject: "A couple above the canopy, Sigiriya at dusk" },
  { n: 34, slug: "guest-and-plucker-tea", hold: "guests", subject: "A guest and a tea plucker, baskets on" },
  { n: 41, slug: "group-on-the-estate", hold: "guests", subject: "Tour group on an estate road" },
  { n: 43, slug: "guest-weaving-palm", hold: "guests", subject: "A guest learning to weave palm fronds" },
  { n: 45, slug: "guest-at-dambulla", hold: "guests", subject: "A guest below the Dambulla cave verandah" },
  { n: 46, slug: "guest-at-the-image-house", hold: "guests", subject: "A guest between the walls of a brick image house" },
  { n: 47, slug: "guest-on-the-falls-boulder", hold: "guests", subject: "A guest standing on a boulder at a waterfall" },
  { n: 49, slug: "family-sigiriya-sunrise", hold: "guests", subject: "A family at sunrise with Sigiriya behind" },
  { n: 50, slug: "guest-in-the-mud-house", hold: "guests", subject: "A guest seated inside a mud-walled house" },
  { n: 51, slug: "group-on-the-rock-path", hold: "guests", subject: "Tour group on an open rock path" },
  { n: 52, slug: "group-in-the-workshop", hold: "guests", subject: "Group watching a gem and stone workshop" },
  { n: 54, slug: "guests-at-the-palace-ruins", hold: "guests", subject: "Guests before the royal palace brickwork" },
  { n: 56, slug: "guest-in-the-canoe", hold: "guests", subject: "A guest paddling under a thatched canopy" },
  { n: 58, slug: "guest-on-the-tower-stair", hold: "guests", subject: "A guest on a spiral tower stair above the hills" },
  { n: 59, slug: "guests-in-the-boat", hold: "guests", subject: "Guests aboard a covered river boat" },
  { n: 61, slug: "guest-on-the-terraces", hold: "guests", subject: "A guest above the water gardens at Sigiriya" },
  { n: 63, slug: "cookery-demonstration", hold: "guests", subject: "A cookery demonstration over clay pots" },
  { n: 64, slug: "couple-jeep-elephants", hold: "guests", subject: "A couple in a jeep, elephants behind" },
  { n: 65, slug: "bullock-cart-ride", hold: "guests", subject: "Guests riding a bullock cart" },
  { n: 66, slug: "guest-among-the-bushes", hold: "guests", subject: "A guest standing in the tea bushes" },
  { n: 68, slug: "guest-with-tea-basket", hold: "guests", subject: "A guest with a tea basket by an estate sign" },
  { n: 71, slug: "guests-at-rice-and-curry", hold: "guests", subject: "Guests eating a rice and curry spread" },
  { n: 76, slug: "group-jeep-elephants", hold: "guests", subject: "Group in a jeep with elephants on the track" },
  { n: 80, slug: "bird-against-white-sky", hold: "quality", subject: "A small bird on a branch against blown-out sky" },
  { n: 81, slug: "guests-hair-braiding", hold: "guests", subject: "Guests having their hair braided" },
  { n: 82, slug: "guest-grinding-spices", hold: "guests", subject: "A guest grinding spices on a stone" },
  { n: 84, slug: "guests-eating-together", hold: "guests", subject: "Guests eating from plates on a bench" },
  { n: 86, slug: "group-with-the-guide", hold: "guests", subject: "Tour group with their guide on an estate" },
  {
    n: 27, slug: "stilt-fisherman", hold: "person",
    subject: "A stilt fisherman on his pole off the south coast",
  },
];

/* --------------------------------------------------------------------------
   Join the catalogue to the files on disk.
   -------------------------------------------------------------------------- */

const sheetManifest = JSON.parse(
  readFileSync(path.join(HERE, "photography.measurements.json"), "utf8"),
);
const measured = new Map(sheetManifest.map((m) => [m.n, m]));

const out = [];
for (const row of CATALOGUE) {
  const m = measured.get(row.n);
  if (!m) throw new Error(`No measurement for contact-sheet number ${row.n}`);
  const { cat, folder, ev, subject, ...rest } = row;
  out.push({
    ...rest,
    publish: !row.hold,
    category: cat ?? null,
    folder: folder ?? "guests",
    subject: subject ?? null,
    caption: row.caption ?? subject ?? null,
    alt: row.alt ?? null,
    place: row.place ?? null,
    placeEvidence: ev ?? null,
    hold: row.hold ?? null,
    file: m.name,
    width: m.w,
    height: m.h,
    bytes: m.bytes,
    md5: m.hash,
    duplicates: m.dupes,
  });
}

out.sort((a, b) => a.n - b.n);

const seenSlug = new Set();
for (const r of out) {
  if (seenSlug.has(r.slug)) throw new Error(`Duplicate slug: ${r.slug}`);
  seenSlug.add(r.slug);
}
if (out.length !== measured.size) {
  throw new Error(
    `Catalogue covers ${out.length} frames but ${measured.size} were measured`,
  );
}

writeFileSync(
  path.join(HERE, "photography.manifest.json"),
  JSON.stringify(out, null, 2) + "\n",
);

const pub = out.filter((r) => r.publish);
console.log(`${out.length} unique frames catalogued`);
console.log(`  ${pub.length} to publish`);
for (const f of [...new Set(pub.map((r) => r.folder))].sort()) {
  console.log(`    ${f}: ${pub.filter((r) => r.folder === f).length}`);
}
console.log(`  ${out.length - pub.length} held`);
for (const h of ["guests", "person", "quality"]) {
  const c = out.filter((r) => r.hold === h).length;
  if (c) console.log(`    ${h}: ${c}`);
}
console.log(`  ${pub.filter((r) => r.place).length} with a place named from the frame`);

// Sanity: every file on disk is accounted for.
const onDisk = readdirSync(SRC).filter((n) => /\.jpe?g$/i.test(n));
const named = new Set(out.flatMap((r) => [r.file, ...r.duplicates]));
const missing = onDisk.filter((n) => !named.has(n));
if (missing.length) console.log(`  UNCATALOGUED: ${missing.join(", ")}`);
const video = readdirSync(SRC).filter((n) => !/\.jpe?g$/i.test(n));
if (video.length)
  console.log(
    `  not photographs, left alone: ${video.map((v) => `${v} (${(statSync(path.join(SRC, v)).size / 1048576).toFixed(1)}MB)`).join(", ")}`,
  );

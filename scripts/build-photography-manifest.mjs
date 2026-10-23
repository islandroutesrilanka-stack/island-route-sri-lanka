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
   hold     why it is not published: guests | person | quality | wardrobe
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

  // ---- Released: the frames with guests in them ---------------------------
  //
  // Held until the operator cleared them, then written up the same way as
  // every other row: by looking at the frame. Captions say "travellers"
  // rather than naming anyone, which is the most a consent release of this
  // kind can honestly carry.

  // On the road
  {
    n: 2, slug: "guests-leaning-from-the-train", cat: "Journeys", folder: "journeys",
    caption: "Doors open on the hill-country line",
    alt: "Travellers leaning out of the open doorway of a blue train carriage running along a track cut into a jungle hillside",
  },
  {
    n: 4, slug: "family-portrait-roadside", cat: "Journeys", folder: "journeys",
    caption: "Gathering before the morning drive",
    alt: "A family of four standing together at a roadside stop in front of a large white building, with parked vehicles behind them",
  },
  {
    n: 5, slug: "group-with-elephant", cat: "Journeys", folder: "journeys",
    caption: "The group meets an elephant on the track",
    alt: "A line of about ten travellers standing beside a standing elephant on a dirt track under coconut palms",
  },
  {
    n: 6, slug: "elephant-back-ride", cat: "Journeys", folder: "journeys",
    caption: "Riding out on an elephant's back",
    alt: "Two travellers seated on the neck and back of an elephant on a sandy track, with palms and hills behind",
  },
  {
    n: 12, slug: "guest-under-elephant-trunk", cat: "Journeys", folder: "journeys",
    caption: "A trunk raised overhead",
    alt: "A traveller standing with his arms up beneath the curled trunk of an elephant on a forest track",
  },
  {
    n: 14, slug: "couple-with-elephant", cat: "Journeys", folder: "journeys",
    caption: "Standing with an elephant on the forest track",
    alt: "Two travellers standing either side of an elephant lifting its trunk, on a red dirt track in the forest",
  },
  {
    n: 23, slug: "guest-paddling", cat: "Journeys", folder: "journeys",
    caption: "Out on the water with a single paddle",
    alt: "A traveller seated in a green kayak on a flooded plain, lifting a wooden paddle, drowned trees along the far bank",
  },
  {
    n: 24, slug: "guests-bathing-elephant", cat: "Journeys", folder: "journeys",
    caption: "Washing an elephant in the river",
    alt: "Two travellers standing waist-deep in a brown river beside an elephant lying in the shallows, scrubbing its head",
  },
  {
    n: 29, slug: "group-jeep-selfie", cat: "Journeys", folder: "journeys",
    caption: "From the back of the jeep, somewhere past the gate",
    alt: "Four travellers crowded into the open back of a safari jeep on a grass track, an elephant grazing in the scrub behind",
  },
  {
    n: 31, slug: "couple-on-elephant", cat: "Journeys", folder: "journeys",
    caption: "Up on the elephant, the mahout alongside",
    alt: "Two travellers sitting on an elephant's back while its mahout stands beside it on bare ground, coconut palms behind",
  },
  {
    n: 51, slug: "group-on-the-rock-path", cat: "Journeys", folder: "journeys",
    caption: "Out on the open rock",
    alt: "Five travellers standing together on a bare expanse of pale rock and earth, low scrub and a watchtower behind",
  },
  {
    n: 56, slug: "guest-in-the-canoe", cat: "Journeys", folder: "journeys",
    caption: "Paddling out from under the canopy",
    alt: "A traveller paddling a narrow green and blue canoe across a wide lake, framed by the thatched roof of another boat",
  },
  {
    n: 59, slug: "guests-in-the-boat", cat: "Journeys", folder: "journeys",
    caption: "Aboard the covered boat",
    alt: "Travellers seated along the benches of a boat under a thatched roof, the water visible beyond the open side",
  },
  {
    n: 65, slug: "bullock-cart-ride", cat: "Journeys", folder: "journeys",
    caption: "A bullock cart on the village lane",
    alt: "A pale bullock drawing a two-wheeled cart with a woven canopy along a shaded lane, two travellers riding behind the driver",
  },
  {
    n: 76, slug: "group-jeep-elephants", cat: "Journeys", folder: "journeys",
    caption: "Elephants on the track ahead",
    alt: "A group of travellers crowded into a jeep looking back at the camera, two elephants standing on the track behind them",
  },

  // Heritage and craft
  {
    n: 3, slug: "guests-at-the-vatadage", cat: "Culture", folder: "heritage",
    caption: "On the steps of the Vatadage",
    alt: "Two travellers standing either side of a stone stairway up to a circular brick shrine, a seated Buddha visible between the pillars",
    place: "Polonnaruwa, Cultural Triangle",
    ev: "The circular terrace of the Polonnaruwa Vatadage, with its carved moonstone, flanking guardstones and seated Buddha.",
  },
  {
    n: 7, slug: "guests-in-the-spice-garden", cat: "Culture", folder: "heritage",
    caption: "Among the beds at the spice garden",
    alt: "Two travellers beside rows of young plants in black pots at a spice garden, one filming on a phone, a thatched shelter behind",
  },
  {
    n: 15, slug: "group-below-sigiriya", cat: "Culture", folder: "heritage",
    caption: "The whole group, and the rock behind",
    alt: "About ten travellers standing in a line on grass, a tall flat-topped rock rising out of the forest behind them",
    place: "Sigiriya, Cultural Triangle",
    ev: "The flat-topped granite monolith of Sigiriya standing alone above the surrounding forest.",
  },
  {
    n: 43, slug: "guest-weaving-palm", cat: "Culture", folder: "heritage",
    caption: "Learning to work a palm frond",
    alt: "A traveller bending over a split palm frond under a woven roof while a woman shows him how to plait it",
  },
  {
    n: 45, slug: "guest-at-dambulla", cat: "Culture", folder: "heritage",
    caption: "Below the cave temple verandah",
    alt: "A traveller standing on bare rock before a long whitewashed colonnade built under a vast overhanging granite cliff",
    place: "Dambulla, Cultural Triangle",
    ev: "The whitewashed shrine verandah of the Dambulla cave temple, built along the base of its overhanging rock.",
  },
  {
    n: 46, slug: "guest-at-the-image-house", cat: "Culture", folder: "heritage",
    caption: "Between the walls of the image house",
    alt: "A traveller at the foot of a paved approach between two towering roofless brick walls, a headless standing Buddha in the recess behind",
    place: "Polonnaruwa, Cultural Triangle",
    ev: "The Lankatilaka image house at Polonnaruwa, its two brick side walls still standing around the headless standing Buddha.",
  },
  {
    n: 49, slug: "family-sigiriya-sunrise", cat: "Culture", folder: "heritage",
    caption: "Sunrise, and the rock across the plain",
    alt: "A family of three standing on a rock outcrop with their arms raised, the sun low behind them and a flat-topped rock across the forest",
    place: "Sigiriya, Cultural Triangle",
    ev: "The flat-topped monolith of Sigiriya rising from the forest plain, seen across it at dawn.",
  },
  {
    n: 50, slug: "guest-in-the-mud-house", cat: "Culture", folder: "heritage",
    caption: "Inside the mud-walled house",
    alt: "A traveller sitting on a low earthen bench inside a house of smoothed red mud walls under a woven roof, a clay dish beside her",
  },
  {
    n: 52, slug: "group-in-the-workshop", cat: "Culture", folder: "heritage",
    caption: "At the carver's bench",
    alt: "Travellers gathered around a workbench watching a man carve a block of wood, carved masks and elephant panels hung on the wall behind",
  },
  {
    n: 54, slug: "guests-at-the-palace-ruins", cat: "Culture", folder: "heritage",
    caption: "The royal palace walls",
    alt: "Two travellers at the foot of enormous moss-streaked brick walls pierced with rows of square beam holes, a sand path running between them",
    place: "Polonnaruwa, Cultural Triangle",
    ev: "The brick walls of Parakramabahu's royal palace at Polonnaruwa, with the rows of sockets that carried its upper floors.",
  },
  {
    n: 61, slug: "guest-on-the-terraces", cat: "Culture", folder: "heritage",
    caption: "Above the water gardens",
    alt: "A traveller standing on a brick terrace high above symmetrical walled water gardens, the forest plain beyond",
    place: "Sigiriya, Cultural Triangle",
    ev: "The symmetrical walled water gardens laid out below the Sigiriya rock, seen from its terraces.",
  },
  {
    n: 81, slug: "guests-hair-braiding", cat: "Culture", folder: "heritage",
    caption: "Hair braided on the verandah",
    alt: "Three travellers seated on a wooden bench on an open verandah while two women in bright saris braid their hair",
  },

  // The table
  {
    n: 63, slug: "cookery-demonstration", cat: "Culture", folder: "table",
    caption: "The pan goes on the clay fire",
    alt: "A woman and a traveller standing over two shallow pans on a clay hearth under a thatched roof, one of oil and one of ground spice",
  },
  {
    n: 71, slug: "guests-at-rice-and-curry", cat: "Culture", folder: "table",
    caption: "Rice and curry, every bowl a different thing",
    alt: "Two travellers sitting on an earthen floor helping themselves from a dozen small clay bowls of curry and rice set out on a low bench with banana leaves",
  },
  {
    n: 82, slug: "guest-grinding-spices", cat: "Culture", folder: "table",
    caption: "Scraping coconut into the bowl",
    alt: "A traveller crouched on an earthen floor laughing as she scrapes coconut into a clay dish, rows of pots on a shelf behind her",
  },
  {
    n: 84, slug: "guests-eating-together", cat: "Culture", folder: "table",
    caption: "Lunch on the low wall",
    alt: "Three travellers sitting along a low earthen wall under a tiled roof, eating from shallow bowls held in their laps",
  },

  // Hill country
  {
    n: 8, slug: "guest-with-tea-plucker", cat: "Hills", folder: "hill-country",
    caption: "A basket on, beside the plucker",
    alt: "A traveller with a wicker tea basket strapped to her back standing shoulder to shoulder with a tea plucker among the bushes, both smiling",
  },
  {
    n: 11, slug: "couple-at-the-gap", cat: "Hills", folder: "hill-country",
    caption: "The whole valley, from the edge",
    alt: "Two travellers standing at a hilltop viewpoint with a wide green mountain valley opening out behind them",
  },
  {
    n: 19, slug: "couple-in-the-tea-field", cat: "Hills", folder: "hill-country",
    caption: "Out in the tea with a plucker",
    alt: "Two travellers in a tea field with a plucker between them, one carrying a wicker basket, rows of bushes running up the slope behind",
  },
  {
    n: 25, slug: "guest-plucking-tea", cat: "Hills", folder: "hill-country",
    caption: "Being shown which two leaves",
    alt: "A tea plucker guiding a traveller's hands to the top of a tea bush while she leans in with a basket strapped to her back",
  },
  {
    n: 30, slug: "couple-at-the-falls", cat: "Hills", folder: "hill-country",
    caption: "At the rail below the falls",
    alt: "Two travellers standing at a metal railing before a tall waterfall dropping in stages through dense green forest",
  },
  {
    n: 34, slug: "guest-and-plucker-tea", cat: "Hills", folder: "hill-country",
    caption: "Hands full, in the middle of the field",
    alt: "A tea plucker and a traveller standing waist-deep in tea bushes holding a handful of picked leaf between them, baskets on their backs",
  },
  {
    n: 41, slug: "group-on-the-estate", cat: "Hills", folder: "hill-country",
    caption: "The group on the estate road",
    alt: "About a dozen travellers standing together on a red earth track through a tea estate, several in printed sarongs and head cloths, mountains behind",
  },
  {
    n: 47, slug: "guest-on-the-falls-boulder", cat: "Hills", folder: "hill-country",
    caption: "Out on the boulder, mid-river",
    alt: "A traveller standing with his arms outstretched on a boulder in a shallow river, water running down the rock behind him between steep green walls",
  },
  {
    n: 58, slug: "guest-on-the-tower-stair", cat: "Hills", folder: "hill-country",
    caption: "Coming down the spiral stair",
    alt: "A traveller descending a narrow white spiral staircase wrapped around a tower, ridges of hill country spread out far below",
  },
  {
    n: 66, slug: "guest-among-the-bushes", cat: "Hills", folder: "hill-country",
    caption: "Standing in the tea",
    alt: "A traveller standing on a narrow path between clipped tea bushes with a wicker basket at her back, the valley and its estate buildings behind",
  },
  {
    n: 68, slug: "guest-with-tea-basket", cat: "Hills", folder: "hill-country",
    caption: "A basket, and the valley behind",
    alt: "A traveller with a wicker tea basket on her back standing in the bushes beside a round timber estate sign, hills receding behind",
    place: "Bluefield Tea Gardens, Ramboda",
    ev: "The Bluefield estate's round timber sign standing at the edge of its own tea field.",
  },
  {
    n: 86, slug: "group-with-the-guide", cat: "Hills", folder: "hill-country",
    caption: "The guide explains the field",
    alt: "A woman in a sarong talking to a group of travellers standing on a red earth track between tea bushes, forested hills behind",
  },

  // Wildlife
  {
    n: 26, slug: "raptor-in-enclosure", cat: "Wildlife", folder: "wildlife",
    caption: "A raptor on a broken branch",
    alt: "A brown raptor perched on a jagged broken branch above low green scrub, bare trees standing behind",
  },
  {
    n: 80, slug: "bird-against-white-sky", cat: "Wildlife", folder: "wildlife",
    caption: "Perched against a white sky",
    alt: "A dark bird of prey perched on a long bare branch, silhouetted against a featureless pale sky",
  },

  // Coast
  {
    n: 27, slug: "stilt-fisherman", cat: "Beaches", folder: "coast",
    caption: "A stilt fisherman on his pole",
    alt: "A fisherman perched on a crossbar lashed to a pole driven into the seabed, his rod out over the water, more poles standing empty beyond",
  },

  // ---- Held: a slogan on a shirt -----------------------------------------
  //
  // Not a consent hold. The operator cleared all forty-nine held frames, but
  // these three were held again for a reason nobody had written down, because
  // it only shows up at full size: the same guest wears a shirt with a
  // censored expletive across the chest, white and green on black, filling
  // about a third of the frame. At grid size it reads as a graphic. In the
  // lightbox, at 1100px, it reads as the word.
  //
  // Releasing one is a small edit: delete `hold` and `subject`, give it
  // `cat`, `folder`, `caption` and `alt` like any row above, and rerun.
  { n: 22, slug: "couple-jeep-elephant", hold: "wardrobe", subject: "A couple in a safari jeep, elephant behind" },
  { n: 33, slug: "couple-sigiriya-dusk", hold: "wardrobe", subject: "A couple above the canopy, Sigiriya at dusk" },
  { n: 64, slug: "couple-jeep-elephants", hold: "wardrobe", subject: "A couple in a jeep, elephants behind" },
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

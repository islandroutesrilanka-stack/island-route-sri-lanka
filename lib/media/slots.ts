import type { MediaAsset } from "./types";
import { media, fromCmsUrl } from "./registry";
import { commonsPlaces } from "./commons";
import { experienceMedia } from "./experiences";
import { experienceCategories } from "@/lib/experiences";
import { regions } from "@/lib/regions";

/**
 * Editable image slots — the pictures that are part of the layout rather than
 * part of a record.
 *
 * ── The problem this solves ────────────────────────────────────────────────
 *
 * Half the photography on this site already belongs to a row somebody can edit:
 * a tour has an `image`, so does a destination, a driver, a post. The other
 * half does not. Eight page headers, seven region tiles, twelve experience
 * categories and the closing band were all literal identifiers compiled into
 * the bundle — `image={media.elephantRockSandbar.src}` — and the only way to
 * change one was to open an editor and ship a deploy. That is fine for a
 * project the developer owns and wrong for a site the client owns.
 *
 * A slot is a named position in the design with a photograph behind it. This
 * file is the list of them; `/admin/images` is the UI over that list; the value
 * lives in the `site_settings` table the admin already writes to, under the
 * `img-` prefix, so nothing new had to be migrated and no RLS policy changed.
 *
 * ── Fallbacks are the point, not a safety net ──────────────────────────────
 *
 * Every slot names a registry asset as its default, and that default is what
 * ships. An empty database renders exactly the site the seed files describe —
 * with its alt text, its focal point, its verified provenance and its
 * dimensions — and an override replaces one picture without disturbing any of
 * that machinery. So this is not "the images moved to the CMS". It is: the
 * images have a designed default and a client who can change their mind.
 *
 * ── On verification ────────────────────────────────────────────────────────
 *
 * `verifiedLocation: true` on this site means a human confirmed the photograph
 * shows where it claims to. An override is exactly that: someone chose this
 * file, for this named slot, in an admin panel, on purpose. Marking those
 * unverified would mean every upload silently disappeared behind
 * `requireVerifiedLocation` and the client would conclude the uploader is
 * broken. The registry's rule is unchanged for assets the *code* asserts; this
 * is the one path where the assertion is made by a person at the keyboard.
 */
export type ImageSlot = {
  /** Stored as `img-<key>` in site_settings. Stable — renaming orphans a row. */
  key: string;
  label: string;
  group: string;
  /** What the picture is for, in the admin, in one line. */
  help: string;
  /** Shape the design gives this slot, so the admin can crop before uploading. */
  ratio: string;
  fallback: MediaAsset;
};

/** The prefix that separates image slots from ordinary settings rows. */
export const IMAGE_KEY_PREFIX = "img-";

const headerSlots: ImageSlot[] = [
  {
    key: "header-tours",
    label: "Journeys header",
    group: "Page headers",
    help: "Behind the title on /tours.",
    ratio: "Wide — about 16:9, 2000px or more across",
    /* Was Trincomalee: a hazy blue bay that could be anywhere warm. The Nine
       Arch Bridge is a train crossing a viaduct in tea country, which is both
       unmistakably Sri Lankan and literally a journey. */
    fallback: media.nineArchBridge,
  },
  {
    key: "header-destinations",
    label: "Destinations header",
    group: "Page headers",
    help: "Behind the title on /destinations.",
    ratio: "Wide — about 16:9, 2000px or more across",
    /* Was a dusk lagoon sandbar — dark, low-contrast and unrecognisable at
       header scale. Sigiriya is the island's signature landmark and the file
       is the largest in the registry at 2560px. */
    fallback: media.sigiriyaRock,
  },
  {
    key: "header-experiences",
    label: "Experiences header",
    group: "Page headers",
    help: "Behind the title on /experiences.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: media.mirissaCoconutHill,
  },
  {
    key: "header-services",
    label: "Services header",
    group: "Page headers",
    help: "Behind the title on /services.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: commonsPlaces.Weligama,
  },
  {
    key: "header-about",
    label: "About header",
    group: "Page headers",
    help: "Behind the title on /about.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: commonsPlaces.Polonnaruwa,
  },
  {
    key: "header-blog",
    label: "Journal header",
    group: "Page headers",
    help: "Behind the title on /blog.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: media.galleFortStreet,
  },
  {
    key: "header-gallery",
    label: "Gallery header",
    group: "Page headers",
    help: "Behind the title on /gallery.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: media.lagoonHeronSunset,
  },
  {
    key: "header-book",
    label: "Enquiry header",
    group: "Page headers",
    help: "Behind the title on /book.",
    ratio: "Wide — about 16:9, 2000px or more across",
    fallback: media.arugamBayEvening,
  },
];

const bandSlots: ImageSlot[] = [
  {
    key: "band-cta",
    label: "Closing band",
    group: "Closing band",
    help: "The panel beside “Ready when you are” at the foot of every page.",
    /* Portrait, and that is deliberate — the band puts the picture in its own
       column beside the type rather than behind it, so a tall crop fits and a
       wide one gets cut to a strip. */
    ratio: "Upright — about 2:3, 1200px or more tall",
    fallback: media.kandyTempleMoat,
  },
];

/* Region fallbacks are chosen so no two tiles on one screen repeat, and so
   none of them repeats the header of a page the tiles appear on. The North has
   no destination page and no journey yet — Jaffna stands for it honestly. */
const regionFallbacks: Record<string, MediaAsset> = {
  "cultural-triangle": commonsPlaces.Dambulla,
  "hill-country": commonsPlaces["Nuwara Eliya"],
  "south-coast": media.galleFortStreet,
  "wild-south": media.yalaLeopard,
  "east-coast": media.arugamBay,
  "west-coast": media.colomboLotusTower,
  north: commonsPlaces.Jaffna,
};

const regionSlots: ImageSlot[] = regions.map((r) => ({
  key: `region-${r.slug}`,
  label: r.name,
  group: "Regions",
  help: `Tile for ${r.name} in the region directory on /tours.`,
  ratio: "Landscape — about 4:3, 1200px or more across",
  fallback: regionFallbacks[r.slug] ?? media.sigiriyaRock,
}));

const experienceSlots: ImageSlot[] = experienceCategories.map((c) => ({
  key: `experience-${c.slug}`,
  label: c.name,
  group: "Experiences",
  help: `Card and hero for ${c.name} on /experiences.`,
  ratio: "Upright — about 4:5, 1200px or more across",
  fallback: experienceMedia[c.slug] ?? media.sigiriyaRock,
}));

export const imageSlots: ImageSlot[] = [
  ...headerSlots,
  ...bandSlots,
  ...regionSlots,
  ...experienceSlots,
];

/** Slot definitions in admin order, bucketed by their group heading. */
export const imageSlotGroups: { group: string; slots: ImageSlot[] }[] =
  imageSlots.reduce<{ group: string; slots: ImageSlot[] }[]>((acc, slot) => {
    const bucket = acc.find((g) => g.group === slot.group);
    if (bucket) bucket.slots.push(slot);
    else acc.push({ group: slot.group, slots: [slot] });
    return acc;
  }, []);

const byKey = new Map(imageSlots.map((s) => [s.key, s]));

/** Every settings row this module owns, for the admin's save payload. */
export const imageSettingKeys = imageSlots.map((s) => IMAGE_KEY_PREFIX + s.key);

/**
 * The asset behind a slot: the admin's override if there is one, the designed
 * default otherwise.
 *
 * `images` is keyed without the `img-` prefix — `getSettings` strips it, so
 * callers work in slot keys and never in storage keys.
 */
export function slotAsset(
  images: Record<string, string> | undefined,
  key: string,
): MediaAsset | null {
  const slot = byKey.get(key);
  const override = images?.[key]?.trim();
  if (!override) return slot?.fallback ?? null;
  return fromCmsUrl(override, slot?.fallback.alt ?? slot?.label ?? "", {
    depicts: slot?.fallback.depicts,
    verifiedLocation: true,
  });
}

/** Same lookup for the callers that only want a URL — `PageHeader`, `<Image>`. */
export function slotSrc(
  images: Record<string, string> | undefined,
  key: string,
): string {
  return slotAsset(images, key)?.src ?? "";
}

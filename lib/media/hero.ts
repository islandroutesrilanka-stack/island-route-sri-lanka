/**
 * Hero media resolution.
 *
 * Chain: CMS settings → typed registry → hard-coded defaults.
 *
 * The hero must never render empty. If Supabase is unreachable, a settings row
 * is missing, or a value is blank, the approved copy still appears over the
 * approved treatment. The CMS refines the hero; it cannot delete it.
 *
 * When original footage arrives, three admin fields change — hero_poster_url,
 * hero_video_url, hero_video_mobile_url — and nothing in the component or in
 * this file needs touching.
 */
import type { SiteSettings } from "@/lib/data";
import type { MediaAsset, VideoAsset, VideoSource } from "./types";
import { fromCmsUrl, assetBySrc } from "./registry";

export type HeroContent = {
  headline: string;
  subcopy: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  video: VideoAsset;
  /**
   * Ordered hero photographs. Always at least one entry when a poster or any
   * valid slide exists; empty only when nothing is configured, in which case
   * the hero falls back to its non-photographic treatment.
   */
  slides: MediaAsset[];
  slideshow: { enabled: boolean; durationMs: number };
};

/** Seconds per slide. Anything outside this is a typo, not an intention. */
const MIN_SECONDS = 3;
const MAX_SECONDS = 20;
const DEFAULT_SECONDS = 7;

/**
 * Parse the `hero_slides` setting: one slide per line,
 *
 *     /photography/file.jpg | optional alt | optional focal point
 *
 * Resolution order for each path matters. The registry is consulted FIRST, so a
 * slide inherits the alt text, focal point and — critically — the provenance
 * already recorded for that image. Only an unregistered path falls through to
 * `fromCmsUrl`, which marks it `kind: "cms"` and unverified.
 *
 * That ordering is the whole safety property: typing a path into the admin can
 * never promote an image to verified, and can never attach a `depicts` claim
 * that nobody made. An admin-supplied alt overrides the registry's wording
 * (useful, harmless); an admin-supplied path does not override its provenance.
 *
 * Malformed lines are skipped rather than thrown, because a stray character in
 * a settings textarea must never take the homepage down.
 */
function parseSlides(raw: string): MediaAsset[] {
  const out: MediaAsset[] = [];
  const seen = new Set<string>();

  for (const line of (raw ?? "").split(/\r?\n/)) {
    const [rawPath, rawAlt, rawFocal] = line.split("|").map((p) => p.trim());
    const path = rawPath ?? "";

    // Must look like a path or absolute URL; skip comments and stray text.
    if (!path || !(path.startsWith("/") || path.startsWith("http"))) continue;
    if (seen.has(path)) continue; // a slide repeating itself is always a mistake
    seen.add(path);

    const known = assetBySrc(path);
    const focal = /^\d{1,3}% \d{1,3}%$/.test(rawFocal ?? "")
      ? (rawFocal as MediaAsset["focal"])
      : undefined;

    if (known) {
      out.push({
        ...known,
        alt: rawAlt || known.alt,
        focal: focal ?? known.focal,
      });
    } else {
      const asset = fromCmsUrl(path, rawAlt || "Sri Lanka — Island Route", {
        focal: focal ?? "50% 45%",
      });
      if (asset) out.push(asset);
    }
  }
  return out;
}

/** Approved copy. These are the values that ship if the CMS says nothing. */
export const HERO_DEFAULTS = {
  headline: "Sri Lanka, Unscripted.",
  subcopy:
    "Private journeys through an island of wild landscapes, living culture and extraordinary encounters.",
  ctaPrimaryLabel: "Plan Your Journey",
  ctaPrimaryHref: "/book",
  ctaSecondaryLabel: "Explore Sri Lanka",
  ctaSecondaryHref: "#explore",
} as const;

/**
 * PLACEHOLDER FOOTAGE — REPLACE BEFORE THIS IS ADVERTISED.
 *
 * This is stock ocean video from Cloudinary's public demo cloud. It is not
 * Sri Lanka, it is not ours, and it is not a location claim — which is exactly
 * why it is allowed to sit behind the headline while a still photograph of a
 * named place would not be. The <video> is `aria-hidden` and captions nothing,
 * so nothing on the page asserts where this water is.
 *
 * To replace it: paste the real URLs into hero_video_url and
 * hero_video_mobile_url in the admin. No code changes, and this constant stops
 * being reachable the moment either field is filled in.
 *
 * webm is listed first so Chrome, Edge and Firefox take the VP9 cut (863 kB
 * desktop / 433 kB mobile); Safari falls through to the H.264 mp4. `ac_none`
 * strips the audio track — the hero is permanently muted, so shipping audio
 * would be paying for something no one can ever hear.
 */
const CLOUDINARY = "https://res.cloudinary.com/demo/video/upload";
const PLACEHOLDER_VIDEO = {
  desktop: [
    { src: `${CLOUDINARY}/q_auto:eco,w_1600,c_fill,ac_none/sea_turtle.webm`, type: "video/webm" },
    { src: `${CLOUDINARY}/q_auto:eco,w_1600,c_fill,ac_none/sea_turtle.mp4`, type: "video/mp4" },
  ],
  mobile: [
    { src: `${CLOUDINARY}/q_auto:eco,w_900,c_fill,ac_none/sea_turtle.webm`, type: "video/webm" },
    { src: `${CLOUDINARY}/q_auto:eco,w_900,c_fill,ac_none/sea_turtle.mp4`, type: "video/mp4" },
  ],
} as const satisfies Record<string, readonly VideoSource[]>;

/** Infer the MIME type from the file extension; default to mp4. */
function toSource(url: string): VideoSource {
  return url.toLowerCase().endsWith(".webm")
    ? { src: url, type: "video/webm" }
    : { src: url, type: "video/mp4" };
}

/**
 * Resolve one hero video field.
 *
 * Three states, because two are not enough. A blank field means "nobody has
 * said anything", which must not read as "the owner wants no video" — that is
 * the state a fresh install and a half-filled settings row are both in, and
 * both should get the designed hero. Turning the video off is a decision, so
 * it takes a word: type `none` in the admin field.
 */
function sourcesFrom(
  url: string | undefined,
  fallback: readonly VideoSource[]
): VideoSource[] {
  const clean = (url ?? "").trim();
  if (!clean) return [...fallback];
  if (clean.toLowerCase() === "none") return [];
  return [toSource(clean)];
}

export function resolveHero(s: SiteSettings): HeroContent {
  const posterUrl = (s.heroPosterUrl ?? "").trim();

  /*
   * No poster configured → poster is null and the hero renders its
   * non-photographic treatment. This is deliberate, not a failure state: no
   * unverified photograph has been approved yet, and an abstract hero is a
   * defensible design choice where a wrong photograph is not.
   */
  const poster: MediaAsset | null = posterUrl
    ? fromCmsUrl(
        posterUrl,
        (s.heroPosterAlt ?? "").trim() ||
          "Sri Lanka — private journeys with Island Route",
        { focal: "50% 45%" }
      )
    : null;

  /*
    Slides fall back to the single poster, so every earlier behaviour still
    holds: no slides + no poster → no photography → gradient treatment.
  */
  const parsed = parseSlides(s.heroSlides ?? "");
  const slides = parsed.length > 0 ? parsed : poster ? [poster] : [];

  const enabled = (s.heroSlideshowEnabled ?? "").trim().toLowerCase() !== "false";
  const rawSeconds = Number.parseFloat((s.heroSlideDuration ?? "").trim());
  const seconds = Number.isFinite(rawSeconds)
    ? Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, rawSeconds))
    : DEFAULT_SECONDS;

  return {
    headline: (s.heroHeadline ?? "").trim() || HERO_DEFAULTS.headline,
    subcopy: (s.heroSubcopy ?? "").trim() || HERO_DEFAULTS.subcopy,
    ctaPrimary: {
      label: (s.heroCtaPrimaryLabel ?? "").trim() || HERO_DEFAULTS.ctaPrimaryLabel,
      href: (s.heroCtaPrimaryHref ?? "").trim() || HERO_DEFAULTS.ctaPrimaryHref,
    },
    ctaSecondary: {
      label:
        (s.heroCtaSecondaryLabel ?? "").trim() || HERO_DEFAULTS.ctaSecondaryLabel,
      href: (s.heroCtaSecondaryHref ?? "").trim() || HERO_DEFAULTS.ctaSecondaryHref,
    },
    video: {
      poster,
      sources: sourcesFrom(s.heroVideoUrl, PLACEHOLDER_VIDEO.desktop),
      /*
        Mobile gets its own cut rather than the desktop file scaled down in the
        decoder, and rather than nothing at all. The narrower encode is roughly
        half the bytes, and every gate in VideoHero — Save-Data, sub-4g,
        reduced-motion, a hidden tab, a remembered pause — still has to pass
        before any of them are requested.
      */
      mobileSources: sourcesFrom(s.heroVideoMobileUrl, PLACEHOLDER_VIDEO.mobile),
    },
    slides,
    slideshow: {
      // A slideshow of one is a still image; disable it rather than run a
      // timer that cross-fades an image with itself.
      enabled: enabled && slides.length > 1,
      durationMs: seconds * 1000,
    },
  };
}

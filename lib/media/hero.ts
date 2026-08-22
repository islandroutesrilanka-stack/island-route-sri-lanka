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
 * The default hero film.
 *
 * This is the owner's own footage of Sri Lanka, hosted in the project's
 * Supabase storage bucket. It replaced stock placeholder video, so the earlier
 * caveat no longer applies: the hero may now legitimately be read as depicting
 * Sri Lanka, because it does. The <video> stays `aria-hidden` — it is
 * atmosphere behind the headline, not content the page asserts anything about.
 *
 * One H.264 mp4, no webm cut. Every browser that can autoplay a muted
 * background video plays H.264, so a second encode would only save bytes, and
 * there is no transcoding step in this pipeline to produce one honestly.
 *
 * Measured, and the reason the hero holds its poster for a while: this is a
 * FRAGMENTED mp4. The `moov` at byte 36 is only 1.4 KB and carries no sample
 * tables, followed by a long moof/mdat chain with no `sidx` index. A plain
 * <video> has no manifest to read, so the demuxer must walk that chain before
 * it can report a duration, and over a network every hop is another ranged
 * round-trip. Against Supabase that is 26 sequential range requests and about
 * 10.5s before `loadedmetadata`, putting first frame near 11-12s. The very
 * same bytes served locally reach metadata in 37ms and first frame in 2.3s
 * over 6 requests. So the encode, the connection and this code are all fine —
 * it is the container shape. Once running, playback is clean: zero `waiting`,
 * `stalled` or `error` events.
 *
 * The remedy is a re-upload, not a code change. Export (or remux) as an
 * ordinary progressive mp4, so the sample tables sit in one front-loaded
 * `moov` and the demuxer needs a single read:
 *
 *     ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4
 *
 * Two storage-layer wins worth taking at the same time. Supabase serves this
 * object `Cache-Control: no-cache`, so re-uploading with a `cacheControl`
 * value lets repeat visitors revalidate instead of refetching; and a narrower,
 * shorter cut pasted into hero_video_mobile_url spares phones the full
 * 21.6 MB. Neither is reachable from application code.
 *
 * Spaces in the object name are percent-encoded and the comma is left literal,
 * which is what RFC 3986 permits in a path segment. Do not run this through
 * `encodeURI` on the way to the <source> tag — that would turn `%20` into
 * `%2520` and 404.
 *
 * To replace it: paste new URLs into hero_video_url and hero_video_mobile_url
 * in the admin. No code changes, and this constant stops being reachable the
 * moment either field is filled in.
 */
const SUPABASE_MEDIA =
  "https://weiwhqhvtdpcwzdwlazd.supabase.co/storage/v1/object/public/media";
const DEFAULT_VIDEO = {
  desktop: [
    { src: `${SUPABASE_MEDIA}/Sri%20Lanka,%20Your%20Destination%20for%202026.mp4`, type: "video/mp4" },
  ],
  /*
    Phones are served the same file, because there is only one. The gates in
    VideoHero still stand in front of it — Save-Data, anything below 4g,
    reduced motion, a hidden tab and a remembered pause all skip the request
    entirely — but a 4g phone will download the full 21.6 MB. That is the
    strongest argument for putting a narrower encode in hero_video_mobile_url.
  */
  mobile: [
    { src: `${SUPABASE_MEDIA}/Sri%20Lanka,%20Your%20Destination%20for%202026.mp4`, type: "video/mp4" },
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
      sources: sourcesFrom(s.heroVideoUrl, DEFAULT_VIDEO.desktop),
      /*
        Mobile gets its own cut rather than the desktop file scaled down in the
        decoder, and rather than nothing at all. The narrower encode is roughly
        half the bytes, and every gate in VideoHero — Save-Data, sub-4g,
        reduced-motion, a hidden tab, a remembered pause — still has to pass
        before any of them are requested.
      */
      mobileSources: sourcesFrom(s.heroVideoMobileUrl, DEFAULT_VIDEO.mobile),
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

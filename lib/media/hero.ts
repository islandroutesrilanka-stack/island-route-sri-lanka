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
  ctaSecondaryLabel: "See the journeys",
  ctaSecondaryHref: "#journeys",
} as const;

/**
 * The default hero film and its poster.
 *
 * Both are the owner's own footage of Sri Lanka, in the project's Supabase
 * storage bucket. The hero may legitimately be read as depicting Sri Lanka,
 * because it does. The <video> stays `aria-hidden` regardless — it is
 * atmosphere behind the headline, not content the page asserts anything about.
 *
 * The poster is the film's exact first frame, and that is the whole trick
 * behind a seamless start. The poster paints immediately as the LCP element;
 * the video fades in on top of it. Because the two images are identical, the
 * handoff has nothing to reveal — no black frame, no cut, no jump. That only
 * holds while their geometry matches, which is why POSTER_FOCAL below is
 * shared with the <video> rather than being an image-only concern.
 *
 * Two H.264 cuts of the one film — 1080p for desktop, 720p for phones — and
 * no webm. Every browser that can autoplay a muted background video plays
 * H.264, so a webm would only save bytes, and there is no transcoding step in
 * this pipeline to produce one honestly. The two cuts are the same 81.3s
 * timeline at the same 16:9 aspect, which is the condition under which a
 * single poster can be the first frame of both.
 *
 * This mp4 is progressive, not fragmented: a 44 KB `moov` carrying real sample
 * tables sits at byte 24, ahead of the media data. The demuxer reads it once
 * and knows the duration, which is what the earlier fragmented cut could not
 * do — that one cost 26 sequential range requests and ~10.5s before
 * `loadedmetadata`. Keep any replacement progressive:
 *
 *     ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4
 *
 * One cost remains, and it is not reachable from application code: Supabase
 * serves all three objects `Cache-Control: no-cache`, so re-uploading with a
 * `cacheControl` value lets repeat visitors revalidate instead of refetching.
 * The poster is the one that stings there, because it is on the LCP path.
 *
 * Spaces are percent-encoded and the rest is left literal, which is what RFC
 * 3986 permits in a path segment. Do not run these through `encodeURI` on the
 * way out — that would turn `%20` into `%2520` and 404.
 *
 * To replace any of it: paste new URLs into hero_poster_url, hero_video_url
 * and hero_video_mobile_url in the admin. No code changes, and these constants
 * stop being reachable the moment the matching field is filled in.
 */
const SUPABASE_MEDIA =
  "https://weiwhqhvtdpcwzdwlazd.supabase.co/storage/v1/object/public/media";

const DEFAULT_POSTER_URL = `${SUPABASE_MEDIA}/Sequence%2001.0_00.Still001.jpg`;

/**
 * Dead centre, and deliberately not the 50% 45% used for ordinary hero
 * photography. A film frame is already composed; nudging it up crops it
 * differently from the <video> painted over it, and the handoff that should be
 * invisible becomes a visible shift. Whatever this is, the video gets it too.
 */
const POSTER_FOCAL = "50% 50%" as const;

const DEFAULT_VIDEO = {
  desktop: [
    { src: `${SUPABASE_MEDIA}/Sequence%2001_1.mp4`, type: "video/mp4" },
  ],
  /*
    The same film at 720p with the audio track dropped: 10.1 MB against the
    desktop cut's 43.2 MB, for a file nothing on a phone can tell apart from
    the original at that size. Audio costs bytes for nothing here — the hero
    is `muted` and has no control that could unmute it.

    Same 81.3s cut and the same 16:9 frame, which is what lets one poster serve
    both. A shorter edit or a re-frame would need its own first-frame still, or
    the seamless start silently becomes a cut on phones only.

    The VideoHero gates still stand in front of this — Save-Data, anything
    below 4g, reduced motion, a hidden tab and a remembered pause all skip the
    request entirely — so 10.1 MB is the worst case for a phone that wants
    the video, not the typical one.
  */
  mobile: [
    { src: `${SUPABASE_MEDIA}/Sequence%2001.mp4`, type: "video/mp4" },
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
  const rawPoster = (s.heroPosterUrl ?? "").trim();

  /*
   * Same three states as the video fields, and for the same reason. Blank is
   * "nobody has said anything", which a fresh install and a half-filled
   * settings row are both in — both should get the designed hero, so blank
   * means the default poster. Typing `none` is a decision, and returns the
   * hero to its non-photographic contour treatment. That is a designed
   * surface, not a failure state.
   *
   * A pasted poster keeps the film's focal point rather than the 50% 45% used
   * elsewhere, because whatever sits here is composited against the video and
   * has to be cropped the same way it is.
   */
  const posterUrl = rawPoster.toLowerCase() === "none" ? "" : rawPoster || DEFAULT_POSTER_URL;

  const poster: MediaAsset | null = posterUrl
    ? fromCmsUrl(
        posterUrl,
        (s.heroPosterAlt ?? "").trim() ||
          "Sri Lanka — private journeys with Island Route",
        { focal: POSTER_FOCAL }
      )
    : null;

  const sources = sourcesFrom(s.heroVideoUrl, DEFAULT_VIDEO.desktop);
  const mobileSources = sourcesFrom(s.heroVideoMobileUrl, DEFAULT_VIDEO.mobile);

  /*
    Two different heroes, and which one applies is decided by whether a film is
    configured at all.

    With a film, the still layer is the poster alone. The poster is that film's
    first frame, so the video arrives over an identical image and the handoff
    cannot be seen. Running the photo slideshow underneath instead would put a
    different photograph on screen at the moment the video fades in, which
    turns an invisible start into a visible cut — and those photographs would
    be downloaded on every visit only to end up behind an opaque video, still
    cross-fading where nobody can see them.

    With the film switched off (`none`, or no sources configured), the
    slideshow is the hero and runs exactly as before.

    This is decided here, from settings, rather than from whether the video
    actually ends up playing. The runtime gates in VideoHero — Save-Data,
    sub-4g, reduced motion, a hidden tab, a remembered pause — are client-only
    and resolve after paint, so keying off them would change the LCP image
    during hydration. Failing a gate leaves the film's first frame on screen as
    a still, which is a designed hero rather than a degraded one.
  */
  const parsed = parseSlides(s.heroSlides ?? "");
  const hasFilm = sources.length > 0 || mobileSources.length > 0;
  const slides =
    hasFilm && poster
      ? [poster]
      : parsed.length > 0
        ? parsed
        : poster
          ? [poster]
          : [];

  const enabled = (s.heroSlideshowEnabled ?? "").trim().toLowerCase() !== "false";
  const rawSeconds = Number.parseFloat((s.heroSlideDuration ?? "").trim());
  const seconds = Number.isFinite(rawSeconds)
    ? Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, rawSeconds))
    : DEFAULT_SECONDS;

  const secondaryLabel =
    (s.heroCtaSecondaryLabel ?? "").trim() || HERO_DEFAULTS.ctaSecondaryLabel;

  return {
    headline: (s.heroHeadline ?? "").trim() || HERO_DEFAULTS.headline,
    subcopy: (s.heroSubcopy ?? "").trim() || HERO_DEFAULTS.subcopy,
    ctaPrimary: {
      label: (s.heroCtaPrimaryLabel ?? "").trim() || HERO_DEFAULTS.ctaPrimaryLabel,
      href: (s.heroCtaPrimaryHref ?? "").trim() || HERO_DEFAULTS.ctaPrimaryHref,
    },
    // The hero renders one button; this is the quiet text link beside it, and
    // `none` removes it so the hero can be left with a single call to action.
    // Same sentinel the video and poster fields use, rather than a second
    // convention for the same idea.
    ctaSecondary: {
      label: secondaryLabel.toLowerCase() === "none" ? "" : secondaryLabel,
      href: (s.heroCtaSecondaryHref ?? "").trim() || HERO_DEFAULTS.ctaSecondaryHref,
    },
    video: { poster, sources, mobileSources },
    slides,
    slideshow: {
      // A slideshow of one is a still image; disable it rather than run a
      // timer that cross-fades an image with itself.
      enabled: enabled && slides.length > 1,
      durationMs: seconds * 1000,
    },
  };
}

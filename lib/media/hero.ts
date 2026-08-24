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

/**
 * One complete hero set: a film, its phone cut, and the film's own first frame.
 *
 * The three travel together and are never mixed. The seamless start depends on
 * the still being the exact frame the video opens on, so pairing one set's
 * poster with another set's film turns an invisible handoff into a visible cut.
 */
export type HeroMediaSet = {
  id: string;
  posterUrl: string;
  desktopUrl: string;
  mobileUrl: string;
};

/**
 * A resolved set, in the shape the hero actually renders.
 *
 * Deliberately an alias rather than its own object type: a variant and the
 * hero's own `video` are the same three things, and giving them two
 * declarations would let them drift apart one field at a time.
 */
export type HeroVariant = VideoAsset;

export type HeroContent = {
  headline: string;
  subcopy: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  video: VideoAsset;
  /**
   * The sets this hero may rotate between, one picked per visit in the browser.
   * Index 0 is the one rendered on the server, so it is also what a visitor
   * with JavaScript off keeps.
   *
   * Empty when there is nothing to rotate — the film is switched off, or an
   * admin has pinned the media by hand — and the hero then simply renders
   * `video`, exactly as it did before rotation existed.
   */
  variants: HeroVariant[];
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

/** Everything below lives in the project's own Supabase storage bucket. */
const SUPABASE_MEDIA =
  "https://weiwhqhvtdpcwzdwlazd.supabase.co/storage/v1/object/public/media";

/**
 * Dead centre, and deliberately not the 50% 45% used for ordinary hero
 * photography. A film frame is already composed; nudging it up crops it
 * differently from the <video> painted over it, and the handoff that should be
 * invisible becomes a visible shift. Whatever this is, the video gets it too.
 */
const POSTER_FOCAL = "50% 50%" as const;

/**
 * The hero sets, and why there is more than one.
 *
 * All of this is the owner's own footage of Sri Lanka. The hero may
 * legitimately be read as depicting Sri Lanka, because it does. The <video>
 * stays `aria-hidden` regardless — it is atmosphere behind the headline, not
 * content the page asserts anything about.
 *
 * One set is chosen at random per visit. The choice is made in the browser
 * after hydration, not here, because this page is statically rendered and
 * revalidated on a timer: a `Math.random()` on the server would be baked into
 * the HTML and would change once a minute rather than once a visit. See the
 * swap in VideoHero for how the two posters hand over without a gap.
 *
 * What is actually in the bucket, read from the files themselves rather than
 * from an export preset:
 *
 *     set                  desktop           mobile           poster      run
 *     islandroute-hero     1920x1080 43.2MB  1280x720 10.8MB  1920x1080  57.6s
 *     islandroute-hero-1   1920x1080 39.6MB  1280x720  9.9MB  1920x1080  53.0s
 *
 * Every file in both sets is 16:9. That is the condition under which one focal
 * point can serve all of them — a set at another aspect would need its own
 * crop, or the still and the film would drift apart at the edges and the
 * dissolve would show it.
 *
 * Both cuts of both films are progressive rather than fragmented: a `moov`
 * carrying real sample tables sits at byte 24, ahead of the media data, so the
 * demuxer reads it once and knows the duration. An earlier fragmented cut could
 * not do that and cost 26 sequential range requests and ~10.5s before
 * `loadedmetadata`. Keep any replacement progressive:
 *
 *     ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4
 *
 * H.264 only, and no audio track anywhere. Every browser that can autoplay a
 * muted background video plays H.264, so a webm would only save bytes and there
 * is no honest transcoding step in this pipeline to produce one; and the hero is
 * `muted` with no control that could unmute it, so an audio track would cost
 * bytes for nothing.
 *
 * The 720p cuts matter more than the ratio suggests. The VideoHero gates stand
 * in front of both — Save-Data, anything below 4g, reduced motion, a hidden tab
 * and a remembered pause all skip the request entirely — so ~10 MB is the worst
 * case for a phone that wants the film, not the typical one.
 *
 * The `%20` in the second set's names is a real space in the filename. It
 * survives the round trip through next/image and the <video> element, which is
 * why it is written encoded here rather than raw; still, prefer plain names for
 * anything uploaded later, so nothing downstream has to be careful.
 *
 * To add a third set, add a third entry — nothing else changes. To pin the hero
 * to one film, paste its three URLs into hero_video_url, hero_video_mobile_url
 * and hero_poster_url in the admin: that switches the rotation off, because a
 * hand-picked poster and a randomly chosen film are not the same shot.
 */
const HERO_MEDIA_SETS = [
  {
    id: "islandroute-hero",
    posterUrl: `${SUPABASE_MEDIA}/islandroute-hero-poster.jpg`,
    desktopUrl: `${SUPABASE_MEDIA}/islandroute-hero-desktop.mp4`,
    mobileUrl: `${SUPABASE_MEDIA}/islandroute-hero-mobile.mp4`,
  },
  {
    id: "islandroute-hero-1",
    posterUrl: `${SUPABASE_MEDIA}/islandroute-hero-poster%201.jpg`,
    desktopUrl: `${SUPABASE_MEDIA}/islandroute-hero-desktop%201.mp4`,
    mobileUrl: `${SUPABASE_MEDIA}/islandroute-hero-mobile%201.mp4`,
  },
] as const satisfies readonly HeroMediaSet[];

/**
 * The set the server renders, and the fallback behind every admin field. It is
 * first in the list rather than special-cased, so "what ships with nothing
 * configured" and "what a no-JavaScript visitor sees" are the same thing.
 */
const DEFAULT_SET = HERO_MEDIA_SETS[0];

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
  fallback: readonly VideoSource[],
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
  const posterUrl =
    rawPoster.toLowerCase() === "none"
      ? ""
      : rawPoster || DEFAULT_SET.posterUrl;

  const posterAlt =
    (s.heroPosterAlt ?? "").trim() ||
    "Sri Lanka — private journeys with Island Route";

  const poster: MediaAsset | null = posterUrl
    ? fromCmsUrl(posterUrl, posterAlt, { focal: POSTER_FOCAL })
    : null;

  const sources = sourcesFrom(s.heroVideoUrl, [
    toSource(DEFAULT_SET.desktopUrl),
  ]);
  const mobileSources = sourcesFrom(s.heroVideoMobileUrl, [
    toSource(DEFAULT_SET.mobileUrl),
  ]);

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

  /*
    Whether this hero is allowed to rotate at all.

    Rotation is the default, and filling in any one of the three media fields
    turns it off. That asymmetry is deliberate: those fields are the only way an
    owner can say "show this film", and a rotation that overrode them half the
    time would make the admin look broken. It also protects the seamless start,
    since a pasted poster is the first frame of the pasted film and of nothing
    else.

    `none` counts as pinned too — it is the field being used, to say there
    should be no film — and `hasFilm` is false in that case anyway, which leaves
    the photo slideshow as the hero and nothing to rotate between.
  */
  const pinned = [s.heroPosterUrl, s.heroVideoUrl, s.heroVideoMobileUrl].some(
    (v) => (v ?? "").trim() !== "",
  );
  const variants: HeroVariant[] =
    hasFilm && !pinned
      ? HERO_MEDIA_SETS.map((set) => ({
          poster: fromCmsUrl(set.posterUrl, posterAlt, { focal: POSTER_FOCAL }),
          sources: [toSource(set.desktopUrl)],
          mobileSources: [toSource(set.mobileUrl)],
        }))
      : [];
  const slides =
    hasFilm && poster
      ? [poster]
      : parsed.length > 0
        ? parsed
        : poster
          ? [poster]
          : [];

  const enabled =
    (s.heroSlideshowEnabled ?? "").trim().toLowerCase() !== "false";
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
      label:
        (s.heroCtaPrimaryLabel ?? "").trim() || HERO_DEFAULTS.ctaPrimaryLabel,
      href: (s.heroCtaPrimaryHref ?? "").trim() || HERO_DEFAULTS.ctaPrimaryHref,
    },
    // The hero renders one button; this is the quiet text link beside it, and
    // `none` removes it so the hero can be left with a single call to action.
    // Same sentinel the video and poster fields use, rather than a second
    // convention for the same idea.
    ctaSecondary: {
      label: secondaryLabel.toLowerCase() === "none" ? "" : secondaryLabel,
      href:
        (s.heroCtaSecondaryHref ?? "").trim() || HERO_DEFAULTS.ctaSecondaryHref,
    },
    video: { poster, sources, mobileSources },
    variants,
    slides,
    slideshow: {
      // A slideshow of one is a still image; disable it rather than run a
      // timer that cross-fades an image with itself.
      enabled: enabled && slides.length > 1,
      durationMs: seconds * 1000,
    },
  };
}

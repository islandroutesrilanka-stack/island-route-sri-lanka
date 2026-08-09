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
import { fromCmsUrl } from "./registry";

export type HeroContent = {
  headline: string;
  subcopy: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  video: VideoAsset;
};

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

/** Infer the MIME type from the file extension; default to mp4. */
function toSource(url: string): VideoSource {
  return url.toLowerCase().endsWith(".webm")
    ? { src: url, type: "video/webm" }
    : { src: url, type: "video/mp4" };
}

function sourcesFrom(url: string | undefined): VideoSource[] {
  const clean = (url ?? "").trim();
  return clean ? [toSource(clean)] : [];
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
      // Empty at launch by decision. Populating hero_video_url in the admin is
      // all that is required to turn the cinematic hero on.
      sources: sourcesFrom(s.heroVideoUrl),
      // Empty by decision — mobile uses the poster only.
      mobileSources: sourcesFrom(s.heroVideoMobileUrl),
    },
  };
}

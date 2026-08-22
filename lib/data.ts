/**
 * Public data layer.
 * Reads from Supabase when configured AND the table has published rows;
 * otherwise falls back to the built-in starter content in lib/.
 * Public pages revalidate every 60s, so admin edits appear within a minute.
 *
 * Every public getter is wrapped in React.cache, which memoises the result for
 * the lifetime of a single server render. Without it, a page that reads site
 * settings in generateMetadata and again in the layout makes two round trips
 * for identical data — and the homepage, which reads five collections, would
 * re-query on every component that needed them.
 */
import { cache } from "react";
import { getAnonSupabase } from "./supabase/server";
import { tours as seedTours, type Tour } from "./tours";
import {
  destinations as seedDestinations,
  type Destination,
} from "./destinations";
import {
  services as seedServices,
  fleet as seedFleet,
  reviews as seedReviews,
  gallery as seedGallery,
  type Service,
  type Vehicle,
  type Review,
  type GalleryItem,
} from "./content";
import { posts as seedPosts, type Post } from "./blog";
import { assetBySrc } from "./media/registry";
import { isLocationVerified } from "./media/types";
import { site as seedSite } from "./site";

/**
 * How long any single public content query may take before we give up and
 * serve the built-in fallback content instead.
 *
 * This matters more than it looks. The try/catch below was written to make the
 * site survive an unavailable backend — but a catch block cannot rescue you
 * from a request that never settles. Without an explicit deadline, an
 * unreachable or slow Supabase does not trigger the fallback; it stalls page
 * generation indefinitely, which turns a degraded backend into a failed build
 * or a hung request. Six seconds is generous for a query returning tens of
 * rows and still well inside any sensible serverless budget.
 */
const QUERY_TIMEOUT_MS = 6000;

async function fromTable<Row, T>(
  table: string,
  fallback: T[],
  map: (r: Row) => T,
  opts: { published?: boolean; order?: string } = { published: true, order: "sort" }
): Promise<T[]> {
  const sb = getAnonSupabase();
  if (!sb) return fallback;
  try {
    let q = sb.from(table).select("*");
    if (opts.published !== false) q = q.eq("published", true);
    if (opts.order) q = q.order(opts.order, { ascending: true });
    const { data, error } = await q.abortSignal(
      AbortSignal.timeout(QUERY_TIMEOUT_MS)
    );
    if (error || !data || data.length === 0) return fallback;
    return (data as Row[]).map(map);
  } catch {
    // Unreachable, slow, or misconfigured backend — serve seed content rather
    // than an error page. The site stays up; the admin sees stale data.
    return fallback;
  }
}

/* ---------------------------------- Tours ---------------------------------- */

type TourRow = {
  slug: string; title: string; category: Tour["category"]; duration: string | null;
  /* `price_from` is still a column, and is deliberately not read. The fixed
     per-person package price was retired when pricing moved to the transport
     day rate (lib/pricing.ts); leaving the column in place keeps historic rows
     intact, but nothing may render it. */
  image: string | null; excerpt: string | null;
  highlights: string[] | null; includes: string[] | null;
  itinerary: Tour["itinerary"] | null; featured: boolean;
  /**
   * Optional. No such column exists yet — `select("*")` simply omits it, which
   * yields undefined and an empty link list. Adding a `destination_slugs jsonb`
   * column later starts populating this with no code change here.
   */
  destination_slugs?: string[] | null;
  /** Optional, same as destination_slugs — no column exists yet. */
  theme_slugs?: string[] | null;
};

/** Seed tours by slug — the relationship fallback below needs random access. */
const seedTourBySlug = new Map(seedTours.map((t) => [t.slug, t]));

const mapTour = (r: TourRow): Tour => {
  /*
    Relationship fallback.

    `destination_slugs` and `theme_slugs` are columns that do not exist yet, so
    `select("*")` omits them and every tour read from Supabase arrived with an
    empty link list. That is not a cosmetic gap: those two fields are the only
    thing connecting a journey to a place or an experience, so with a live
    database the destination pages showed no journeys, the ?theme= and
    ?destination= filters matched nothing, and the /experiences axis published
    no categories at all. The seed data was carrying the whole relationship
    graph and the moment Supabase was configured it stopped being read.

    So a row that says nothing about its relationships inherits them from the
    seed tour of the same slug — authored content in this repo, taken from each
    tour's own itinerary and highlights, not guessed at. `??` is deliberate: an
    explicit `[]` from a column that DOES exist means "no links" and wins over
    the seed. Adding the columns later therefore takes over cleanly, row by row,
    with no code change here.
  */
  const seed = seedTourBySlug.get(r.slug);

  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    duration: r.duration ?? "",
    image: r.image ?? "",
    excerpt: r.excerpt ?? "",
    highlights: r.highlights ?? [],
    includes: r.includes ?? [],
    itinerary: r.itinerary ?? undefined,
    featured: r.featured,
    destinationSlugs: r.destination_slugs ?? seed?.destinationSlugs ?? [],
    themeSlugs: r.theme_slugs ?? seed?.themeSlugs ?? [],
    /* Seed-only, with no `r.` counterpart and no column planned: these are
       paths into the media registry, where the alt text and the CC attribution
       live. A CMS field holding a bare path would be a foot-gun — a typo would
       silently produce an unattributed image — so editorial extras stay in the
       repo and the CMS keeps the fields it can validate. */
    storyImages: seed?.storyImages,
  };
};

export const getTours = cache(() =>
  fromTable<TourRow, Tour>("tours", seedTours, mapTour)
);
export async function getTourBySlug(slug: string) {
  return (await getTours()).find((t) => t.slug === slug);
}
export async function getFeaturedTours() {
  return (await getTours()).filter((t) => t.featured);
}

/* ------------------------------- Destinations ------------------------------- */

type DestRow = {
  slug: string; name: string; region: string | null; headline: string | null;
  description: string | null; best_for: string[] | null; best_time: string | null;
  highlights: string[] | null; image: string | null;
};

const mapDest = (r: DestRow): Destination => ({
  slug: r.slug,
  name: r.name,
  region: r.region ?? "",
  headline: r.headline ?? "",
  description: r.description ?? "",
  bestFor: r.best_for ?? [],
  bestTime: r.best_time ?? "",
  highlights: r.highlights ?? [],
  image: r.image ?? "",
});

export const getDestinations = cache(() =>
  fromTable<DestRow, Destination>("destinations", seedDestinations, mapDest)
);
export async function getDestinationBySlug(slug: string) {
  return (await getDestinations()).find((d) => d.slug === slug);
}

/* --------------------------------- Services --------------------------------- */

type ServiceRow = {
  slug: string; name: string; tagline: string | null; description: string | null;
  image: string | null; icon: Service["icon"] | null;
};

/**
 * Services that duplicated the journey catalogue. Removed from the seed in
 * lib/content.ts, but the live Supabase `services` table was populated from
 * supabase/seed.sql and still holds these rows — so the seed edit alone would
 * change nothing in production. Filtering here closes that gap from both
 * directions and is the single place the decision lives.
 *
 * This is a denylist rather than a derivation because "duplicates a tour" is a
 * judgement about the content, not a fact present in it. If the services table
 * ever gains a published/active column, delete this and use that instead.
 */
const retiredServiceSlugs = new Set([
  "day-tours",
  "multi-day-tours",
  "safari-tours",
]);

export const getServices = cache(async () =>
  (
    await fromTable<ServiceRow, Service>("services", seedServices, (r) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline ?? "",
      description: r.description ?? "",
      image: r.image ?? "",
      icon: r.icon ?? "car",
    }))
  ).filter((s) => !retiredServiceSlugs.has(s.slug))
);

/* ---------------------------------- Fleet ----------------------------------- */

type VehicleRow = {
  slug: string; name: string; category: string | null; passengers: number | null;
  luggage: string | null; features: string[] | null; ideal_for: string | null;
  image: string | null;
};

export const getFleet = cache(() =>
  fromTable<VehicleRow, Vehicle>("vehicles", seedFleet, (r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category ?? "",
    passengers: r.passengers ?? 3,
    luggage: r.luggage ?? "",
    features: r.features ?? [],
    idealFor: r.ideal_for ?? "",
    image: r.image ?? "",
  }))
);

/* --------------------------------- Reviews ---------------------------------- */

type ReviewRow = {
  name: string; country: string | null; trip: string | null; rating: number; text: string;
};

export const getReviews = cache(() =>
  fromTable<ReviewRow, Review>("reviews", seedReviews, (r) => ({
    name: r.name,
    country: r.country ?? "",
    trip: r.trip ?? "",
    rating: r.rating,
    text: r.text,
  }))
);

/* ---------------------------------- Posts ----------------------------------- */

type PostRow = {
  slug: string; title: string; excerpt: string | null; date: string;
  read_time: string | null; image: string | null; sections: Post["sections"] | null;
};

/**
 * The seed image for a slug — the fallback of last resort for a stale row.
 *
 * Built once rather than per row; `seedPosts` is a module constant.
 */
const seedPostImages = new Map(seedPosts.map((p) => [p.slug, p.image]));

/**
 * Reject a stored image that we already know shows the wrong place.
 *
 * `public.posts.image` was seeded from the old flat image map, so live rows
 * still point at assets this project has since disowned — a limestone karst
 * captioned as the Sri Lankan highland railway, a leopard with no location
 * behind it, two generic tropical panoramas. Editing `lib/blog.ts` alone does
 * not fix that: when Supabase is configured the seed is only a fallback, so the
 * database keeps winning.
 *
 * The test is deliberately narrow. `assetBySrc` only recognises URLs that are
 * in *our* registry, so:
 *
 *   • a registry asset whose location has been verified → kept;
 *   • a registry asset that has not → replaced by the seed's choice, which has;
 *   • anything else, including every image uploaded through the admin →
 *     untouched, because we know nothing about it and guessing would silently
 *     discard the editor's work.
 *
 * That makes this self-clearing: run `supabase/update-post-images.sql` and every
 * row resolves to a verified asset, at which point this stops substituting
 * anything and can be deleted.
 */
function postImage(slug: string, stored: string | null): string {
  const src = stored ?? "";
  const known = src ? assetBySrc(src) : null;
  if (known && !isLocationVerified(known)) {
    return seedPostImages.get(slug) ?? src;
  }
  return src || (seedPostImages.get(slug) ?? "");
}

export const getPosts = cache(() =>
  fromTable<PostRow, Post>(
    "posts",
    seedPosts,
    (r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? "",
      date: r.date,
      readTime: r.read_time ?? "",
      image: postImage(r.slug, r.image),
      sections: r.sections ?? [],
    }),
    { published: true, order: "date" }
  )
);

export async function getPostBySlug(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}

/* ---------------------------------- Gallery --------------------------------- */

type GalleryRow = { src: string; caption: string | null; category: GalleryItem["category"] };

export const getGallery = cache(() =>
  fromTable<GalleryRow, GalleryItem>("gallery", seedGallery, (r) => ({
    src: r.src,
    caption: r.caption ?? "",
    category: r.category,
  }))
);

/* ------------------------------- Site settings ------------------------------ */

export type SiteSettings = {
  siteName: string;
  tagline: string;
  phoneDisplay: string;
  phoneE164: string;
  whatsappNumber: string;
  email: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;

  /* ---- Homepage hero (editable in Admin → Settings) ----
     Brand messaging can be refined without touching component code.
     Every one of these has a hard-coded default below, so a missing row or an
     unreachable backend still renders the approved hero rather than an empty band. */
  heroHeadline: string;
  heroSubcopy: string;
  heroCtaPrimaryLabel: string;
  heroCtaPrimaryHref: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryHref: string;
  /** Blank uses the film's first frame; `none` renders the contour treatment. */
  heroPosterUrl: string;
  heroPosterAlt: string;
  /** Empty by decision. Populate to enable the cinematic video hero. */
  heroVideoUrl: string;
  /** Empty by decision — mobile uses the poster only. */
  heroVideoMobileUrl: string;

  /* ---- Hero slideshow (Admin → Settings → Homepage hero) ----
     Stored as settings rows rather than a `hero_slides` table on purpose. The
     data is a short, ordered, single-tenant list with no relations and no
     independent lifecycle — a table would add a migration, RLS policies and a
     join for something a textarea expresses perfectly.

     `heroSlides` is one slide per line:

         /photography/sigiriya-rock.jpg | Sigiriya rock fortress… | 50% 45%

     path is required; alt and focal point are optional and fall back to the
     registry entry for that path, so verified provenance is never bypassed by
     typing a URL into the admin. Order in the textarea IS the running order;
     deleting a line removes the slide. */
  heroSlideshowEnabled: string;
  /** Seconds per slide. Clamped when parsed — see lib/media/hero.ts. */
  heroSlideDuration: string;
  heroSlides: string;

  /* ---- Featured journey (homepage §07) — one curated journey, no carousel ---- */
  featuredJourneySlug: string;
  featuredJourneyNote: string;
  featuredJourneyImage1: string;
  featuredJourneyImage2: string;
  featuredJourneyImage3: string;

  /* ---- Featured chauffeur-guide (homepage §06) ----
     Empty by default. Nothing is invented: with no guide configured the section
     renders the Why Island Route argument alone. */
  featuredGuideName: string;
  featuredGuideRole: string;
  featuredGuideNote: string;
  featuredGuideImage: string;
};

const defaultSettings: SiteSettings = {
  siteName: seedSite.name,
  tagline: seedSite.tagline,
  phoneDisplay: seedSite.phoneDisplay,
  phoneE164: seedSite.phoneE164,
  whatsappNumber: seedSite.whatsappNumber,
  email: seedSite.email,
  address: seedSite.address,
  seoTitle: "Island Route Sri Lanka — Private Tours & Transfers",
  seoDescription:
    "Private chauffeur-driven tours, airport transfers and tailor-made itineraries across Sri Lanka. Trusted local drivers, direct booking, 24/7 WhatsApp.",
  seoKeywords:
    "Sri Lanka tours, Sri Lanka private driver, Colombo airport transfer, Yala safari",

  // Approved brand copy. These ship whenever the CMS says nothing.
  heroHeadline: "Sri Lanka, Unscripted.",
  heroSubcopy:
    "Private journeys through an island of wild landscapes, living culture and extraordinary encounters.",
  heroCtaPrimaryLabel: "Plan Your Journey",
  heroCtaPrimaryHref: "/book",
  heroCtaSecondaryLabel: "Explore Sri Lanka",
  heroCtaSecondaryHref: "#explore",
  /*
    Blank so the hero opens on the film's own first frame — see
    DEFAULT_POSTER_URL in lib/media/hero.ts. That pairing is what makes the
    video's arrival invisible, and naming any other image here breaks it: the
    poster would be one photograph and the footage another, so the fade becomes
    a cut between two different shots.

    Sigiriya stood here before the film existed, and is still self-hosted and
    individually verified — see `media.sigiriyaRock` — if it is ever wanted
    back. `none` returns the hero to the contour treatment.
  */
  heroPosterUrl: "",
  heroPosterAlt:
    "Sri Lanka — private journeys with Island Route",
  /*
    Blank means "use the default film" rather than "no video" — see
    DEFAULT_VIDEO in lib/media/hero.ts for what ships and how it is replaced.
    `none` here or in the admin turns the video off entirely and leaves the
    poster as the hero.
  */
  heroVideoUrl: "",
  heroVideoMobileUrl: "",

  /*
    Slideshow defaults ship ON, using only landscape photographs whose location
    is verified in the media registry. Sigiriya is first and therefore the LCP
    image. Kandy and Colombo are verified but portrait (2:3) and are left out —
    a tall frame cropped to a 21:9 hero loses its subject.
  */
  heroSlideshowEnabled: "true",
  heroSlideDuration: "7",
  heroSlides: [
    "/photography/sigiriya-rock.jpg",
    "/photography/nine-arch-bridge-demodara.jpg",
    "/photography/arugam-bay.jpg",
    "/photography/mirissa-coconut-tree-hill.jpg",
    "/photography/yala-leopard.jpg",
  ].join("\n"),

  // Empty → §07 falls back to the first featured tour.
  featuredJourneySlug: "",
  featuredJourneyNote: "",
  featuredJourneyImage1: "",
  featuredJourneyImage2: "",
  featuredJourneyImage3: "",

  // Empty → §06 renders without a guide. Nothing invented.
  featuredGuideName: "",
  featuredGuideRole: "",
  featuredGuideNote: "",
  featuredGuideImage: "",
};

const settingsKeyMap: Record<string, keyof SiteSettings> = {
  site_name: "siteName",
  tagline: "tagline",
  phone_display: "phoneDisplay",
  phone_e164: "phoneE164",
  whatsapp_number: "whatsappNumber",
  email: "email",
  address: "address",
  seo_title: "seoTitle",
  seo_description: "seoDescription",
  seo_keywords: "seoKeywords",

  hero_headline: "heroHeadline",
  hero_subcopy: "heroSubcopy",
  hero_cta_primary_label: "heroCtaPrimaryLabel",
  hero_cta_primary_href: "heroCtaPrimaryHref",
  hero_cta_secondary_label: "heroCtaSecondaryLabel",
  hero_cta_secondary_href: "heroCtaSecondaryHref",
  hero_poster_url: "heroPosterUrl",
  hero_poster_alt: "heroPosterAlt",
  hero_video_url: "heroVideoUrl",
  hero_video_mobile_url: "heroVideoMobileUrl",
  hero_slideshow_enabled: "heroSlideshowEnabled",
  hero_slide_duration: "heroSlideDuration",
  hero_slides: "heroSlides",

  featured_journey_slug: "featuredJourneySlug",
  featured_journey_note: "featuredJourneyNote",
  featured_journey_image_1: "featuredJourneyImage1",
  featured_journey_image_2: "featuredJourneyImage2",
  featured_journey_image_3: "featuredJourneyImage3",

  featured_guide_name: "featuredGuideName",
  featured_guide_role: "featuredGuideRole",
  featured_guide_note: "featuredGuideNote",
  featured_guide_image: "featuredGuideImage",
};

/**
 * Read once per render. `app/layout.tsx` needs settings in both
 * `generateMetadata` and the layout body — previously two Supabase round trips
 * on literally every page view.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const sb = getAnonSupabase();
  if (!sb) return defaultSettings;
  try {
    const { data, error } = await sb
      .from("site_settings")
      .select("*")
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    if (error || !data?.length) return defaultSettings;
    const merged = { ...defaultSettings };
    for (const row of data as { key: string; value: string | null }[]) {
      const k = settingsKeyMap[row.key];
      if (k && row.value) merged[k] = row.value;
    }
    return merged;
  } catch {
    return defaultSettings;
  }
});

/* ------------------------------ Sitemap support ----------------------------- */

export type SitemapRow = { slug: string; updatedAt?: string };

/**
 * Slugs plus real modification timestamps, for sitemap.xml.
 *
 * Kept separate from the domain getters on purpose: `updated_at` is metadata
 * that no page renders, and threading it through Tour/Destination/Post would
 * pollute types that exist to describe content. Falls back to slugs with no
 * timestamp when Supabase is unconfigured or the column is absent, in which
 * case the sitemap simply omits `lastModified` rather than inventing one.
 */
export const getSitemapRows = cache(
  async (table: "tours" | "destinations" | "posts"): Promise<SitemapRow[]> => {
    const sb = getAnonSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from(table)
        .select("slug, updated_at")
        .eq("published", true)
        .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
      if (error || !data?.length) return [];
      return (data as { slug: string; updated_at: string | null }[]).map((r) => ({
        slug: r.slug,
        updatedAt: r.updated_at ?? undefined,
      }));
    } catch {
      return [];
    }
  }
);

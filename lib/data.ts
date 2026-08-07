/**
 * Public data layer.
 * Reads from Supabase when configured AND the table has published rows;
 * otherwise falls back to the built-in starter content in lib/.
 * Public pages revalidate every 60s, so admin edits appear within a minute.
 */
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
import { site as seedSite } from "./site";

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
    const { data, error } = await q;
    if (error || !data || data.length === 0) return fallback;
    return (data as Row[]).map(map);
  } catch {
    return fallback;
  }
}

/* ---------------------------------- Tours ---------------------------------- */

type TourRow = {
  slug: string; title: string; category: Tour["category"]; duration: string | null;
  price_from: number | null; image: string | null; excerpt: string | null;
  highlights: string[] | null; includes: string[] | null;
  itinerary: Tour["itinerary"] | null; featured: boolean;
};

const mapTour = (r: TourRow): Tour => ({
  slug: r.slug,
  title: r.title,
  category: r.category,
  duration: r.duration ?? "",
  priceFrom: Number(r.price_from ?? 0),
  image: r.image ?? "",
  excerpt: r.excerpt ?? "",
  highlights: r.highlights ?? [],
  includes: r.includes ?? [],
  itinerary: r.itinerary ?? undefined,
  featured: r.featured,
});

export const getTours = () => fromTable<TourRow, Tour>("tours", seedTours, mapTour);
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

export const getDestinations = () =>
  fromTable<DestRow, Destination>("destinations", seedDestinations, mapDest);
export async function getDestinationBySlug(slug: string) {
  return (await getDestinations()).find((d) => d.slug === slug);
}

/* --------------------------------- Services --------------------------------- */

type ServiceRow = {
  slug: string; name: string; tagline: string | null; description: string | null;
  image: string | null; icon: Service["icon"] | null;
};

export const getServices = () =>
  fromTable<ServiceRow, Service>("services", seedServices, (r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    image: r.image ?? "",
    icon: r.icon ?? "car",
  }));

/* ---------------------------------- Fleet ----------------------------------- */

type VehicleRow = {
  slug: string; name: string; category: string | null; passengers: number | null;
  luggage: string | null; features: string[] | null; ideal_for: string | null;
  image: string | null;
};

export const getFleet = () =>
  fromTable<VehicleRow, Vehicle>("vehicles", seedFleet, (r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category ?? "",
    passengers: r.passengers ?? 3,
    luggage: r.luggage ?? "",
    features: r.features ?? [],
    idealFor: r.ideal_for ?? "",
    image: r.image ?? "",
  }));

/* --------------------------------- Reviews ---------------------------------- */

type ReviewRow = {
  name: string; country: string | null; trip: string | null; rating: number; text: string;
};

export const getReviews = () =>
  fromTable<ReviewRow, Review>("reviews", seedReviews, (r) => ({
    name: r.name,
    country: r.country ?? "",
    trip: r.trip ?? "",
    rating: r.rating,
    text: r.text,
  }));

/* ---------------------------------- Posts ----------------------------------- */

type PostRow = {
  slug: string; title: string; excerpt: string | null; date: string;
  read_time: string | null; image: string | null; sections: Post["sections"] | null;
};

export const getPosts = () =>
  fromTable<PostRow, Post>("posts", seedPosts, (r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    date: r.date,
    readTime: r.read_time ?? "",
    image: r.image ?? "",
    sections: r.sections ?? [],
  }), { published: true, order: "date" });

export async function getPostBySlug(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}

/* ---------------------------------- Gallery --------------------------------- */

type GalleryRow = { src: string; caption: string | null; category: GalleryItem["category"] };

export const getGallery = () =>
  fromTable<GalleryRow, GalleryItem>("gallery", seedGallery, (r) => ({
    src: r.src,
    caption: r.caption ?? "",
    category: r.category,
  }));

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
};

export async function getSettings(): Promise<SiteSettings> {
  const sb = getAnonSupabase();
  if (!sb) return defaultSettings;
  try {
    const { data, error } = await sb.from("site_settings").select("*");
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
}

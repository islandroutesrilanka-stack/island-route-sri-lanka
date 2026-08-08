/**
 * Single import surface for the public content types.
 *
 * These types currently live next to their seed data in `lib/`, which was fine
 * when there were five of them. As the destination ecosystem, experiences and
 * stays land in Phases 2–5, components need to import types without also
 * pulling in the seed arrays they sit beside.
 *
 * Import from here in components; keep the definitions where they are for now.
 * When `supabase gen types` lands, `types/database.ts` becomes the generated
 * source and these become thin view-model aliases over it.
 */

export type { Tour, ItineraryDay } from "@/lib/tours";
export type { Destination } from "@/lib/destinations";
export type { Service, Vehicle, Review, GalleryItem } from "@/lib/content";
export type { Post } from "@/lib/blog";
export type { SiteSettings, SitemapRow } from "@/lib/data";

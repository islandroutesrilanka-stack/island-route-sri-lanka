import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { publishedExperiences } from "@/lib/experiences";
import {
  getTours,
  getDestinations,
  getPosts,
  getSitemapRows,
  type SitemapRow,
} from "@/lib/data";

/**
 * The sitemap previously stamped `lastModified: new Date()` on every URL,
 * which told Google the whole site changed on every crawl. It now reports the
 * real `updated_at` from Supabase where available, and omits the field
 * entirely when it isn't — an absent signal is far better than a false one.
 *
 * It also reads the origin from the same `siteUrl` constant the page
 * canonicals use, so a preview deployment can no longer advertise a sitemap
 * on one host and canonicals on another.
 */

/** Index the DB rows by slug so we can attach real timestamps in one pass. */
function timestampLookup(rows: SitemapRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of rows) if (r.updatedAt) map.set(r.slug, r.updatedAt);
  return map;
}

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: string
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, posts, tourRows, destRows, postRows] =
    await Promise.all([
      getTours(),
      getDestinations(),
      getPosts(),
      getSitemapRows("tours"),
      getSitemapRows("destinations"),
      getSitemapRows("posts"),
    ]);

  const tourStamps = timestampLookup(tourRows);
  const destStamps = timestampLookup(destRows);
  const postStamps = timestampLookup(postRows);

  // Only categories with journeys behind them are routable, so the sitemap is
  // derived from the same function the routes are — it can't advertise a URL
  // that 404s, and it picks up a newly populated category automatically.
  const experiences = publishedExperiences(tours);

  /*
   * /contact, /fleet and /reviews were merged away and now redirect
   * permanently (next.config.mjs). A sitemap must only list canonical, 200-
   * returning URLs — listing a redirect is a crawl-budget leak and a
   * "Page with redirect" warning in Search Console — so they are gone from
   * here. Their content lives at /book and /about.
   */
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/tours",
    "/destinations",
    "/experiences",
    "/services",
    "/gallery",
    "/blog",
    "/about",
    "/book",
  ].map((p) => entry(p, "weekly", p === "" ? 1 : 0.8));

  return [
    ...staticPages,
    ...tours.map((t) =>
      entry(`/tours/${t.slug}`, "weekly", 0.7, tourStamps.get(t.slug))
    ),
    ...destinations.map((d) =>
      entry(`/destinations/${d.slug}`, "monthly", 0.6, destStamps.get(d.slug))
    ),
    // No timestamp: experience pages are assembled from the tour catalogue and
    // have no modification date of their own. An absent signal beats a false
    // one — the same reasoning as the note at the top of this file.
    ...experiences.map((e) =>
      entry(`/experiences/${e.category.slug}`, "weekly", 0.7)
    ),
    ...posts.map((p) =>
      entry(
        `/blog/${p.slug}`,
        "monthly",
        0.5,
        // Fall back to the post's own publish date, which is real content
        // metadata rather than a fabricated crawl-time value.
        postStamps.get(p.slug) ?? p.date
      )
    ),
  ];
}

import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getTours, getDestinations, getPosts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, posts] = await Promise.all([
    getTours(),
    getDestinations(),
    getPosts(),
  ]);
  const staticPages = [
    "",
    "/tours",
    "/destinations",
    "/services",
    "/fleet",
    "/gallery",
    "/reviews",
    "/blog",
    "/about",
    "/contact",
    "/book",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...tours.map((t) => ({
      url: `${site.url}/tours/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...destinations.map((d) => ({
      url: `${site.url}/destinations/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}

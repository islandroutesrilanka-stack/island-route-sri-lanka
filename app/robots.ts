import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is behind auth and has no public value
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

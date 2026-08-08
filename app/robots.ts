import type { MetadataRoute } from "next";
import { siteUrl as base } from "@/lib/site";

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

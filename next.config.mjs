import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    // Modern formats first — typically 30–50% smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Optimised images stay cached for 31 days
    minimumCacheTTL: 2678400,
    /*
     * Every image host must be listed here. next/image returns a 400 for any
     * hostname that isn't — and the image silently disappears rather than
     * erroring, which makes it an easy fault to ship. Supabase Storage is
     * listed ahead of need so uploading original photography can never break
     * images the day it happens.
     */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // Freely-licensed place photography — see lib/media/commons.ts. Removing
      // this line does not throw; it blanks every region-explorer card.
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  /*
   * Consolidation redirects (permanent = 308, the modern method-preserving
   * equivalent of a 301 — Google treats both as a permanent move and passes
   * ranking signals through either way).
   *
   * These run before the filesystem router, so they fire regardless of whether
   * the old route files still exist. Every internal link has been repointed at
   * the new targets, so no visitor should ever take one of these hops — they
   * exist for external backlinks, bookmarks and the crawl backlog.
   *
   * Note on the fragments: a redirect can carry `#fleet` to the browser, but
   * fragments never reach the server, so Googlebot indexes /about and finds
   * the merged content there. That is the intended outcome — the fragment is
   * a courtesy to humans, not the SEO mechanism.
   */
  async redirects() {
    return [
      { source: "/contact", destination: "/book", permanent: true },
      { source: "/fleet", destination: "/about#fleet", permanent: true },
      { source: "/reviews", destination: "/about#reviews", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Tell browsers to only ever reach this site over HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // We ask for none of these — deny them up front
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Fingerprinted build assets never change — cache them forever
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:file(icon.svg|apple-icon.png|site.webmanifest)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
    ];
  },
};

// Run `ANALYZE=true npm run build` to inspect what is actually shipping to the browser.
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
  nextConfig
);

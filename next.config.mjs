/** @type {import('next').NextConfig} */
const nextConfig = {
  const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  compress: true,
  images: {
    // Modern formats first — typically 30–50% smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Optimised images stay cached for 31 days
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Add your own image host here when you move off Unsplash, e.g.
      // { protocol: "https", hostname: "YOUR-PROJECT.supabase.co" },
    ],
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

export default nextConfig;

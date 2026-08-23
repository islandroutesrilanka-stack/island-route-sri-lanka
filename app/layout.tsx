import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { siteUrl, socialProfiles } from "@/lib/site";
import { ogDefault } from "@/lib/images";
import { getSettings } from "@/lib/data";

/**
 * Fonts are self-hosted by Next at build time. This removes the cross-origin
 * round trip to Google, eliminates the flash of fallback text, and guarantees
 * zero layout shift via the automatic size-adjust fallback metrics.
 *
 * Fraunces is loaded as a variable font — no `weight` array — so the full
 * 300–600 range the design uses comes from one file, and the optical-size axis
 * stays available (Fraunces was designed to shift its detailing with size,
 * which is most of why it looks good at display sizes).
 *
 * Note: `axes` is only valid on a variable font. Passing it alongside a fixed
 * `weight` array is a build error, not a warning.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
  fallback: ["Georgia", "serif"],
});

/**
 * The italic, deliberately split out of the call above.
 *
 * It used to ride along as `style: ["normal", "italic"]`, which gave it the
 * same shape as the roman — variable across wght 100–900 with the optical-size
 * axis — and that file is 80 kB, the largest single asset the site ships and
 * bigger than the roman it partners. On /destinations it was downloaded to set
 * one line of text.
 *
 * Nothing on the site asks for a second italic weight: every use is a display
 * pull-line at 400. As a static 400 instance that is 22 kB, so this is a 58 kB
 * saving with no rendered pixel changed. Reached through `font-display-italic`
 * — see the note in tailwind.config.ts for why `font-display italic` is now
 * the wrong way to write it.
 */
const frauncesItalic = Fraunces({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-display-italic",
  fallback: ["Georgia", "serif"],
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body",
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#0B1F19",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Site-wide metadata.
 *
 * Every child route inherits this and overrides what it needs, so anything set
 * here is the answer for a page that says nothing. All three of title,
 * description and keywords come from the CMS, which means the live
 * `site_settings` rows — not the seed defaults in lib/data.ts — are what
 * Google actually reads in production.
 *
 * `metadataBase` is what makes the relative `ogDefault` path absolute in the
 * emitted tags. Social crawlers reject a relative og:image outright, so this
 * is load-bearing rather than a convenience, and it resolves from `siteUrl`
 * so a preview deployment cannot advertise production URLs.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = siteUrl;

  /*
    One image object, shared by Open Graph and Twitter rather than declared
    twice. `type` is included because several scrapers — WhatsApp's among them
    — will skip an image whose MIME type they have to infer, and it is the
    cheapest possible insurance for the preview that matters most to this
    business: most enquiries arrive over WhatsApp, so the WhatsApp unfurl is
    the card worth optimising for.
  */
  const ogImage = {
    url: ogDefault,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: `${s.siteName} — private journeys and custom tours across Sri Lanka`,
  };

  return {
    metadataBase: new URL(url),
    title: {
      default: s.seoTitle,
      template: `%s · Island Route`,
    },
    description: s.seoDescription,
    keywords: s.seoKeywords.split(",").map((k) => k.trim()),
    applicationName: s.siteName,
    authors: [{ name: s.siteName, url }],
    creator: s.siteName,
    publisher: s.siteName,
    category: "travel",
    alternates: { canonical: "/" },
    /*
      Wires up the manifest that has sat unreferenced in /public since the
      project started. Without this line it was never requested by anything.
    */
    manifest: "/site.webmanifest",
    /*
      Stops iOS Safari turning the phone number in the footer into a tel: link
      styled with its own blue, which it does to any digit string that looks
      like a number whether or not it is already a link.
    */
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: "website",
      siteName: s.siteName,
      title: s.seoTitle,
      description: s.seoDescription,
      url,
      locale: "en_GB",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      /*
        The site name alone used to go here, so a shared link showed "Island
        Route Sri Lanka" on X while Facebook showed the full positioning line.
        There is no reason for the two to disagree.
      */
      title: s.seoTitle,
      description: s.seoDescription,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: "/apple-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      /*
        `max-snippet: -1` and `max-video-preview: -1` remove Google's default
        length caps on the snippet and any video preview. The defaults are
        conservative; for a business whose descriptions are the pitch, a longer
        snippet is strictly better.
      */
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSettings();

  // Structured data for Google — driven by the admin Site & SEO settings.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: s.siteName,
    description: s.seoDescription,
    url: siteUrl,
    telephone: s.phoneE164,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: s.address,
      addressCountry: "LK",
    },
    areaServed: "Sri Lanka",
    priceRange: "$$",
    sameAs: socialProfiles.map((p) => p.href),
  };

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${archivo.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/*
          There is deliberately no animation-library provider here.

          A `<MotionConfig>` in the root layout is a client component importing
          framer-motion, which puts the library — 107 kB parsed — into the
          shared chunk graph of every route on the site, including the ones that
          have never animated anything. It now lives with the four surfaces that
          actually use framer (the gallery lightbox, the booking form, the
          journey builder, and the admin table), each of which declares its own
          `reducedMotion="user"`. Everything else on the site animates in CSS,
          where the global `prefers-reduced-motion` rule in globals.css already
          governs it.
        */}
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}

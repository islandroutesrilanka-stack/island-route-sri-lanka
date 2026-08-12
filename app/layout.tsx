import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { MotionProvider } from "@/components/motion";
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
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
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

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = siteUrl;
  return {
    metadataBase: new URL(url),
    title: {
      default: s.seoTitle,
      template: `%s · Island Route`,
    },
    description: s.seoDescription,
    keywords: s.seoKeywords.split(",").map((k) => k.trim()),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: s.siteName,
      title: s.seoTitle,
      description: s.seoDescription,
      url,
      locale: "en_GB",
      images: [
        {
          url: ogDefault,
          width: 1200,
          height: 630,
          alt: `${s.siteName} — private journeys across Sri Lanka`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: s.siteName,
      description: s.seoDescription,
      images: [ogDefault],
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: "/apple-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
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
        <MotionProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </MotionProvider>
      </body>
    </html>
  );
}

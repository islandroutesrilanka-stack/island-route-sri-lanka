import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { MotionProvider } from "@/components/motion";
import { site } from "@/lib/site";
import { ogDefault } from "@/lib/images";
import { getSettings } from "@/lib/data";

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&display=swap";

export const viewport: Viewport = {
  themeColor: "#0B1F19",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
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
    url: process.env.NEXT_PUBLIC_SITE_URL ?? site.url,
    telephone: s.phoneE164,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: s.address,
      addressCountry: "LK",
    },
    areaServed: "Sri Lanka",
    priceRange: "$$",
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          Fonts load without blocking first paint: the browser fetches the
          stylesheet at high priority but only applies it once ready, so text
          appears immediately in the fallback and swaps in place.
        */}
        <link rel="preload" as="style" href={FONT_CSS} />
        <link
          rel="stylesheet"
          href={FONT_CSS}
          media="print"
          // eslint-disable-next-line react/no-unknown-property
          onLoad={"this.media='all'" as unknown as undefined}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_CSS} />
        </noscript>
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

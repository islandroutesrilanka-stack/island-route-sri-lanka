import type { Metadata } from "next";
import { PageHeader, CTABand } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Photo Gallery",
  description:
    "Beaches, leopards, tea country, temples and surf — a gallery of moments from Island Route journeys across Sri Lanka.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const gallery = await getGallery();

  /*
    ImageGallery, with one ImageObject per published photograph.

    Two things here are deliberate rather than conventional.

    `contentLocation` appears only on frames whose place was actually
    confirmed. Google treats it as a factual claim about where a photograph was
    taken, and most of this collection arrived as UUID filenames carrying no
    such confirmation — so the ones that cannot prove where they were shot say
    nothing instead of guessing. Emitting a plausible-sounding location for all
    of them would be the single easiest way to turn a genuine photo library
    into misleading structured data.

    `description` uses the alt text and `caption` uses the caption, because
    that is what each one is. They were one field until this release, and
    collapsing them is why a screen reader used to hear the sentence the
    sighted visitor had already read.
  */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Sri Lanka Photo Gallery",
    url: `${siteUrl}/gallery`,
    description:
      "Photographs from Island Route journeys across Sri Lanka — coast, wildlife, hill country and the cultural triangle.",
    numberOfItems: gallery.length,
    associatedMedia: gallery.map((g) => ({
      "@type": "ImageObject",
      contentUrl: g.src.startsWith("http") ? g.src : `${siteUrl}${g.src}`,
      name: g.caption,
      caption: g.caption,
      description: g.alt || g.caption,
      ...(g.width && g.height ? { width: g.width, height: g.height } : {}),
      ...(g.place ? { contentLocation: { "@type": "Place", name: g.place } } : {}),
      representativeOfPage: false,
      isFamilyFriendly: true,
    })),
  };

  return (
    <>
      {gallery.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <PageHeader
        eyebrow="Gallery"
        title="The island, frame by frame"
        intro="A few of the moments waiting on the road ahead."
        slot="header-gallery"
      />
      {gallery.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="Gallery"
              title="No photographs published yet"
              body="There are no photographs published here at the moment."
              action={{ label: "Plan your journey", href: "/book" }}
            />
          </div>
        </section>
      )}
      {gallery.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <GalleryGrid gallery={gallery} />
          </div>
        </section>
      )}
      <CTABand />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader, CTABand } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Photo Gallery",
  description:
    "Beaches, leopards, tea country, temples and surf — a gallery of moments from Island Route journeys across Sri Lanka.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const gallery = await getGallery();
  return (
    <>
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

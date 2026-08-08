import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, ReviewCard, CTABand } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { getReviews } from "@/lib/data";
import { img } from "@/lib/images";
import { waLink, defaultWaMessage, site } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Guest Reviews",
  description:
    "Reviews from Island Route guests — honeymoons, family adventures, surf trips and grand island circuits across Sri Lanka.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const hasReviews = reviews.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Guest stories"
        title="The reviews we work for"
        intro={
          hasReviews
            ? "Every journey ends with a goodbye at the airport — and, more often than not, words like these."
            : "Every journey ends with a goodbye at the airport. We would rather show you nothing here than show you words we wrote ourselves."
        }
        image={img.beachChairs}
      />

      {hasReviews ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <ReviewCard key={r.name} r={r} index={i % 3} />
            ))}
          </div>
        </section>
      ) : (
        /*
          Deliberate empty state rather than a hidden page.
          The invented testimonials were removed in Phase 0; until real,
          attributable reviews are added through the admin dashboard, this page
          says so plainly. Candour reads better than a blank grid — and far
          better than fabricated praise.
        */
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-2xl px-5 md:px-8 text-center">
            <Reveal>
              <p className="eyebrow text-copper-deep">Nothing to show you yet</p>
              <h2 className="h-display mt-4 text-3xl md:text-4xl text-ink">
                We would rather be honest than impressive
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-ink/70">
                We are collecting reviews from recent guests and will publish
                them here with their names and journeys attached — the real
                ones, or none at all.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/65">
                In the meantime, ask us anything directly. We will happily put
                you in touch with travellers who have made the journey you are
                considering.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/book"
                  className="bg-ink text-sand px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                >
                  Plan my trip
                </Link>
                <a
                  href={waLink(defaultWaMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink/20 text-ink px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-ink hover:text-sand transition-colors"
                >
                  WhatsApp {site.phoneDisplay}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <CTABand
        title="Ready to write your own?"
        body="Tell us your dates and what you'd love to see. We'll reply personally with a route worth reviewing."
      />
    </>
  );
}

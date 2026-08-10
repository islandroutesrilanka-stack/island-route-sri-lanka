import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, CTABand } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import { Reveal } from "@/components/motion";
import { getPosts } from "@/lib/data";
import { img } from "@/lib/images";
import { formatDate, toIsoDate } from "@/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Travel Journal",
  description:
    "Itineraries, seasonal guides, safari advice and beach insider tips — travel wisdom from Island Route's drivers and trip designers.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Notes from the road"
        intro="Guides and stories from the people who drive this island every day."
        image={img.sunraysValley}
      />
      {posts.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="The journal"
              title="No stories published yet"
              body="We write these between trips. Nothing is live just now — ask us anything in the meantime and we'll answer properly."
              action={{ label: "Ask us a question", href: "/contact" }}
            />
          </div>
        </section>
      )}
      {posts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-10 md:grid-cols-2">
            {posts.map((p, i) => (
              <Reveal key={p.slug} index={i % 2}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="img-frame aspect-[16/9]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                    <time dateTime={toIsoDate(p.date)}>{formatDate(p.date)}</time>{" "}
                    · {p.readTime}
                  </p>
                  <h2 className="font-display text-3xl text-ink mt-2 leading-snug group-hover:text-copper-deep transition-colors">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-[15px] text-ink/70 leading-relaxed">
                    {p.excerpt}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      <CTABand />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, CTABand } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import { Reveal } from "@/components/motion";
import { getPosts } from "@/lib/data";
import { formatDate, toIsoDate } from "@/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sri Lanka Travel Journal",
  description:
    "Itineraries, seasonal guides, safari advice and beach insider tips — travel wisdom from Island Route's drivers and trip designers.",
  alternates: { canonical: "/blog" },
};

/**
 * Card typography, shared by the lead and the grid.
 *
 * The two tiles differ only in scale, so the difference lives in one prop
 * rather than in two divergent copies of the same markup — which is how the
 * date line and the excerpt drifted apart the last time this page was edited.
 */
function PostCard({
  post,
  index,
  lead = false,
}: {
  post: Awaited<ReturnType<typeof getPosts>>[number];
  index: number;
  lead?: boolean;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/blog/${post.slug}`} className="group block">
        <div
          className={`img-frame ${lead ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[16/9]"}`}
        >
          <Image
            src={post.image}
            /* Decorative: the headline it sits above says the same thing, and a
               screen reader announcing the title twice is noise, not access. */
            alt=""
            fill
            priority={lead}
            sizes={
              lead
                ? "(min-width: 1216px) 1216px, 100vw"
                : "(min-width: 768px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
          />
        </div>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 text-[11px] uppercase tracking-[0.16em] text-ink/65">
          <time dateTime={toIsoDate(post.date)}>{formatDate(post.date)}</time>
          <span aria-hidden className="h-3 w-px bg-ink/20" />
          {post.readTime}
        </p>
        <h2
          className={`h-display mt-2.5 leading-[1.15] text-ink transition-colors group-hover:text-copper-deep ${
            lead
              ? "max-w-3xl text-[34px] md:text-5xl"
              : "text-[26px] md:text-3xl"
          }`}
        >
          {post.title}
        </h2>
        <p
          className={`mt-3 leading-relaxed text-ink/70 ${
            lead ? "max-w-2xl text-base md:text-[17px]" : "text-[15px]"
          }`}
        >
          {post.excerpt}
        </p>
        <span className="link-line mt-4 inline-block text-[12px] uppercase tracking-[0.16em] text-copper-deep">
          Read the story
        </span>
      </Link>
    </Reveal>
  );
}

export default async function BlogPage() {
  const posts = await getPosts();

  /* Newest post carries the page at editorial scale; the rest sit in an even
     two-column grid. Nothing here assumes a particular number of posts — one
     post renders as a lead with no empty grid beneath it. */
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Notes from the road"
        intro="Guides and stories from the people who drive this island every day."
        /* Decorative, but a verified Sri Lankan location rather than generic
           stock — same rule the post images follow, and now visible at full
           strength behind the title rather than washed out under a gradient.
           Editable at /admin/images; the default is the Galle fort street. */
        slot="header-blog"
      />
      {posts.length === 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="The journal"
              title="No stories published yet"
              body="We write these between trips. Nothing is live just now — ask us anything in the meantime and we'll answer properly."
              action={{ label: "Ask us a question", href: "/book#contact" }}
            />
          </div>
        </section>
      )}
      {/* aria-label rather than a visually-hidden heading: the post titles are
          the h2s here, and inserting a wrapper heading above them would push
          every one of them to h3 for no reader's benefit. */}
      {posts.length > 0 && (
        <section className="py-16 md:py-24" aria-label="Journal entries">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <PostCard post={lead} index={0} lead />

            {rest.length > 0 && (
              <div className="mt-14 grid gap-x-10 gap-y-14 border-t border-ink/10 pt-14 md:mt-16 md:grid-cols-2 md:pt-16">
                {rest.map((p, i) => (
                  <PostCard key={p.slug} post={p} index={i % 2} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <CTABand />
    </>
  );
}

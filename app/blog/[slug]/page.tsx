import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toOgImage } from "@/lib/images";
import { clampDesc } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion";
import { CTABand } from "@/components/ui";
import { getPosts, getPostBySlug } from "@/lib/data";
import { site } from "@/lib/site";
import { formatDate, toIsoDate } from "@/utils/format";

export const revalidate = 60;

/** Prebuild every journal post at deploy time. */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: { absolute: post.title },
    description: clampDesc(post.excerpt),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      url: `/blog/${post.slug}`,
      siteName: "Island Route Sri Lanka",
      locale: "en_GB",
      title: post.title,
      description: post.excerpt,
      images: [{ url: toOgImage(post.image), width: 1200, height: 630, alt: post.title }],
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative bg-deep pt-32 md:pt-44 pb-16 overflow-hidden">
        {/* Decorative: dimmed to 40% behind a gradient, with the headline
            directly on top. Alt text here would make a screen reader read the
            title twice before reaching the h1. */}
        <Image
          src={post.image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/60 via-deep/40 to-deep" />
        <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-8">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-sand/60 hover:text-sand transition-colors"
            >
              <ArrowLeft size={14} /> The journal
            </Link>
            <h1 className="h-display mt-5 text-4xl md:text-6xl text-sand">
              {post.title}
            </h1>
            <p className="mt-6 flex flex-wrap items-center gap-x-3 text-[12px] uppercase tracking-[0.16em] text-sand/65">
              <time dateTime={toIsoDate(post.date)}>{formatDate(post.date)}</time>
              <span aria-hidden className="h-3 w-px bg-sand/25" />
              {post.readTime}
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        Narrower than the hero on purpose. At max-w-3xl the body ran to roughly
        ninety characters a line, which is past the point where the eye starts
        losing its place on the return sweep; 42rem lands around seventy-five.
        The hero keeps the wider measure — a headline is not read the same way.
      */}
      <article className="py-14 md:py-20">
        <div className="mx-auto max-w-[42rem] px-5 md:px-8">
          {post.sections.map((s, i) => (
            <Reveal key={i} index={Math.min(i, 3)}>
              {s.heading && (
                <h2 className="h-display mt-12 mb-4 text-2xl leading-snug text-ink md:text-3xl">
                  {s.heading}
                </h2>
              )}
              <p
                className={
                  !s.heading && i === 0
                    ? "font-display text-xl leading-relaxed text-ink/85 md:text-[22px]"
                    : "mt-4 text-[16.5px] leading-[1.85] text-ink/75"
                }
              >
                {s.body}
              </p>
            </Reveal>
          ))}

          {others.length > 0 && (
            <div className="mt-16 border-t border-ink/10 pt-10">
              <p className="eyebrow mb-6 text-copper-deep">Keep reading</p>
              <div className="grid gap-8 sm:grid-cols-2">
                {others.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                    <div className="img-frame aspect-[16/9]">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 20rem, 100vw"
                        className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-copper-deep">
                      {p.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <CTABand
        title="Ready to see it for yourself?"
        body="Everything in this journal comes from routes we drive weekly. Let's put it on your itinerary."
      />
    </>
  );
}

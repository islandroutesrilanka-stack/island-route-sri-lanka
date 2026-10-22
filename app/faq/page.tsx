import type { Metadata } from "next";
import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { PageHeader, CTABand } from "@/components/ui";
import { SectionHeading } from "@/components/ui-client";
import { FAQ_GROUPS, ALL_FAQS } from "@/lib/faqs";
import { site, siteUrl, waLink, defaultWaMessage } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "What a private journey across Sri Lanka costs, what the day rate includes, how far ahead to book, who drives, and what happens when plans change.",
  alternates: { canonical: "/faq" },
};

/**
 * The FAQ page.
 *
 * ── Why this exists as a page at all ───────────────────────────────────────
 *
 * Three questions lived on /book and nowhere else. That is the right place for
 * three — they are last-objection questions, read by someone already filling
 * in a form — but it meant the site had no answer at all for the much larger
 * set of people who are still deciding whether Sri Lanka is a private-driver
 * country, and who arrive on a search engine typing the question rather than
 * the destination. Those searches do not land on a booking form.
 *
 * So /book keeps its three and this page carries the full set. They share one
 * source (lib/faqs.ts) rather than two copies, because both pages emit FAQPage
 * structured data and Google requires that markup match text visible on the
 * page carrying it — two hand-maintained copies is exactly how that breaks.
 *
 * ── Why native <details> and a Server Component ────────────────────────────
 *
 * The same reasoning as FaqPreview, which this page deliberately mirrors.
 * <details>/<summary> gives keyboard operation, screen-reader semantics and
 * open/close state with no JavaScript, no handlers and no accordion library,
 * so there is nothing here worth shipping to the browser. The rotating "+" is
 * a CSS `group-open:` variant.
 *
 * One consequence worth stating, because it is a feature: a closed <details>
 * is still in the DOM and still indexable, and in-page search (Ctrl-F) in
 * Chrome now opens it on a hit. A JS accordion that unmounts its answers gets
 * neither.
 */
export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ALL_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Frequently asked questions",
        item: `${siteUrl}/faq`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHeader
        eyebrow="Before you ask"
        title="Questions, answered plainly"
        intro="The things people ask us before they commit — about money, about timing, and about what a day on the road actually looks like. If yours isn't here, ask it directly; we answer in hours, not days."
      />

      {/*
        The jump rail.

        Plain anchors rather than next/link on purpose. A same-page `#` target
        needs the browser's native fragment behaviour, and routing it through
        the App Router buys nothing while inviting the scroll-position reset
        that next/link performs by default — the defect fixed on the journeys
        map. `scroll-mt-28` on each group pays for the fixed header.
      */}
      <nav
        aria-label="Jump to a topic"
        className="border-b border-ink/10 bg-dune/50"
      >
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <ul className="no-scrollbar flex gap-6 overflow-x-auto py-2.5 md:gap-8">
            {FAQ_GROUPS.map((g) => (
              <li key={g.id} className="shrink-0">
                {/*
                  `inline-block py-1.5` rather than a bare inline anchor. A
                  12px uppercase label gives a 14px-tall box, and the hit area
                  of an inline element is the box, not the padded row around
                  it — which put these under the 24px minimum of WCAG 2.5.8.
                  The padding moved off the <ul> and onto the anchors, so the
                  rail is the same 46px tall and the whole of it is tappable.
                */}
                <a
                  href={`#${g.id}`}
                  className="link-line inline-block py-1.5 text-[12px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-copper-deep"
                >
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="bg-sand">
        {FAQ_GROUPS.map((group, gi) => (
          <section
            key={group.id}
            id={group.id}
            className={`scroll-mt-28 py-14 md:py-20 ${
              gi > 0 ? "border-t border-ink/10" : ""
            }`}
          >
            <div className="mx-auto max-w-wrap px-5 md:px-8">
              <div className="grid gap-10 md:grid-cols-12">
                <div className="md:col-span-4">
                  {/* Index number as magazine furniture — the same device the
                      homepage hero and the journeys list use. */}
                  <p className="eyebrow text-copper-deep">
                    {String(gi + 1).padStart(2, "0")} — {group.label}
                  </p>
                  {group.blurb && (
                    <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ink/65">
                      {group.blurb}
                    </p>
                  )}
                </div>

                <div className="md:col-span-8">
                  <dl className="divide-y divide-ink/10 border-y border-ink/12">
                    {group.faqs.map((f) => (
                      <details key={f.q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                          <dt className="font-display text-lg text-ink md:text-xl">
                            {f.q}
                          </dt>
                          <Plus
                            size={18}
                            aria-hidden
                            className="mt-1 shrink-0 text-copper-deep transition-transform duration-300 group-open:rotate-45"
                          />
                        </summary>
                        <dd className="mt-3 max-w-2xl pr-0 text-[15px] leading-relaxed text-ink/70 sm:pr-10">
                          {f.a}
                        </dd>
                      </details>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/*
        The ask-us block.

        A FAQ page that ends at the last answer has told the one person it
        failed — the one whose question wasn't here — to press Back. Both
        routes out are given, because the two are not interchangeable: the form
        carries context we can quote back, WhatsApp is faster.
      */}
      <section className="border-t border-ink/10 bg-dune/60 py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="Still wondering"
            title="Ask us the one that isn't here"
            intro="No form-letter replies and no call centre — your message reaches the people who plan the journeys."
          />
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/book#contact"
              className="bg-ink px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep"
            >
              Ask a question
            </Link>
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-ink/20 px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-sand"
            >
              <MessageCircle size={15} aria-hidden />
              WhatsApp {site.whatsappDisplay}
            </a>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}

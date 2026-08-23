/**
 * The FAQ block — three questions, placed at the point where last objections
 * surface, just ahead of the conversion decision.
 *
 * It used to sit at the bottom of the homepage. It moved to /book in the
 * homepage's redesign, which is a better home for it than a compromise: all
 * three questions are asked by someone already weighing an enquiry, and the
 * page it now sits on is the one that answers the first of them in detail
 * directly above.
 *
 * The FAQPage structured data is emitted here rather than by the page, so the
 * markup and the questions it describes can never drift apart — Google requires
 * that FAQ structured data match content actually visible on the page, and the
 * only reliable way to guarantee that is to render both from one source in one
 * component.
 *
 * A Server Component on purpose. Native <details>/<summary> gives us keyboard
 * operation, screen-reader semantics and open/close behaviour with no state, no
 * handlers and no accordion library — so there is no reason to ship any of this
 * to the browser. The rotating "+" is a CSS `group-open:` variant, not
 * JavaScript.
 *
 * Content lives in lib/faqs.ts rather than here, because it is read from more
 * than one side and shared data must not sit in a client module.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { HOMEPAGE_FAQS, type Faq } from "@/lib/faqs";

export default function FaqPreview({
  faqs = HOMEPAGE_FAQS,
  dark = false,
}: {
  faqs?: Faq[];
  dark?: boolean;
}) {
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  /* One place where the two grounds diverge, so a future edit can't change the
     light styling and forget the dark one. */
  const t = dark
    ? {
        section: "bg-deep",
        eyebrow: "text-copper-light",
        heading: "text-sand",
        link: "text-copper-light",
        rule: "border-sand/10",
        divide: "divide-sand/10",
        question: "text-sand",
        answer: "text-sand/65",
        icon: "text-copper-light",
      }
    : {
        section: "border-t border-ink/10 bg-sand",
        eyebrow: "text-copper-deep",
        heading: "text-ink",
        link: "text-copper-deep",
        rule: "border-ink/12",
        divide: "divide-ink/10",
        question: "text-ink",
        answer: "text-ink/70",
        icon: "text-copper-deep",
      };

  return (
    <section className={`section-tight ${t.section}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className={`eyebrow ${t.eyebrow}`}>Before you ask</p>
            <h2 className={`h-display mt-3 text-3xl ${t.heading}`}>
              The questions we get most
            </h2>
            <Link
              href="/book#contact"
              className={`link-line mt-5 inline-block text-[13px] uppercase tracking-[0.16em] ${t.link}`}
            >
              Ask us anything →
            </Link>
          </div>

          <div className="md:col-span-8">
            <dl className={`border-y ${t.rule} divide-y ${t.divide}`}>
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                    <dt
                      className={`font-display text-lg md:text-xl ${t.question}`}
                    >
                      {f.q}
                    </dt>
                    <Plus
                      size={18}
                      aria-hidden
                      className={`mt-1 shrink-0 transition-transform duration-300 group-open:rotate-45 ${t.icon}`}
                    />
                  </summary>
                  <dd
                    className={`mt-3 max-w-2xl pr-10 text-[15px] leading-relaxed ${t.answer}`}
                  >
                    {f.a}
                  </dd>
                </details>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * FAQ preview (homepage §09, below the CTA).
 *
 * Three questions only, placed immediately before the footer — deliberately at
 * the point where last objections surface, just ahead of the conversion
 * decision rather than buried on a separate page.
 *
 * A Server Component on purpose. Native <details>/<summary> gives us
 * keyboard operation, screen-reader semantics and open/close behaviour with no
 * state, no handlers and no accordion library — so there is no reason to ship
 * any of this to the browser. The rotating "+" is a CSS `group-open:` variant,
 * not JavaScript.
 *
 * Content lives in lib/faqs.ts rather than here, because app/page.tsx also
 * reads it to emit FAQPage structured data and shared data must not sit in a
 * client module.
 */
import Link from "next/link";
import { Plus } from "lucide-react";
import { HOMEPAGE_FAQS, type Faq } from "@/lib/faqs";

export default function FaqPreview({ faqs = HOMEPAGE_FAQS }: { faqs?: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="mt-20 border-t border-sand/15 pt-12 md:mt-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow text-copper-light">Before you ask</p>
          <h2 className="h-display mt-3 text-3xl text-sand">
            The questions we get most
          </h2>
          <Link
            href="/contact"
            className="link-line mt-5 inline-block text-[13px] uppercase tracking-[0.16em] text-copper-light"
          >
            Ask us anything →
          </Link>
        </div>

        <div className="md:col-span-8">
          <dl className="divide-y divide-sand/10 border-y border-sand/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                  <dt className="font-display text-lg text-sand md:text-xl">
                    {f.q}
                  </dt>
                  <Plus
                    size={18}
                    aria-hidden
                    className="mt-1 shrink-0 text-copper-light transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <dd className="mt-3 max-w-2xl pr-10 text-[15px] leading-relaxed text-sand/65">
                  {f.a}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

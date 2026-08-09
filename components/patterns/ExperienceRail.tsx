/**
 * Experience discovery (homepage §04).
 *
 * Editorial hierarchy rather than twelve identical cards: two large features
 * carry the section and show their sub-activities, and the remaining ten sit
 * beneath as a quiet typographic index. All twelve categories stay top-level
 * and every sub-activity is preserved — the change is weight, not content.
 *
 * Deliberately no photography. Twelve category images would mean twelve more
 * unverified stock photographs, which is the one thing this project has ruled
 * out. Type, scale and the contour treatment carry it until real photography
 * exists; each tile then takes an image with no change to this component.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import GradientPanel from "@/components/media/GradientPanel";
import { experienceCategories } from "@/lib/experiences";

const [featureA, featureB, ...rest] = experienceCategories;

function Feature({
  category,
  index,
  tall = false,
}: {
  category: (typeof experienceCategories)[number];
  index: number;
  tall?: boolean;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/tours?theme=${category.slug}`} className="group block">
        <div
          className={`img-frame relative ${
            tall ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-[4/5] md:aspect-[4/3]"
          }`}
        >
          <GradientPanel
            tone={index % 2 === 0 ? "moss" : "deep"}
            pattern="contour"
            className="h-full w-full"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <h3 className="h-display text-3xl text-sand md:text-4xl">
              {category.name}
            </h3>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-sand/70">
              {category.blurb}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-sand/15 pt-4">
              {category.activities.map((a) => (
                <li
                  key={a}
                  className="text-[11px] uppercase tracking-[0.14em] text-sand/55"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function ExperienceRail() {
  return (
    <>
      {/* Two features carry the section */}
      <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7">
          <Feature category={featureA} index={0} />
        </div>
        <div className="md:col-span-5 md:pt-12">
          <Feature category={featureB} index={1} tall />
        </div>
      </div>

      {/* The remaining ten as a typographic index — quiet, scannable, complete */}
      <ul className="mt-12 grid grid-cols-1 gap-x-10 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((c) => (
          <li key={c.slug} className="border-b border-ink/10">
            <Link
              href={`/tours?theme=${c.slug}`}
              className="group flex items-baseline justify-between gap-4 py-5"
            >
              <span>
                <span className="font-display text-xl text-ink transition-colors group-hover:text-copper-deep">
                  {c.name}
                </span>
                <span className="mt-1 block text-[12px] uppercase tracking-[0.12em] text-ink/65">
                  {c.activities.slice(0, 2).join(" · ")}
                  {c.activities.length > 2 && ` +${c.activities.length - 2}`}
                </span>
              </span>
              <ArrowRight
                size={15}
                aria-hidden
                className="shrink-0 translate-y-1 text-ink/60 transition-all group-hover:translate-x-1 group-hover:text-copper-deep"
              />
              <span className="sr-only">— {c.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

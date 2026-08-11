/**
 * Experience card — the shared tile for /experiences and the "other ways to
 * travel" rail on each detail page.
 *
 * Deliberately no photography, for the same reason ExperienceRail has none: a
 * category image would be a claim ("this is what a Wildlife journey looks
 * like") backed by an unverified photograph, and this project has ruled that
 * out. Type, scale and the contour treatment carry it. Each tile takes an image
 * later with no change to its callers.
 *
 * The journey count is the one number on the card and it is real — the tile
 * only exists because that count is non-zero. It does the work a price or a
 * rating would do elsewhere: it tells the visitor there is something behind the
 * link before they spend a click finding out.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import GradientPanel from "@/components/media/GradientPanel";
import type { PublishedExperience } from "@/lib/experiences";

export default function ExperienceCard({
  experience: { category, tours },
  index = 0,
  variant = "default",
}: {
  experience: PublishedExperience;
  index?: number;
  /** `feature` is the same tile at editorial scale — wider crop, larger type. */
  variant?: "default" | "feature";
}) {
  const feature = variant === "feature";

  return (
    <Reveal index={index}>
      <Link href={`/experiences/${category.slug}`} className="group block">
        <div
          className={`img-frame ${
            feature ? "aspect-[4/5] md:aspect-[16/10]" : "aspect-[4/5] sm:aspect-[4/3]"
          }`}
        >
          <GradientPanel
            tone={index % 2 === 0 ? "moss" : "deep"}
            pattern="contour"
            className="h-full w-full transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/25 to-transparent" />

          <span className="absolute left-4 top-4 bg-sand/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink">
            {tours.length} {tours.length === 1 ? "journey" : "journeys"}
          </span>

          <div
            className={`absolute inset-x-0 bottom-0 ${
              feature ? "p-6 md:p-10" : "p-5 md:p-6"
            }`}
          >
            <h3
              className={`h-display text-sand ${
                feature ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
              }`}
            >
              {category.name}
            </h3>
            <p
              className={`mt-3 leading-relaxed text-sand/75 ${
                feature ? "max-w-lg text-[15px] md:text-base" : "max-w-sm text-[14px]"
              }`}
            >
              {category.blurb}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-sand/15 pt-4">
              {(feature ? category.activities : category.activities.slice(0, 3)).map(
                (a) => (
                  <li
                    key={a}
                    className="text-[11px] uppercase tracking-[0.14em] text-sand/60"
                  >
                    {a}
                  </li>
                )
              )}
              {!feature && category.activities.length > 3 && (
                <li className="text-[11px] uppercase tracking-[0.14em] text-copper-light">
                  +{category.activities.length - 3}
                </li>
              )}
            </ul>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-ink/70 transition-colors group-hover:text-copper-deep">
          Explore {category.name}
          <ArrowRight
            size={14}
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          />
        </p>
      </Link>
    </Reveal>
  );
}

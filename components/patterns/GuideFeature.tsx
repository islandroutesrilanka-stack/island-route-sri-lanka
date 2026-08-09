/**
 * Your chauffeur-guide (homepage §06).
 *
 * The three "why us" pillars now live in TrustBand directly under the hero, so
 * this section is solely about the person in the driver's seat — which was
 * always the stronger, less copyable claim. An international operator sells you
 * a specialist in an office; here the expert sits beside you for a fortnight.
 *
 * Two states, both designed:
 *
 *   guide configured  → named person, portrait, their own words
 *   no guide          → the proposition stated plainly, no name, no face,
 *                       no portrait frame. Nothing is invented to fill it.
 *
 * The fallback is not a degraded version of the first state. It makes the same
 * argument without pretending to a person who hasn't been added yet.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import GradientPanel from "@/components/media/GradientPanel";
import { fromCmsUrl } from "@/lib/media/registry";

export type FeaturedGuide = {
  name: string;
  role: string;
  note: string;
  imageUrl: string;
};

const POINTS = [
  {
    title: "A guide, not a driver",
    body: "Our chauffeur-guides are licensed guides who drive — so the commentary at a temple, the reason a road is closed and the best time to arrive all come from the same person.",
  },
  {
    title: "The same person throughout",
    body: "One guide for the whole journey. By day three they know how you travel: when you want the history and when you'd rather just watch the road.",
  },
  {
    title: "Local knowledge, not a script",
    body: "Where to stop for lunch, which viewpoint is worth the climb today, when to leave to beat the coach parties. None of it is in a guidebook.",
  },
];

export default function GuideFeature({ guide }: { guide: FeaturedGuide | null }) {
  const portrait = guide?.imageUrl
    ? fromCmsUrl(guide.imageUrl, `${guide.name}, chauffeur-guide at Island Route`, {
        focal: "50% 30%",
      })
    : null;

  /* ---------------------- No verified guide configured ---------------------- */
  if (!guide) {
    return (
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <Reveal>
            <p className="eyebrow text-copper-deep">Your chauffeur-guide</p>
            <h2 className="h-display mt-4 text-4xl leading-[1.05] text-ink md:text-6xl">
              The island is
              <br />
              <em className="text-copper-deep">someone&apos;s</em> home
            </h2>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ink/75">
              Every Island Route journey travels with a chauffeur-guide — one
              person, for the whole trip, who grew up on these roads.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-7 md:pt-4">
          <dl className="divide-y divide-ink/10 border-y border-ink/10">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} index={i}>
                <div className="grid gap-2 py-7 sm:grid-cols-12 sm:gap-8">
                  <dt className="font-display text-xl text-ink sm:col-span-5">
                    {p.title}
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-ink/70 sm:col-span-7">
                    {p.body}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  /* ------------------------- A real, named guide ---------------------------- */
  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-14">
      <Reveal className="md:col-span-5">
        <div className="img-frame relative aspect-[4/5]">
          {portrait ? (
            <Img asset={portrait} sizes="(max-width: 768px) 100vw, 40vw" />
          ) : (
            <GradientPanel tone="moss" pattern="contour" rule className="h-full w-full" />
          )}
        </div>
      </Reveal>

      <div className="md:col-span-7">
        <Reveal>
          <p className="eyebrow text-copper-deep">Your guide, not a tour guide</p>
          <h2 className="h-display mt-4 text-4xl leading-[1.05] text-ink md:text-5xl">
            {guide.name}
          </h2>
          {guide.role && (
            <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-copper-deep">
              {guide.role}
            </p>
          )}
          {guide.note && (
            <blockquote className="mt-7 max-w-xl font-display text-2xl leading-relaxed text-ink/85">
              “{guide.note}”
            </blockquote>
          )}
        </Reveal>

        <dl className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} index={i}>
              <div className="grid gap-1.5 py-5 sm:grid-cols-12 sm:gap-8">
                <dt className="font-display text-lg text-ink sm:col-span-5">
                  {p.title}
                </dt>
                <dd className="text-[15px] leading-relaxed text-ink/70 sm:col-span-7">
                  {p.body}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal index={3}>
          <Link
            href="/about"
            className="link-line mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-copper-deep"
          >
            Meet the team <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

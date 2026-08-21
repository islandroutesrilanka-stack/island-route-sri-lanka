/**
 * Experience card — the shared tile for /experiences and the "other ways to
 * travel" rail on each detail page.
 *
 * This used to carry no photography at all, on the grounds that a category
 * image would be a claim ("this is what a Wildlife journey looks like") backed
 * by an unverified photograph. The objection was to the *unverified* half, not
 * to photography, and `lib/media/experiences.ts` now answers it: every asset it
 * returns has had its location checked, and `requireVerifiedLocation` below
 * stays on, so anything unchecked falls back to the contour treatment this tile
 * shipped with rather than showing the wrong country. The card's contract with
 * its callers is unchanged.
 *
 * The journey count is the one number on the card and it is real — the tile
 * only exists because that count is non-zero. It does the work a price or a
 * rating would do elsewhere: it tells the visitor there is something behind the
 * link before they spend a click finding out.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import { experienceAsset } from "@/lib/media/experiences";
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
          <Img
            asset={experienceAsset(category.slug)}
            /* Off, and staying off: an unchecked asset here would put a
               photograph of somewhere else behind a category name. */
            requireVerifiedLocation
            sizes={
              feature
                ? "(min-width: 1216px) 1216px, 100vw"
                : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            }
            fallbackTone={index % 2 === 0 ? "moss" : "deep"}
            fallbackPattern="contour"
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          {/*
            ── Two scrims, because the two variants are different problems ────

            The feature tile is 16/10 and its copy occupies the bottom ~29% of
            it, so a gentle ramp is both enough and desirable: measured against
            the photograph actually behind them, its title, blurb and activity
            list come out at 12.5:1, 8.2:1 and 6.1:1.

            The grid tile is 4/3 and the same copy fills the bottom ~76%, which
            puts the title where the gentle ramp has faded to about 24% — and on
            the bright photographs (the Ella ridge, the Ayurveda garden, the
            temple sky) that measured 2.2–2.9:1 against sand. Large text needs
            3:1 and the 14px blurb needs 4.5:1, so most of the grid failed both.

            Hence the explicit stops below: ~0.62 opacity where the title sits,
            ~0.75 behind the blurb, ~0.90 behind the activity list, fading to
            0.20 at the top so the upper quarter of the crop still reads as a
            photograph. Each is a step up from the first pass at these stops,
            which measured 4.6:1 on the worst tile's title — true, and no margin
            at all for the next photograph somebody uploads. If the copy or the
            aspect ratio changes, the stops need re-checking: they are
            positional, not decorative.

            The colour is spelled out in rgba rather than taken from the token
            because Tailwind cannot interpolate a named colour at five stops.
            That makes it the one place on the site where `deep` is written by
            hand, so it has to be changed by hand — it was still rgb(11,31,25),
            two palettes out of date, until this pass caught it.
          */}
          <div
            className={`absolute inset-0 ${
              feature
                ? "bg-gradient-to-t from-deep via-deep/70 to-deep/10"
                : "bg-[linear-gradient(to_top,rgba(3,39,34,1)_0%,rgba(3,39,34,0.9)_40%,rgba(3,39,34,0.72)_70%,rgba(3,39,34,0.55)_85%,rgba(3,39,34,0.2)_100%)]"
            }`}
          />

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
            {/*
              ── Why the two blocks below reserve height from sm up ────────────

              This content block is bottom-anchored, so the title's position is
              whatever is left after the blurb and the activity list have taken
              theirs. That makes a card's title rise or fall with the length of
              its own copy: "Slow Travel" has a one-line blurb and three short
              activity names, so its title sat 37px lower than "Luxury
              Experiences" beside it, and a row of tiles read as misaligned
              rather than varied.

              So both variable blocks reserve their two-line height whether or
              not the second line is used, which puts every title in a row on
              the same baseline without truncating anyone's copy. The numbers
              are the measured two-line heights, not guesses — 14px text at
              leading-relaxed is 2 × 22.75px ≈ 46px, and the list is 16px of
              pt-4 plus two 11px lines and their gap-y-1.5 = 56px. If either
              type size changes, re-measure.

              Only from sm up, because that is where the grid becomes
              multi-column (sm:grid-cols-2 on /experiences). On a phone the
              cards are stacked, nothing sits beside anything, and reserved
              blank space would be waste rather than alignment.
            */}
            <p
              className={`mt-3 leading-relaxed text-sand/75 ${
                feature
                  ? "max-w-lg text-[15px] md:text-base"
                  : "max-w-sm text-[14px] sm:min-h-[2.875rem]"
              }`}
            >
              {category.blurb}
            </p>
            <ul
              className={`mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-sand/15 pt-4 ${
                feature ? "" : "sm:min-h-[3.5rem]"
              }`}
            >
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

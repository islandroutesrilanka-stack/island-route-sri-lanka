/**
 * Experience card — the tile for /experiences.
 *
 * This used to carry no photography at all, on the grounds that a category
 * image would be a claim ("this is what a Wildlife journey looks like") backed
 * by an unverified photograph. The objection was to the *unverified* half, not
 * to photography, and `lib/media/experiences.ts` now answers it: every asset it
 * returns has had its location checked, and `requireVerifiedLocation` below
 * stays on, so anything unchecked falls back to the contour treatment this tile
 * shipped with rather than showing the wrong country.
 *
 * ── Why there are two components below rather than one with flags ────────────
 *
 * The grid tile puts its copy *under* the photograph; the feature tile puts it
 * *on* the photograph. That is not a styling difference that a `feature`
 * boolean can carry — it changes the element tree, what needs a scrim, what
 * needs a colour, and which alignment problems exist at all. Held in one
 * function it was eleven ternaries deep and every one of them had to be read
 * to answer any question about either variant.
 *
 * ── Why the grid tile's copy moved out of the frame ──────────────────────────
 *
 * It used to sit inside, bottom-anchored, filling roughly the bottom 76% of a
 * 4/3 crop — which meant the photograph underneath had to be painted out to
 * about 0.90 opacity behind the activity list and 0.62 behind the title before
 * the type cleared AA on the bright crops. Those numbers were correct and the
 * result was a tile where the photography was decorative texture: you could not
 * tell the Ella ridge from the Ayurveda garden at a glance.
 *
 * Moving the copy onto the page's own sand ground removes the contrast problem
 * rather than negotiating with it. Ink on sand is 5.9:1 for the blurb and 5.0:1
 * for the meta line with no overlay at all, so the photograph now runs at full
 * strength, uninterrupted, from edge to edge. This also deletes the two
 * reserved-height hacks the old tile needed: titles used to rise and fall with
 * the length of their own copy because the block was bottom-anchored, and they
 * now all sit the same distance below an identical crop.
 *
 * The journey count moved out of both frames with it. On the grid tile it was
 * a solid sand chip dropped on the top-left corner of the photograph — the one
 * thing left covering the part of the crop no scrim ever reached. On the
 * feature tile it headed the copy block in 11px sand, sitting over the thinnest
 * end of the ramp, and measured 2.08:1 on a phone; nothing short of painting
 * out the crop would have fixed it where it stood. Both now sit on the sand
 * ground under their frame, in the same footer row.
 *
 * The count is still the one number on the card and it is still real: the tile
 * only exists because that count is non-zero. It does the work a price or a
 * rating would do elsewhere — it tells the visitor there is something behind
 * the link before they spend a click finding out.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import { experienceAsset } from "@/lib/media/experiences";
import type { PublishedExperience } from "@/lib/experiences";

/** "1 journey" / "4 journeys" — the tile's only number, and it is derived. */
const journeyLabel = (n: number) => `${n} ${n === 1 ? "journey" : "journeys"}`;

export default function ExperienceCard({
  experience,
  index = 0,
  variant = "default",
}: {
  experience: PublishedExperience;
  index?: number;
  /** `feature` is the lead tile: editorial scale, copy set on the photograph. */
  variant?: "default" | "feature";
}) {
  return variant === "feature" ? (
    <FeatureTile experience={experience} index={index} />
  ) : (
    <GridTile experience={experience} index={index} />
  );
}

/* ------------------------------- Grid tile -------------------------------- */

function GridTile({
  experience: { category, tours },
  index,
}: {
  experience: PublishedExperience;
  index: number;
}) {
  return (
    /*
      `h-full` down the whole chain so every tile in a row is the height of the
      tallest, which is what lets the footer row below hang off `mt-auto` and
      line up across the grid. Blurbs run one to three lines and the activity
      lists wrap differently; without this the "Explore" line would step up and
      down across a row.
    */
    <Reveal index={index} className="h-full">
      <Link
        href={`/experiences/${category.slug}`}
        className="group flex h-full flex-col"
      >
        {/*
          Portrait, and no overlay of any kind. The crop was 4/3 when it had to
          hold four lines of type; with the copy underneath it can be the shape
          that suits the photograph, and 4/5 gives a category image a third more
          area to be recognised in.
        */}
        <div className="img-frame aspect-[4/5]">
          <Img
            asset={experienceAsset(category.slug)}
            /* Off, and staying off: an unchecked asset here would put a
               photograph of somewhere else behind a category name. */
            requireVerifiedLocation
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            fallbackTone={index % 2 === 0 ? "moss" : "deep"}
            fallbackPattern="contour"
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <h3 className="h-display text-2xl text-ink transition-colors group-hover:text-copper-deep md:text-[1.75rem]">
            {category.name}
          </h3>
          <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-ink/70">
            {category.blurb}
          </p>

          <div className="mt-auto">
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-ink/10 pt-4">
              {category.activities.slice(0, 3).map((a) => (
                <li
                  key={a}
                  className="text-[11px] uppercase tracking-[0.14em] text-ink/65"
                >
                  {a}
                </li>
              ))}
              {category.activities.length > 3 && (
                <li className="text-[11px] uppercase tracking-[0.14em] text-copper-deep">
                  +{category.activities.length - 3}
                </li>
              )}
            </ul>

            <p className="mt-4 flex items-center justify-between gap-4 text-[12px] uppercase tracking-[0.16em]">
              <span className="text-ink/65">{journeyLabel(tours.length)}</span>
              <span className="flex items-center gap-2 text-copper-deep">
                Explore
                <ArrowRight
                  size={14}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </p>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

/* ------------------------------ Feature tile ------------------------------ */

function FeatureTile({
  experience: { category, tours },
  index,
}: {
  experience: PublishedExperience;
  index: number;
}) {
  return (
    <Reveal index={index}>
      <Link href={`/experiences/${category.slug}`} className="group block">
        <div className="img-frame aspect-[4/5] md:aspect-[16/10]">
          <Img
            asset={experienceAsset(category.slug)}
            requireVerifiedLocation
            sizes="(min-width: 1216px) 1216px, 100vw"
            fallbackTone="moss"
            fallbackPattern="contour"
            className="transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />

          {/*
            ── The one scrim left on this page, and why it is shaped like this ─

            The lead tile keeps its copy on the photograph, because at this
            scale a title set into the frame is the point of the tile — it is
            the cover of the section, not another item in the grid. So it needs
            a floor under the type, and the question is only how much of the
            picture that floor is allowed to cost.

            The old one was `from-deep via-deep/70 to-deep/10`: a linear ramp
            across the entire frame that still had 70% of flat colour over the
            *middle* of the photograph, where nothing was written. This one is
            anchored to the bottom, capped at 58% of the frame on desktop and
            70% on a phone, and eased rather than linear — seven stops
            approximating an ease-in curve, because a two-stop linear ramp is
            what makes a scrim read as a grey wash with a visible edge partway
            up. The top 42% of the desktop crop and the top 30% of the phone
            crop are untouched, and the falloff finishes somewhere the eye does
            not find a line.

            The block under it got shorter as well: with the journey count moved
            out to the footer, the smallest type left inside the frame is the
            activity list, and that sits along the bottom edge where the ramp is
            heaviest anyway. See the note at the top of this file.

            Two stop sets because the geometry differs, not for taste: the tile
            is 16/10 on desktop where the copy fills the bottom 30%, and 4/5 on
            a phone where the same copy fills 42% of a much shorter frame. The
            phone set is taller and steeper for that reason. If the copy or the
            aspect ratio changes these need re-measuring — they are positional,
            not decorative. As shipped the worst run in this frame measures
            7.15:1 on desktop and 3.52:1 on a phone, the latter being the title,
            which is large text and needs 3.

            The colour is written out in rgba rather than taken from the token
            because Tailwind cannot interpolate a named colour across seven
            stops. It is one of five files that spell `deep` out this way —
            `grep 'rgba(3,39,34'` finds all of them — so a palette change has
            to reach them by hand.
          */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(3,39,34,0.92)_0%,rgba(3,39,34,0.86)_16%,rgba(3,39,34,0.74)_30%,rgba(3,39,34,0.55)_44%,rgba(3,39,34,0.33)_58%,rgba(3,39,34,0.13)_74%,transparent_100%)] md:h-[58%] md:bg-[linear-gradient(to_top,rgba(3,39,34,0.90)_0%,rgba(3,39,34,0.82)_18%,rgba(3,39,34,0.66)_34%,rgba(3,39,34,0.44)_50%,rgba(3,39,34,0.23)_66%,rgba(3,39,34,0.08)_82%,transparent_100%)]"
          />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <h3 className="h-display text-3xl text-sand md:text-5xl">
              {category.name}
            </h3>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-sand/80 md:text-base">
              {category.blurb}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-sand/20 pt-4">
              {category.activities.map((a) => (
                <li
                  key={a}
                  className="text-[11px] uppercase tracking-[0.14em] text-sand/70"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Same footer rhythm as the grid tiles: the count on the left, the
            action on the right. It reads as one row across the section rather
            than as two different components that happen to sit together. */}
        <p className="mt-3 flex items-center justify-between gap-4 text-[12px] uppercase tracking-[0.16em]">
          <span className="text-ink/65">{journeyLabel(tours.length)}</span>
          <span className="flex items-center gap-2 text-copper-deep transition-colors group-hover:text-ink">
            Explore {category.name}
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </p>
      </Link>
    </Reveal>
  );
}

/**
 * The social-proof rail — real guest reviews, placed where a decision is made.
 *
 * ── The problem this solves ────────────────────────────────────────────────
 *
 * Reviews exist in the data layer (`getReviews`), render through a good card
 * (`ReviewCard`), and are reachable at /about#reviews. They appear on exactly
 * one route, and that route is the page about the company — not the homepage,
 * not a journey page, not the booking page. Every point on the site where
 * someone decides whether to trust us has no proof on it at all.
 *
 * This component is the fix: one block, mountable on any ground, that can sit
 * at the bottom of a journey page, between the homepage's journeys and its
 * CTA, or above the booking form.
 *
 * ── Why it renders nothing when there is nothing ───────────────────────────
 *
 * `lib/content.ts` ships `reviews: []` — the invented testimonials were
 * removed in Phase 0 and the real ones are still being collected. /about
 * handles that with a written empty state, and that is right for /about:
 * the page is about us, candour is on-brand there, and the section is
 * promised by the navigation.
 *
 * It would be wrong everywhere else. An apology for having no reviews, placed
 * at the foot of a journey page, is worse than silence — it introduces a doubt
 * the visitor did not arrive with. So this returns null on an empty set, which
 * also means it can be mounted on every route *now*, before the reviews
 * exist, and will light up by itself the moment the first one is published
 * through the admin. No second deploy, nothing to remember.
 *
 * ── Why there is no aggregateRating here ───────────────────────────────────
 *
 * Tempting, and wrong. Google's structured-data policy disallows self-serving
 * review markup: an Organization or LocalBusiness may not carry
 * `aggregateRating` for reviews collected and displayed on its own site, and
 * marking it up anyway risks a manual action against the whole domain rather
 * than a quietly ignored snippet. Reviews here are therefore rendered as
 * content only. If starred results are the goal, the route is a third-party
 * platform Google already trusts — Google Business Profile or TripAdvisor —
 * not markup we write about ourselves.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReviewCard } from "@/components/ui";
import { SectionHeading } from "@/components/ui-client";
import type { Review } from "@/lib/content";

export default function ReviewRail({
  reviews,
  eyebrow = "Guest stories",
  title = "In their words",
  intro,
  limit = 3,
  dark = false,
  href = "/about#reviews",
}: {
  reviews: Review[];
  eyebrow?: string;
  title?: string;
  intro?: string;
  /** How many cards to show. The grid is built for three. */
  limit?: number;
  dark?: boolean;
  /** Where "read more" goes. Null hides the link entirely. */
  href?: string | null;
}) {
  const shown = reviews.slice(0, limit);

  /* See the header note: silence, not an apology, on a page that is selling. */
  if (shown.length === 0) return null;

  return (
    <section
      className={`section-tight ${
        dark ? "bg-deep" : "border-t border-ink/10 bg-dune/60"
      }`}
    >
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            dark={dark}
          />
          {href && (
            <Link
              href={href}
              className={`link-line shrink-0 text-[13px] uppercase tracking-[0.16em] ${
                dark ? "text-mango" : "text-copper-deep"
              }`}
            >
              Read more <ArrowRight size={14} className="inline" aria-hidden />
            </Link>
          )}
        </div>

        {/*
          One, two or three reviews all have to look deliberate rather than
          like a grid with holes in it. `sm:grid-cols-2 lg:grid-cols-3` would
          leave a single review stretched across a third of the page with two
          empty cells beside it, so the column count is capped by what is
          actually there. ReviewCard is h-full, so a long quote beside a short
          one still gives two cards of equal height.
        */}
        <div
          className={`mt-12 grid gap-6 ${
            shown.length === 1
              ? "max-w-2xl"
              : shown.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {shown.map((r, i) => (
            <ReviewCard key={`${r.name}-${i}`} r={r} index={i % 3} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  );
}

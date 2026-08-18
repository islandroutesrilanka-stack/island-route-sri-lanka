/**
 * Featured Journey (homepage §07).
 *
 * ONE journey, hand-picked in the CMS. Not a carousel; nothing auto-rotates.
 * An editorial feature is chosen, not cycled.
 *
 * Four valid render states, each designed rather than one design with holes:
 *   journey only · +quote · +guide note · all three
 *
 * The traveller quote appears only when a real, attributable review exists. If
 * none does the block is omitted entirely — no placeholder, no empty quote
 * marks, no skeleton. There are currently zero verified reviews, so this ships
 * journey-only and upgrades itself the moment a real one is added.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import Img from "@/components/media/Img";
import GradientPanel from "@/components/media/GradientPanel";
import { assetBySrc, fromCmsUrl } from "@/lib/media/registry";
import type { MediaAsset } from "@/lib/media/types";
import type { Tour } from "@/lib/tours";
import type { Destination } from "@/lib/destinations";
import type { Review } from "@/lib/content";
import { lowestDayRate, money, tripDays } from "@/lib/pricing";

export type FeaturedJourney = {
  tour: Tour;
  images: (MediaAsset | null)[];
  routeNote: string;
  /** Only ever a real, attributable review. Null is the normal state today. */
  quote: Review | null;
};

/** Build the feature from CMS settings; null when no tour can be resolved. */
export function buildFeaturedJourney(
  tours: Tour[],
  settings: {
    featuredJourneySlug: string;
    featuredJourneyNote: string;
    featuredJourneyImage1: string;
    featuredJourneyImage2: string;
    featuredJourneyImage3: string;
  },
  reviews: Review[],
  /**
   * Used only to fill the two smaller frames when the CMS hasn't. See the
   * fallback note below — this is why the parameter exists.
   */
  destinations: Destination[] = []
): FeaturedJourney | null {
  const chosen =
    tours.find((t) => t.slug === settings.featuredJourneySlug.trim()) ??
    tours.find((t) => t.featured) ??
    tours[0];

  // Fail safe: a deleted or unpublished tour hides the section rather than
  // rendering a broken link.
  if (!chosen) return null;

  const urls = [
    settings.featuredJourneyImage1,
    settings.featuredJourneyImage2,
    settings.featuredJourneyImage3,
  ];

  /*
   * ── Why the two smaller frames have a fallback at all ──────────────────────
   *
   * Only the first frame used to fall back to the journey's own image; frames
   * two and three showed a GradientPanel unless someone had filled
   * featuredJourneyImage2/3 in Settings. Nobody had, so the largest editorial
   * block on the homepage was one photograph and two coloured rectangles — and
   * because the empty state was silent, nothing ever said so.
   *
   * The fallback is the journey's own route, in two passes, and both are
   * curated rather than inferred — which is the only reason this is safe:
   *
   *   1. `destinationSlugs` — the stops that have a guide page. Hand-listed
   *      precisely because name-matching produced false positives (Tangalle
   *      matched Galle), so nothing incidental can slip in.
   *   2. `storyImages` — the stops that don't. Anuradhapura, Mannar, Delft and
   *      the rest are real days on these itineraries with no page to link to,
   *      and without this pass the northern passage, which has no
   *      `destinationSlugs` at all, would still have nothing to draw on.
   *
   * Both are photographs of places the journey actually goes, already
   * location-checked and already self-hosted. Anything the CMS supplies still
   * wins, per slot: this is the floor, not a ceiling.
   */
  const seen = new Set([chosen.image]);
  const spare: MediaAsset[] = [];
  const offer = (asset: MediaAsset | null) => {
    // De-duplicate on src: several destinations share a photograph with the
    // tour that features them, and a triptych repeating itself looks worse
    // than one frame short.
    if (!asset?.src || seen.has(asset.src)) return;
    seen.add(asset.src);
    spare.push(asset);
  };

  for (const slug of chosen.destinationSlugs ?? []) {
    const d = destinations.find((x) => x.slug === slug);
    if (!d?.image) continue;
    offer(
      assetBySrc(d.image) ??
        fromCmsUrl(d.image, `${d.name} — on the ${chosen.title} route`)
    );
  }
  for (const src of chosen.storyImages ?? []) offer(assetBySrc(src));

  let taken = 0;
  const images = urls.map((url, i) => {
    if (url.trim()) return fromCmsUrl(url.trim(), `${chosen.title} — image ${i + 1}`);
    if (i === 0 && chosen.image) return fromCmsUrl(chosen.image, chosen.title);
    return spare[taken++] ?? null;
  });

  // A quote is used only if it names this journey explicitly.
  const quote =
    reviews.find(
      (r) => r.trip && r.trip.toLowerCase().includes(chosen.title.toLowerCase())
    ) ?? null;

  return {
    tour: chosen,
    images,
    routeNote: settings.featuredJourneyNote.trim(),
    quote,
  };
}

export default function JourneyStory({ feature }: { feature: FeaturedJourney }) {
  const { tour, images, routeNote, quote } = feature;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Offset editorial image arrangement — one large, two smaller */}
      <div className="lg:col-span-7">
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          <Reveal className="col-span-5">
            <div className="img-frame relative aspect-[16/10]">
              {images[0] ? (
                <Img asset={images[0]} sizes="(max-width: 1024px) 100vw, 55vw" />
              ) : (
                <GradientPanel tone="moss" rule className="h-full w-full" />
              )}
            </div>
          </Reveal>
          <Reveal index={1} className="col-span-3">
            <div className="img-frame relative aspect-[4/3]">
              {images[1] ? (
                <Img asset={images[1]} sizes="(max-width: 1024px) 60vw, 33vw" />
              ) : (
                <GradientPanel tone="deep" className="h-full w-full" />
              )}
            </div>
          </Reveal>
          <Reveal index={2} className="col-span-2 mt-8">
            <div className="img-frame relative aspect-[3/4]">
              {images[2] ? (
                <Img asset={images[2]} sizes="(max-width: 1024px) 40vw, 22vw" />
              ) : (
                <GradientPanel tone="moss" className="h-full w-full" />
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-6">
        <Reveal>
          <p className="eyebrow text-copper-deep">Featured journey</p>
          <h2 className="h-display mt-3 text-4xl leading-tight text-ink md:text-5xl">
            {tour.title}
          </h2>
          <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-ink/65">
            {tour.duration}
            {(() => {
              const d = tripDays(tour.duration);
              return d
                ? ` · transport from ${money(lowestDayRate * d)}, all-inclusive`
                : ` · transport from ${money(lowestDayRate)} a day`;
            })()}
          </p>
          <p className="mt-6 text-[16px] leading-relaxed text-ink/75">
            {tour.excerpt}
          </p>
        </Reveal>

        {/* Route line — the itinerary as a drawn sequence, not a table */}
        {tour.itinerary && tour.itinerary.length > 0 && (
          <Reveal index={1}>
            <ol className="mt-8 border-l border-copper/30 pl-5">
              {tour.itinerary.slice(0, 5).map((d) => (
                <li key={d.day} className="relative pb-4 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[23px] top-2 block h-1.5 w-1.5 rounded-full bg-copper"
                  />
                  <p className="text-[11px] uppercase tracking-[0.16em] text-copper-deep">
                    {d.day}
                  </p>
                  <p className="mt-0.5 text-[15px] text-ink/80">{d.title}</p>
                </li>
              ))}
              {tour.itinerary.length > 5 && (
                <li className="text-[13px] italic text-ink/65">
                  …and {tour.itinerary.length - 5} more days
                </li>
              )}
            </ol>
          </Reveal>
        )}

        {routeNote && (
          <Reveal index={2}>
            <p className="mt-6 text-[15px] italic leading-relaxed text-ink/65">
              {routeNote}
            </p>
          </Reveal>
        )}

        {/* Traveller quote — rendered only when a real one exists */}
        {quote && (
          <Reveal index={3}>
            <figure className="mt-8 border-t border-ink/10 pt-7">
              <blockquote className="font-display text-xl leading-relaxed text-ink/85">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-ink/65">
                {quote.name}
                {quote.country && ` · ${quote.country}`}
              </figcaption>
            </figure>
          </Reveal>
        )}

        <Reveal index={4}>
          <Link
            href={`/tours/${tour.slug}`}
            className="mt-9 inline-flex items-center gap-2.5 bg-ink px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep"
          >
            See the full itinerary <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

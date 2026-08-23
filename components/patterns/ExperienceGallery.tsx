/**
 * The photo band on an experience detail page.
 *
 * ── Why it is not another card grid ───────────────────────────────────────
 *
 * This page already ends with two of them: the journey cards and, under
 * "Where these journeys go", a four-across grid of destination cards. A third
 * grid of equal tiles would read as a repeat of the second one, and the visitor
 * would stop looking at it for that reason alone.
 *
 * So this is a mosaic instead: one lead frame at twice the size, four tiles
 * beside it, no captions in the frames and nothing clickable. It is the one
 * place on the page where photography is allowed to be the content rather than
 * the illustration of something else. The geometry is exact rather than
 * approximate — the lead spans two columns and two rows, so its height is the
 * two tile rows plus the gap between them, and the block closes on a straight
 * edge at every breakpoint.
 *
 * ── Why the words are underneath ──────────────────────────────────────────
 *
 * Same rule as the hero above and the cards on the index: type at 13px needs
 * 4.5:1, which no scrim over a photograph can honestly promise, so nothing is
 * set over these frames at all. The places and the photographers go under the
 * band on sand, where they measure 4.9:1 and better.
 *
 * ── The credit line is an obligation ──────────────────────────────────────
 *
 * Most of these come from Wikimedia Commons under CC BY or CC BY-SA, which
 * require the photographer named and the licence stated wherever the image
 * appears. `assetCredits` reads that off the assets themselves and skips the
 * owner's own photography, which needs no credit — so adding a Commons file to
 * a gallery in lib/media/experiences.ts attributes it here automatically, and
 * forgetting to attribute one is not possible without editing the registry to
 * remove fields its own type makes mandatory.
 */
import Img from "@/components/media/Img";
import { Reveal } from "@/components/motion";
import { assetCredits } from "@/lib/media/experiences";
import type { MediaAsset } from "@/lib/media/types";

export default function ExperienceGallery({
  assets,
  heading,
}: {
  assets: MediaAsset[];
  /** The section's own title — the caller phrases it. */
  heading: string;
}) {
  /* Five is the shape: one lead plus four. Fewer would leave a hole in the
     mosaic rather than reflowing, so a short list is not rendered at all —
     an absent band is a better failure than a broken one. */
  if (assets.length < 5) return null;

  const [lead, ...tiles] = assets.slice(0, 5);
  const credits = assetCredits(assets);
  const places = assets
    .map((a) => a.depicts)
    .filter((d): d is string => Boolean(d));

  return (
    <section
      className="border-t border-ink/10 py-14 md:py-20"
      aria-labelledby="gallery"
    >
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <Reveal>
          {/* The eyebrow is a <p> and the display line is the <h2>, matching
              PageHeader: the label is a label, and the heading the section is
              named by is the line a reader would actually call its title. */}
          <p className="eyebrow text-copper-deep">In pictures</p>
          <h2
            id="gallery"
            className="h-display mt-3 max-w-2xl text-3xl leading-tight text-ink md:text-4xl"
          >
            {heading}
          </h2>
        </Reveal>

        <Reveal index={1}>
          <figure className="mt-8 md:mt-10">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {/* The lead. `aspect-auto` at md hands sizing to the row span:
                  the grid rows are set by the 4/5 tiles beside it, so the lead
                  is exactly two of them tall and needs no ratio of its own. */}
              <div className="img-frame col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto">
                <Img
                  asset={lead}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  fallbackTone="dune"
                  fallbackPattern="contour"
                />
              </div>
              {tiles.map((asset) => (
                <div key={asset.src} className="img-frame aspect-[4/5]">
                  <Img
                    asset={asset}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    fallbackTone="dune"
                    fallbackPattern="contour"
                  />
                </div>
              ))}
            </div>

            <figcaption className="mt-5 text-[13px] leading-relaxed text-ink/70">
              {places.join(" · ")}
              {credits.length > 0 && (
                <span className="mt-2 block text-ink/65">
                  Photographs:{" "}
                  {credits.map((c, i) => (
                    <span key={c.src}>
                      {i > 0 && "; "}
                      {c.author} ·{" "}
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-ink/25 underline-offset-2 transition-colors hover:text-copper-deep"
                      >
                        {c.license}
                      </a>
                    </span>
                  ))}
                </span>
              )}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The homepage intro — the one argument the page makes before it starts
 * selling, sitting directly under the hero.
 *
 * It opens with a lead statement rather than going straight to pillars. The
 * band used to jump from a small eyebrow to three h3s at 2.5rem, which gave
 * the page three competing entry points and no sentence anywhere saying what
 * the business is. One display line fixes that and costs one line of copy.
 *
 * The pillars beneath it are the same three claims, cut to a line each. They
 * were two and three sentences before, which is the length that gets skimmed
 * past; at a line each they can actually be read on the way down. Their type
 * scale dropped a step too — they are support for the statement above now,
 * not three headlines of their own.
 *
 * Every claim here is about how the business operates. No figures, no ratings,
 * no credentials — nothing that would need verifying.
 */
import { Reveal } from "@/components/motion";
import { site, waLink, defaultWaMessage } from "@/lib/site";

const PILLARS = [
  {
    index: "01",
    title: "Locally owned",
    body: "Run from the island by the people who drive it — no overseas call centre, no agency margin in the middle.",
  },
  {
    index: "02",
    title: "Private",
    body: "Your own vehicle and chauffeur-guide for the whole journey, yours to redirect over breakfast.",
  },
  {
    index: "03",
    title: "Direct",
    body: "The same names planning, driving and answering — before, during and after the trip.",
  },
];

export default function TrustBand() {
  return (
    <section className="border-b border-ink/10 bg-sand section-tight">
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <Reveal>
          {/* The section's own heading. The three pillars below are h3s beneath
              it rather than three sibling h2s with nothing above them. */}
          <h2 className="eyebrow text-copper-deep">Why Island Route</h2>
        </Reveal>

        <Reveal index={1}>
          {/* Held to ~28 characters a line at display size. Wider than this and
              the eye loses the start of the next line at this scale. */}
          <p className="h-display mt-7 max-w-[19ch] text-[clamp(2rem,4.6vw,3.5rem)] text-ink md:max-w-[24ch]">
            Sri Lanka planned and driven by the people who live here.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-x-14 gap-y-12 md:mt-24 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} index={i + 2}>
              <div className="border-t border-ink/15 pt-6">
                {/* Full copper-deep, not /70. At 14px this is body-sized text
                    and WCAG asks 4.5:1 of it; /70 composited over sand is
                    3.15:1. The numeral still reads as a quiet index because it
                    is small and set in the display face, not because it is
                    faded. */}
                <p className="font-display text-sm text-copper-deep">
                  {p.index}
                </p>
                <h3 className="h-display mt-3 text-2xl text-ink md:text-[1.75rem]">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink/70">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Subordinate by design — one quiet line, not a fourth pillar */}
        <Reveal index={5}>
          <p className="mt-14 border-t border-ink/10 pt-6 text-[13px] leading-relaxed text-ink/65 md:mt-20">
            One number on WhatsApp for the whole journey —{" "}
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line text-ink/75 hover:text-copper-deep"
            >
              {site.whatsappDisplay}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

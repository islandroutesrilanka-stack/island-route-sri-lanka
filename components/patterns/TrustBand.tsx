/**
 * The Island Route difference — three pillars (homepage, directly after the hero).
 *
 * This replaces the four small text blocks that used to sit inside the hero.
 * Crowded under the headline they read as feature bullets on a landing page;
 * given their own band with real typographic scale they read as an argument.
 *
 * The WhatsApp proposition is kept but deliberately subordinated to a single
 * line beneath the rule — it is a service detail, not a reason to book, and at
 * pillar weight it competed with the three claims that matter.
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
    body: "Run from the island by the people who drive it. No overseas call centre, no agency taking a margin in the middle.",
  },
  {
    index: "02",
    title: "Private",
    body: "Your own vehicle and chauffeur-guide for the whole journey. Leave at first light, stay a second night, change the plan over breakfast.",
  },
  {
    index: "03",
    title: "Direct",
    body: "You talk to the people who plan and drive your trip — before, during and after it. The same names, start to finish.",
  },
];

export default function TrustBand() {
  return (
    <section className="border-b border-ink/10 bg-sand py-16 md:py-24">
      <div className="mx-auto max-w-wrap px-5 md:px-8">
        <Reveal>
          {/* The section's own heading. The three pillars below are h3s beneath
              it rather than three sibling h2s with nothing above them. */}
          <h2 className="eyebrow text-copper-deep">Why Island Route</h2>
        </Reveal>

        <div className="mt-10 grid gap-x-10 gap-y-10 md:mt-14 md:grid-cols-3 md:gap-x-14">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} index={i}>
              <div className="border-t border-ink/15 pt-6">
                <p className="font-display text-sm text-copper-deep/70">{p.index}</p>
                <h3 className="h-display mt-3 text-3xl text-ink md:text-[2.5rem]">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink/70">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Subordinate by design — one quiet line, not a fourth pillar */}
        <Reveal index={3}>
          <p className="mt-12 border-t border-ink/10 pt-6 text-[13px] leading-relaxed text-ink/65 md:mt-16">
            One number on WhatsApp for the whole journey —{" "}
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line text-ink/75 hover:text-copper-deep"
            >
              {site.phoneDisplay}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

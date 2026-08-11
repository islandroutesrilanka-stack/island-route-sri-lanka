import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users, Briefcase, Check } from "lucide-react";
import { PageHeader, CTABand, SectionHeading, ReviewCard } from "@/components/ui";
import Img from "@/components/media/Img";
import EmptyState from "@/components/patterns/EmptyState";
import { Reveal } from "@/components/motion";
import { getFleet, getReviews } from "@/lib/data";
import { fromCmsUrl } from "@/lib/media/registry";
import { img } from "@/lib/images";
import { waLink, defaultWaMessage, site } from "@/lib/site";

/*
  /fleet and /reviews were merged into this page and now 301 to #fleet and
  #reviews (see next.config.mjs). Both arrived whole — every vehicle, every
  review, both booking CTAs and both empty states. A redirect that drops
  content is a redirect to a soft 404 in Google's eyes, and the fleet listing
  in particular is the page that answers "what will I actually be sitting in".
*/
export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Island Route — Our Story, Fleet & Reviews",
  description:
    "Island Route Sri Lanka is a locally-owned travel company crafting private, chauffeur-driven journeys across the island. Meet the team, the insured air-conditioned fleet, and read what guests say.",
  alternates: { canonical: "/about" },
};

/** Section jump links — the merge made this page long enough to need them. */
const sections = [
  ["Our story", "#story"],
  ["What we stand for", "#promises"],
  ["The fleet", "#fleet"],
  ["Guest reviews", "#reviews"],
] as const;

export default async function AboutPage() {
  const [fleet, reviews] = await Promise.all([getFleet(), getReviews()]);
  const hasReviews = reviews.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Built on the island, for the island"
        intro="Island Route began with one driver, one well-loved car, and a belief that Sri Lanka deserved better than rushed bus tours."
        image={img.sunraysValley}
      />

      <nav
        aria-label="On this page"
        className="border-b border-ink/10 bg-sand/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-wrap gap-x-7 gap-y-2 overflow-x-auto px-5 py-4 md:px-8">
          {sections.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 text-[12px] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:text-copper-deep"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ══════════════════ Story ══════════════════ */}
      <section id="story" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <Reveal>
              {/* Copy kept free of unverified figures — see Phase 0 notes. */}
              <p className="text-[17px] leading-relaxed text-ink/75">
                We noticed something on airport runs: travellers arrived with
                spreadsheets of dreams and left having seen a fraction of them —
                lost to bad timing, tourist-trap detours and drivers paid in
                commissions rather than smiles.
              </p>
              <p className="mt-5 text-[17px] leading-relaxed text-ink/75">
                So we built the company we&apos;d want as guests: honest fixed
                quotes, drivers who are genuine hosts, and routes designed
                around light, weather and quiet moments — not gift-shop stops.
                Our fleet is small and our chauffeur-guides are hand-picked, and
                we take on no more travellers than we can look after personally.
              </p>
            </Reveal>
            {/*
              A "10+ / 2,400+ / 30+" statistics row stood here. The figures were
              never verified, so they were removed in Phase 0 rather than
              shipped as fact. Supply the real numbers and this block returns —
              the three-column layout is kept in the design system for it.
            */}
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
            <Reveal index={1} className="img-frame aspect-[3/4]">
              <Image src={img.templeKandy} alt="Temple in Kandy" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
            </Reveal>
            <Reveal index={2} className="img-frame aspect-[3/4] mt-10">
              <Image src={img.coastalDrive} alt="Coastal road journey" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════ Promises ══════════════════ */}
      <section id="promises" className="scroll-mt-24 bg-dune/60 py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="What we stand for"
            title="Three promises on every journey"
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              [
                "Honesty first",
                "Transparent quotes with everything included — fuel, parking, driver accommodation. The price we agree is the price you pay.",
              ],
              [
                "People over itineraries",
                "Tired kids, a surf swell, a festival you spotted from the window — plans bend around you, not the other way round.",
              ],
              [
                "Leave it better",
                "We work with family-run guesthouses, local guides and ethical wildlife operators, so your journey gives back to the island that hosts it.",
              ],
            ].map(([t, b], i) => (
              <Reveal key={t} index={i}>
                <div className="border border-ink/10 bg-sand p-8 h-full">
                  <p className="font-display text-4xl text-copper-deep/50">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-2xl text-ink mt-4">{t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal index={2}>
            <p className="mt-12 text-ink/70">
              Curious what guests say?{" "}
              <a href="#reviews" className="text-copper-deep underline">
                Read their stories →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════ Fleet (was /fleet) ══════════════════ */}
      <section id="fleet" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="The fleet"
            title="Travel in quiet comfort"
            intro="Every vehicle is late-model, well maintained, insured and driven by a professional English-speaking chauffeur. Choose your ride — or let us match one to your route."
          />

          {fleet.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                eyebrow="The fleet"
                title="Fleet details are being updated"
                body="Vehicle listings aren't live at the moment. Tell us your group size and route and we'll confirm exactly what you'll travel in."
                action={{ label: "Plan your journey", href: "/book" }}
              />
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              {fleet.map((v, i) => (
                <Reveal key={v.slug}>
                  <div className="grid gap-0 md:grid-cols-12 border border-ink/10 bg-white/50 overflow-hidden">
                    <div className={`img-frame aspect-[16/10] md:aspect-auto md:min-h-[22rem] md:col-span-5 ${i % 2 ? "md:order-2" : ""}`}>
                      {/* Via <Img> so a retired or absent image degrades to the
                          gradient treatment instead of throwing on an empty src.
                          No verification gate: a vehicle makes no place claim. */}
                      <Img
                        asset={fromCmsUrl(v.image, v.name)}
                        sizes="(max-width:768px) 100vw, 42vw"
                        fallbackTone="moss"
                      />
                    </div>
                    <div className="md:col-span-7 p-7 md:p-10">
                      <p className="eyebrow text-copper-deep">{v.category}</p>
                      <h3 className="h-display text-3xl md:text-4xl text-ink mt-2">
                        {v.name}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink/70">
                        <span className="inline-flex items-center gap-2">
                          <Users size={15} className="text-copper-deep" /> Up to {v.passengers} guests
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Briefcase size={15} className="text-copper-deep" /> {v.luggage}
                        </span>
                      </div>
                      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                        {v.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                            <Check size={15} className="mt-0.5 shrink-0 text-copper-deep" /> {f}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 text-sm text-ink/70 italic">{v.idealFor}</p>
                      <Link
                        href={`/book?service=${encodeURIComponent("Private Driver Hire")}&tour=${encodeURIComponent(v.name)}`}
                        className="mt-7 inline-block bg-ink text-sand px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                      >
                        Book this vehicle
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}

              <Reveal>
                <p className="border-t border-ink/10 pt-8 text-[15px] text-ink/70">
                  Not sure which vehicle fits? Tell us your group size, luggage
                  and route —{" "}
                  <Link href="/book" className="text-copper-deep underline">
                    we&apos;ll recommend one in your quote
                  </Link>
                  , at no obligation.
                </p>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ Reviews (was /reviews) ══════════════════ */}
      <section id="reviews" className="scroll-mt-24 bg-dune/60 py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <SectionHeading
            eyebrow="Guest stories"
            title="The reviews we work for"
            intro={
              hasReviews
                ? "Every journey ends with a goodbye at the airport — and, more often than not, words like these."
                : "Every journey ends with a goodbye at the airport. We would rather show you nothing here than show you words we wrote ourselves."
            }
          />

          {hasReviews ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r, i) => (
                <ReviewCard key={r.name} r={r} index={i % 3} />
              ))}
            </div>
          ) : (
            /*
              Deliberate empty state rather than a hidden section.
              The invented testimonials were removed in Phase 0; until real,
              attributable reviews are added through the admin dashboard, this
              says so plainly. Candour reads better than a blank grid — and far
              better than fabricated praise.
            */
            <div className="mt-12 max-w-2xl">
              <Reveal>
                <p className="eyebrow text-copper-deep">Nothing to show you yet</p>
                <h3 className="h-display mt-4 text-2xl md:text-3xl text-ink">
                  We would rather be honest than impressive
                </h3>
                <p className="mt-6 text-[17px] leading-relaxed text-ink/70">
                  We are collecting reviews from recent guests and will publish
                  them here with their names and journeys attached — the real
                  ones, or none at all.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-ink/65">
                  In the meantime, ask us anything directly. We will happily put
                  you in touch with travellers who have made the journey you are
                  considering.
                </p>
                <div className="mt-9 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/book"
                    className="bg-ink text-sand px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                  >
                    Plan your journey
                  </Link>
                  <a
                    href={waLink(defaultWaMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-ink/20 text-ink px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] hover:bg-ink hover:text-sand transition-colors"
                  >
                    WhatsApp {site.phoneDisplay}
                  </a>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </section>

      <CTABand />
    </>
  );
}

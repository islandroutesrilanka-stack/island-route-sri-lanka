import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, CTABand, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "About Island Route",
  description:
    "Island Route Sri Lanka is a locally-owned travel company crafting private, chauffeur-driven journeys across the island — direct, personal and never a group coach.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Built on the island, for the island"
        intro="Island Route began with one driver, one well-loved car, and a belief that Sri Lanka deserved better than rushed bus tours."
        image={img.sunraysValley}
      />

      <section className="py-16 md:py-24">
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

      <section className="bg-dune/60 py-16 md:py-24">
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
              <Link href="/reviews" className="text-copper-deep underline">
                Read their stories →
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}

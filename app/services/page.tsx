import type { Metadata } from "next";
import Link from "next/link";
import {
  Plane,
  Navigation,
  Car,
  Waves,
  Hotel,
  Route,
  Sun,
  Map,
  Binoculars,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Languages,
  ArrowRight,
} from "lucide-react";
import Img from "@/components/media/Img";
import { fromCmsUrl } from "@/lib/media/registry";
import { PageHeader, CTABand, SectionHeading } from "@/components/ui";
import EmptyState from "@/components/patterns/EmptyState";
import { Reveal } from "@/components/motion";
import { getServices } from "@/lib/data";
import type { Service } from "@/lib/content";
import { commonsPlaces } from "@/lib/media/commons";
import { waLink } from "@/lib/site";

export const revalidate = 60;

/*
  Phase 3 scope: this page is now about transport and driver hire only.

  Day Tours, Multi-Day Tours and Safari Tours were removed — they restated the
  journey catalogue in different words and competed with /tours for the same
  searches. The removal is enforced in getServices (lib/data.ts), not here, so
  the page renders whatever the CMS legitimately holds.

  Because those three were a real entry point, the page now signposts /tours
  and /experiences explicitly rather than leaving that traffic with nowhere to
  go — see the "Looking for the journeys themselves?" band below.
*/
export const metadata: Metadata = {
  title: "Transfers & Private Drivers",
  description:
    "Airport transfers, private driver hire, taxis, surf and hotel transfers, and custom-planned routes across Sri Lanka — fixed prices and professional English-speaking chauffeurs.",
  alternates: { canonical: "/services" },
};

/** CMS `icon` values → lucide components. Exhaustive over the union so a new
 *  icon option in the admin select cannot silently fall through to a default. */
const icons: Record<Service["icon"], typeof Plane> = {
  plane: Plane,
  steering: Navigation,
  car: Car,
  sun: Sun,
  map: Map,
  binoculars: Binoculars,
  waves: Waves,
  hotel: Hotel,
  route: Route,
};

/* Every claim here is already made elsewhere on the site — the fixed-price
   promise on /about, the chauffeur and vehicle standards on /about#fleet, the
   24/7 hours on /book. Nothing new is asserted. */
const standards = [
  [BadgeCheck, "One fixed price", "Agreed before you travel — fuel, parking and driver costs included."],
  [Languages, "English-speaking chauffeur", "A professional host at the wheel, not just a driver."],
  [ShieldCheck, "Insured, air-conditioned vehicle", "Late-model and maintained, matched to your group and luggage."],
  [Clock, "Any hour, any day", "Flights land at all hours. So do we."],
] as const;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="However you need to move, we drive it"
        intro="Transport and private chauffeurs across Sri Lanka — from a midnight airport pickup to a fortnight with your own driver. One trusted team, one fixed price."
        image={commonsPlaces.Weligama.src}
      />

      {services.length === 0 ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <EmptyState
              eyebrow="What we do"
              title="Service details are being updated"
              body="Nothing is listed here just now. Whatever you need moving or arranging on the island, ask us directly."
              action={{ label: "Talk to us", href: "/book#contact" }}
            />
          </div>
        </section>
      ) : (
        <>
          {/* Jump index — the page is a short list now, so make it scannable
              before anyone scrolls past the thing they came for.

              Tablet and up only: on a phone these six labels stack into four
              rows of chrome ahead of the content, and a plain scroll down the
              six sections is faster than an index that tall. */}
          <nav
            aria-label="Services on this page"
            className="hidden border-b border-ink/10 bg-sand/80 backdrop-blur md:block"
          >
            <div className="mx-auto flex max-w-wrap flex-wrap gap-x-7 gap-y-2 px-5 py-4 md:px-8">
              {services.map((s) => (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  className="shrink-0 text-[12px] uppercase tracking-[0.14em] text-ink/65 transition-colors hover:text-copper-deep"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Standards strip — what is true of every service, said once here
              instead of repeated inside all six descriptions. */}
          <section className="bg-dune/60 py-12 md:py-16">
            <div className="mx-auto max-w-wrap px-5 md:px-8">
              <p className="eyebrow text-copper-deep">Included as standard</p>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {standards.map(([Icon, title, body], i) => (
                  <Reveal key={title} index={i}>
                    <div className="flex h-full gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper-deep">
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                          {body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="mx-auto max-w-wrap px-5 md:px-8 space-y-16 md:space-y-24">
              {services.map((s, i) => {
                const Icon = icons[s.icon] ?? Car;
                return (
                  <div
                    key={s.slug}
                    id={s.slug}
                    className="grid scroll-mt-28 gap-8 md:grid-cols-12 md:items-center"
                  >
                    <Reveal className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
                      <div className="img-frame aspect-[16/11]">
                        {/* Via <Img> so a retired or absent image degrades to the
                            gradient treatment instead of throwing on an empty src.
                            No verification gate: a service makes no place claim. */}
                        <Img
                          asset={fromCmsUrl(s.image, s.name)}
                          sizes="(max-width:768px) 100vw, 50vw"
                          fallbackTone="moss"
                        />
                      </div>
                    </Reveal>
                    <Reveal index={1} className="md:col-span-6">
                      <div className={i % 2 ? "md:pr-10" : "md:pl-10"}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper-deep">
                            <Icon size={18} strokeWidth={1.8} aria-hidden />
                          </span>
                          <p className="eyebrow text-copper-deep">
                            {String(i + 1).padStart(2, "0")} — Service
                          </p>
                        </div>
                        <h2 className="h-display mt-4 text-3xl md:text-4xl text-ink">
                          {s.name}
                        </h2>
                        <p className="mt-2 font-display-italic text-lg text-copper-deep">
                          {s.tagline}
                        </p>
                        <p className="mt-5 text-[15px] leading-relaxed text-ink/65">
                          {s.description}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-4">
                          <Link
                            href={`/book?service=${encodeURIComponent(s.name)}`}
                            className="bg-ink px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep"
                          >
                            Get a quote
                          </Link>
                          <a
                            href={waLink(`Hello Island Route! I'd like to ask about: ${s.name}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-ink/20 px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-copper hover:text-copper-deep"
                          >
                            Ask on WhatsApp
                          </a>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Where the retired tour "services" now point. */}
          <section className="grain relative overflow-hidden bg-deep py-16 md:py-24">
            <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
              <SectionHeading
                dark
                eyebrow="Not what you were after?"
                title="Looking for the journeys themselves?"
                intro="Safaris, day trips and multi-day circuits are journeys, not transfers — they live in the catalogue, with real routes, prices and itineraries attached."
              />
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {[
                  ["Browse all journeys", "Set routes from one day to a fortnight, each with its itinerary and price.", "/tours"],
                  ["Travel by experience", "Start from what moves you — wildlife, surf, tea country — and we build the route.", "/experiences"],
                ].map(([title, body, href], i) => (
                  <Reveal key={href} index={i}>
                    <Link
                      href={href}
                      className="group flex h-full flex-col justify-between gap-6 border border-sand/15 p-7 transition-colors hover:border-copper-light md:p-8"
                    >
                      <div>
                        <h3 className="h-display text-2xl text-sand md:text-3xl">
                          {title}
                        </h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-sand/70">
                          {body}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-copper-light">
                        Explore
                        <ArrowRight
                          size={14}
                          aria-hidden
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <CTABand />
    </>
  );
}

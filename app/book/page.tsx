import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import BookingForm, { type JourneyOption } from "@/components/BookingForm";
import { media } from "@/lib/media/registry";
import { getTours } from "@/lib/data";
import { journeys } from "@/lib/journeys";
import { describeFilters, parseTourFilters } from "@/lib/tour-filters";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
import { site, waLink, defaultWaMessage } from "@/lib/site";

/*
  /contact was merged into this page and now 301s here (see next.config.mjs).
  The metadata absorbs the contact intent so the redirect lands on a page that
  actually answers "how do I reach these people" — otherwise the redirect
  target reads as a mismatch to both visitors and crawlers.
*/
export const metadata: Metadata = {
  title: "Plan Your Journey & Contact Us",
  description:
    "Request a personal proposal for a signature journey, a private transfer or a tailor-made Sri Lanka itinerary. A considered reply from a real planner, usually the same day.",
  alternates: { canonical: "/book" },
};

/* Kept from the old /contact page — the merge changed the location, not the
   facts. The map iframe was deliberately left behind: a third-party embed on
   the primary conversion page is a real cost, and the address plus a link to
   Google Maps carries the same information for free.

   Order matters here. The phone line leads because it is the number a private
   client expects to be able to ring, and WhatsApp is listed after it as one
   channel among several rather than as *the* channel — the same distinction the
   form itself now makes. */
const contactChannels: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}[] = [
  {
    icon: Phone,
    label: "Telephone",
    value: site.phoneDisplay,
    href: `tel:${site.phoneE164}`,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: site.whatsappDisplay,
    href: waLink(defaultWaMessage),
    external: true,
  },
  {
    icon: MapPin,
    label: "Our base",
    value: `${site.address} — we operate across the entire island`,
    href: "https://www.google.com/maps/search/?api=1&query=Colombo%2C+Sri+Lanka",
    external: true,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "24/7 — flights land at all hours, so do we",
  },
];

/**
 * Inbound `?service=` values, mapped to the vocabulary the form speaks.
 *
 * Several pages link here with their own spelling — /services uses the plural
 * card titles ("Airport Transfers", "Custom Travel Itineraries"), the tour
 * pages use the singular category. Anything not in this table is dropped rather
 * than passed through, so a hand-edited or stale URL can't inject an arbitrary
 * string into the service column.
 */
const normalize: Record<string, string> = {
  "Day Tour": "Day Tour",
  "Multi-Day": "Multi-Day Tour",
  "Multi-Day Tour": "Multi-Day Tour",
  Safari: "Safari Tour",
  "Safari Tour": "Safari Tour",
  "Airport Transfer": "Airport Transfer",
  "Airport Transfers": "Airport Transfer",
  "Private Driver Hire": "Private Driver Hire",
  "Taxi Services": "Taxi / Point-to-Point",
  "Surf Transfers": "Surf Transfer",
  "Surf Transfer": "Surf Transfer",
  "Hotel Transfers": "Hotel Transfer",
  "Hotel Transfer": "Hotel Transfer",
  "Custom Travel Itineraries": "Custom Itinerary",
  "Custom Itinerary": "Custom Itinerary",
  "Day Tours": "Day Tour",
  "Multi-Day Tours": "Multi-Day Tour",
  "Safari Tours": "Safari Tour",
};

/** Everything the form needs about a journey, and nothing else — itineraries,
 *  highlights and inclusions would otherwise be serialised into the client
 *  payload for all eighteen tours. */
const toOption = (t: {
  slug: string;
  title: string;
  category: string;
  duration: string;
  priceFrom: number;
  image: string;
}): JourneyOption => ({
  slug: t.slug,
  title: t.title,
  category: t.category,
  duration: t.duration,
  priceFrom: t.priceFrom,
  image: t.image,
});

export default async function BookPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

  const service = one(searchParams.service);
  const tour = one(searchParams.tour);

  const defaultService = service ? normalize[service] ?? "" : "";

  /*
    The catalogue, split the way the form asks about it.

    Read through getTours() rather than from lib/journeys.ts directly so the
    picker shows whatever the admin has actually published — a retitled or
    repriced journey is right here without a deploy. lib/journeys.ts is used
    only for its slugs, which are the definition of "signature": they are stable
    identifiers, unlike titles, and they don't change when the copy does.
  */
  const all = await getTours();
  const signatureSlugs = new Set(journeys.map((j) => j.slug));
  const signature = all.filter((t) => signatureSlugs.has(t.slug)).map(toOption);
  const rest = all.filter((t) => !signatureSlugs.has(t.slug)).map(toOption);

  /*
    A journey arrived at from a tour page.

    Matched on slug first, then on an exact case-insensitive title, because both
    shapes are in the wild: /tours/[slug] links with `?tour=<title>`, while the
    journey builder sends a composed line like "Custom journey: Galle → Ella".
    That second kind will never match, and shouldn't — it is passed through as
    the visitor's own outline instead of being quietly discarded.
  */
  const matched = tour
    ? all.find(
        (t) =>
          t.slug === tour || t.title.toLowerCase() === tour.toLowerCase()
      )
    : undefined;

  /*
    Planner context.

    /tours forwards the filters a visitor chose (theme, duration, destination,
    party) when it can't match a set journey. They were previously carried in
    the URL and then dropped — the visitor arrived at a blank form having just
    told us exactly what they wanted.

    Rather than adding fields, the choices are written into the existing message
    textarea as a readable line the visitor can edit or delete. `party` is
    included here because it is genuinely useful context for a quote even though
    it cannot filter the catalogue.
  */
  const context = describeFilters(parseTourFilters(searchParams), {
    themeName: (slug) => experienceCategories.find((c) => c.slug === slug)?.name,
    destinationName: (slug) => destinations.find((d) => d.slug === slug)?.name,
  });

  /*
    The tour name used to be prepended here as "I'm interested in: …". It isn't
    any more: the form now shows the selected journey as a card with its own
    photograph and price, so repeating it in the message box would be the same
    fact twice — once in a field the visitor might reasonably delete.
  */
  const defaultMessage = context.length
    ? `Looking for: ${context
        .map((c) => `${c.label.toLowerCase()} — ${c.value}`)
        .join("; ")}`
    : "";

  return (
    <>
      <PageHeader
        eyebrow="Plan your journey"
        title="Tell us your dream. We'll route it."
        intro="Share as much or as little as you have. A planner reads every enquiry personally and replies with a considered proposal — no deposit, no obligation."
        image={media.arugamBayEvening.src}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 lg:grid-cols-12">
          {/* min-w-0 on both columns: grid items default to min-width:auto, so
              the long email and address in the contact card set the width of the
              single mobile track and pushed the whole page sideways at 320px. */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal>
              <BookingForm
                signature={signature}
                dayTrips={rest}
                selectedJourney={matched ? toOption(matched) : null}
                customJourneyLabel={tour && !matched ? tour : undefined}
                defaultService={defaultService}
                defaultMessage={defaultMessage}
                defaultTourTitle={tour}
              />
            </Reveal>
          </div>
          <aside className="min-w-0 lg:col-span-5">
            <Reveal className="border border-ink/10 bg-white/60 p-7 md:p-9">
              <p className="eyebrow text-copper-deep">How it works</p>
              <ol className="mt-6 space-y-6">
                {[
                  [
                    "Share your thinking",
                    "Dates, a journey that caught your eye, or nothing more than a rough idea. There is no wrong amount of detail.",
                  ],
                  [
                    "Receive a considered proposal",
                    "A planner replies personally — usually the same day — with a route, the vehicle, your chauffeur and a clear, itemised price.",
                  ],
                  [
                    "Refine until it's yours",
                    "Move a night, add a region, change the pace. We revise as many times as it takes, and only then confirm.",
                  ],
                  [
                    "Travel",
                    "Nothing is paid online. Your chauffeur meets you at arrivals, and we stay reachable from touchdown to takeoff.",
                  ],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-display text-3xl text-copper-deep/60 leading-none">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{t}</p>
                      <p className="mt-1 text-sm text-ink/70 leading-relaxed">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal
              index={1}
              id="contact"
              className="mt-6 scroll-mt-24 border border-ink/10 bg-white/60 p-7 md:p-9"
            >
              <p className="eyebrow text-copper-deep">Speak to us directly</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                Some things are easier said than typed. Call, write, or ask for a
                time that suits you — you will be speaking with the people who
                will plan and drive your journey, not a call centre.
              </p>
              <div className="mt-7 space-y-5">
                {contactChannels.map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper-deep">
                      <c.icon size={18} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow text-ink/65">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          {...(c.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="mt-1 block break-words text-[15px] text-ink transition-colors hover:text-copper-deep"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-[15px] text-ink/80">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* A quiet way out for the browsing half of the audience: someone
                who opened this page before deciding shouldn't have to reach for
                the back button. */}
            <Reveal index={2} className="mt-6 text-sm text-ink/65">
              Still deciding?{" "}
              <Link href="/tours" className="link-line text-ink">
                Read the signature journeys
              </Link>{" "}
              or{" "}
              <Link href="/destinations" className="link-line text-ink">
                explore the island by region
              </Link>
              .
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}

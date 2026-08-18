import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { type JourneyOption } from "@/components/BookingForm";
import BookingFormWithContext from "@/components/BookingFormWithContext";
import { media } from "@/lib/media/registry";
import { serviceScope } from "@/lib/pricing";
import { RateCards, InclusionList } from "@/components/patterns/TransportRates";
import { getTours } from "@/lib/data";
import { journeys } from "@/lib/journeys";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
import { site, waLink, defaultWaMessage } from "@/lib/site";

/*
  Static, and it stays static.

  This page took `searchParams` only to decide which field of the form starts
  filled in — and that alone made the route `ƒ` (Dynamic), so the header, the
  four-step explainer and the contact card were all re-rendered per request and
  the catalogue re-fetched from Supabase every time. The query string is read
  in the browser now (components/BookingFormWithContext.tsx); the document is
  built once and revalidated on a timer, as this line always claimed.
*/
export const revalidate = 60;

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

/** Everything the form needs about a journey, and nothing else — itineraries,
 *  highlights and inclusions would otherwise be serialised into the client
 *  payload for all eighteen tours. */
const toOption = (t: {
  slug: string;
  title: string;
  category: string;
  duration: string;
  image: string;
}): JourneyOption => ({
  slug: t.slug,
  title: t.title,
  category: t.category,
  duration: t.duration,
  image: t.image,
});

export default async function BookPage() {
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

  /* Slug → name, for the "Looking for: interest — Wildlife" line the planner
     context writes into the message box. Passed as plain maps because the
     modules they come from reach the media registry, and the form's payload is
     meant to be the form. */
  const themeNames = Object.fromEntries(
    experienceCategories.map((c) => [c.slug, c.name]),
  );
  const destinationNames = Object.fromEntries(
    destinations.map((d) => [d.slug, d.name]),
  );

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
              <BookingFormWithContext
                signature={signature}
                dayTrips={rest}
                themeNames={themeNames}
                destinationNames={destinationNames}
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
                    <span className="font-display text-3xl text-copper-deep/75 leading-none">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{t}</p>
                      <p className="mt-1 text-sm text-ink/70 leading-relaxed">
                        {b}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            {/* What the money buys, beside the form that asks for it.

                This sits above the contact card deliberately: "what is included
                and what isn't" is the question that stops someone completing an
                enquiry, and it should be answered before they go looking for a
                phone number to ask it. */}
            <Reveal
              index={1}
              className="mt-6 border border-ink/10 bg-white/60 p-7 md:p-9"
            >
              <p className="eyebrow text-copper-deep">
                What your rate includes
              </p>
              {/* Stacked: this rail is ~380px wide however wide the window is. */}
              <RateCards className="mt-6" layout="stack" />
              <InclusionList className="mt-7" />
              <div className="mt-7 border-t border-ink/10 pt-6">
                <p className="font-semibold text-ink">
                  {serviceScope.hotels.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {serviceScope.hotels.body} Want the legwork done? Tick the
                  hotel assistance box in the form and we&apos;ll take it from
                  there.
                </p>
              </div>
            </Reveal>

            <Reveal
              index={2}
              id="contact"
              className="mt-6 scroll-mt-24 border border-ink/10 bg-white/60 p-7 md:p-9"
            >
              <p className="eyebrow text-copper-deep">Speak to us directly</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                Some things are easier said than typed. Call, write, or ask for
                a time that suits you — you will be speaking with the people who
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
                        <p className="mt-1 text-[15px] text-ink/80">
                          {c.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* A quiet way out for the browsing half of the audience: someone
                who opened this page before deciding shouldn't have to reach for
                the back button. */}
            <Reveal index={3} className="mt-6 text-sm text-ink/65">
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

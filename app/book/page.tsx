import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import BookingForm from "@/components/BookingForm";
import { img } from "@/lib/images";
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
    "Request a personal quote for tours, transfers, safaris and tailor-made Sri Lanka itineraries — or reach us direct on WhatsApp, phone or email, 24/7.",
  alternates: { canonical: "/book" },
};

/* Kept from the old /contact page — the merge changed the location, not the
   facts. The map iframe was deliberately left behind: a third-party embed on
   the primary conversion page is a real cost, and the address plus a link to
   Google Maps carries the same information for free. */
const contactChannels: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}[] = [
  {
    icon: Phone,
    label: "Phone & WhatsApp",
    value: site.phoneDisplay,
    href: waLink(defaultWaMessage),
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: MapPin,
    label: "Base",
    value: `${site.address} — serving the entire island`,
    href: "https://www.google.com/maps/search/?api=1&query=Colombo%2C+Sri+Lanka",
    external: true,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "24/7 — flights land at all hours, so do we",
  },
];

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

export default function BookPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

  const service = one(searchParams.service);
  const tour = one(searchParams.tour);

  // Unchanged: service normalisation and the tour prefill behave exactly as
  // before, including the Safari / Day Tour / Multi-Day mappings.
  const defaultService = service ? normalize[service] ?? "" : "";
  const tourLine = tour ? `I'm interested in: ${tour}` : "";

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

  const contextLine = context.length
    ? `Looking for: ${context.map((c) => `${c.label.toLowerCase()} — ${c.value}`).join("; ")}`
    : "";

  const defaultMessage = [tourLine, contextLine].filter(Boolean).join("\n");

  return (
    <>
      <PageHeader
        eyebrow="Plan your journey"
        title="Tell us your dream. We'll route it."
        intro="Share a few details and we'll reply within hours with a personal quote — no deposits, no obligation, just honest island expertise."
        image={img.lakeCanoe}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 lg:grid-cols-12">
          {/* min-w-0 on both columns: grid items default to min-width:auto, so
              the long email and address in the contact card set the width of the
              single mobile track and pushed the whole page sideways at 320px. */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal>
              <BookingForm
                defaultService={defaultService}
                defaultMessage={defaultMessage}
                defaultTourTitle={tour}
              />
            </Reveal>
          </div>
          <aside className="min-w-0 lg:col-span-5">
            <Reveal className="border border-ink/10 bg-white/60 p-7 md:p-9">
              <p className="eyebrow text-copper-deep">How booking works</p>
              <ol className="mt-6 space-y-6">
                {[
                  ["Tell us your plans", "Send the form, or just message us on WhatsApp — whichever is easier."],
                  ["Get a personal quote", "Within hours you'll have a route, vehicle and transparent price, refined until it's right."],
                  ["Confirm & relax", "No online payment needed. We confirm your driver and stay in touch from touchdown to takeoff."],
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
              <p className="eyebrow text-copper-deep">Or reach us directly</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                No form required. Message us and a real person replies — usually
                within the hour.
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
          </aside>
        </div>
      </section>
    </>
  );
}

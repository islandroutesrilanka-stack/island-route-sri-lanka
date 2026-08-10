import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import BookingForm from "@/components/BookingForm";
import { img } from "@/lib/images";
import { describeFilters, parseTourFilters } from "@/lib/tour-filters";
import { experienceCategories } from "@/lib/experiences";
import { destinations } from "@/lib/destinations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description:
    "Request a personal quote for tours, transfers, safaris and tailor-made Sri Lanka itineraries. We reply within hours on WhatsApp or email.",
  alternates: { canonical: "/book" },
};

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
          <div className="lg:col-span-7">
            <Reveal>
              <BookingForm
                defaultService={defaultService}
                defaultMessage={defaultMessage}
                defaultTourTitle={tour}
              />
            </Reveal>
          </div>
          <aside className="lg:col-span-5">
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
              <div className="mt-8 border-t border-ink/10 pt-6 text-sm text-ink/70">
                <p>
                  Prefer to talk now? WhatsApp{" "}
                  <a
                    href={`https://wa.me/${site.whatsappNumber}`}
                    className="text-copper-deep underline"
                  >
                    {site.phoneDisplay}
                  </a>{" "}
                  — we&apos;re online around the clock.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}

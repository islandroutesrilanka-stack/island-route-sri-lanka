import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, CTABand } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { getServices } from "@/lib/data";
import { img } from "@/lib/images";
import { waLink } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Transfers & Private Drivers",
  description:
    "Airport transfers, private driver hire, taxis, day tours, multi-day journeys, safaris, surf transfers and custom itineraries across Sri Lanka.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="Nine ways we move you around paradise"
        intro="One trusted team for everything from a midnight airport pickup to a month-long tailor-made circuit of the island."
        image={img.coastalDrive}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8 space-y-16 md:space-y-24">
          {services.map((s, i) => (
            <div
              key={s.slug}
              id={s.slug}
              className={`grid gap-8 md:grid-cols-12 md:items-center scroll-mt-28`}
            >
              <Reveal
                className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}
              >
                <div className="img-frame aspect-[16/11]">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
              <Reveal index={1} className="md:col-span-6">
                <div className={i % 2 ? "md:pr-10" : "md:pl-10"}>
                  <p className="eyebrow text-copper-deep">
                    {String(i + 1).padStart(2, "0")} — Service
                  </p>
                  <h2 className="h-display text-3xl md:text-4xl text-ink mt-3">
                    {s.name}
                  </h2>
                  <p className="mt-2 font-display italic text-lg text-copper-deep">
                    {s.tagline}
                  </p>
                  <p className="mt-5 text-[15px] leading-relaxed text-ink/65">
                    {s.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-4">
                    <Link
                      href={`/book?service=${encodeURIComponent(s.name)}`}
                      className="bg-ink text-sand px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
                    >
                      Get a quote
                    </Link>
                    <a
                      href={waLink(`Hello Island Route! I'd like to ask about: ${s.name}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-ink/20 text-ink px-7 py-3.5 text-[12px] uppercase tracking-[0.16em] hover:border-copper hover:text-copper-deep transition-colors"
                    >
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}

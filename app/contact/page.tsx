import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import BookingForm from "@/components/BookingForm";
import { img } from "@/lib/images";
import { site, waLink, defaultWaMessage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Island Route Sri Lanka — WhatsApp, phone or email, 24/7. Based in Colombo, serving the whole island.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="One message away"
        intro="Questions, quotes or a last-minute pickup — reach us any hour on WhatsApp, phone or email."
        image={img.beachPanorama}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-wrap px-5 md:px-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-8">
            <Reveal>
              <div className="space-y-6">
                {(
                  [
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
                  },
                  {
                    icon: Clock,
                    label: "Hours",
                    value: "24/7 — flights land at all hours, so do we",
                  },
                  ] as {
                    icon: typeof Phone;
                    label: string;
                    value: string;
                    href?: string;
                    external?: boolean;
                  }[]
                ).map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper/10 text-copper-deep">
                      <c.icon size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="eyebrow text-ink/65">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          {...(c.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="mt-1 block text-[15px] text-ink hover:text-copper-deep transition-colors break-words"
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

            <Reveal index={1}>
              <h2 className="eyebrow text-copper-deep mb-3">Where we&apos;re based</h2>
              <div className="img-frame aspect-[4/3] border border-ink/10">
                <iframe
                  title="Map showing Island Route Sri Lanka's base in Colombo"
                  src="https://www.google.com/maps?q=Colombo,+Sri+Lanka&z=11&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Colombo%2C+Sri+Lanka"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-copper-deep underline"
              >
                Open in Google Maps
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-copper-deep mb-6">Send an enquiry</p>
              <BookingForm kind="inquiry" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

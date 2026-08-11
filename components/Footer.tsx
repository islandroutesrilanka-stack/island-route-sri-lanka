import Link from "next/link";
import { site, waLink, defaultWaMessage } from "@/lib/site";

/**
 * Footer.
 *
 * The header carries five items; everything else the site publishes lives
 * here. That is the trade the new navigation makes, so this has to be genuinely
 * complete rather than decorative — Gallery, Reviews, Services and Fleet are
 * demoted here, not deleted, and every one of them is a real published route.
 *
 * Three columns rather than two, so the demoted routes get their own heading
 * ("Look around") instead of being buried in a list of nine. A footer link a
 * visitor can't find is the same as no link.
 */
const explore: [label: string, href: string][] = [
  ["Journeys", "/tours"],
  ["Destinations", "/destinations"],
  ["Experiences", "/experiences"],
  ["Plan your journey", "/book"],
];

/* Reviews and the fleet are sections of /about since the merge, and contact is
   part of /book. Linking straight to the anchors keeps the footer's promise —
   these are still one click away — without sending anyone through a redirect. */
const lookAround: [label: string, href: string][] = [
  ["Gallery", "/gallery"],
  ["Reviews", "/about#reviews"],
  ["Our fleet", "/about#fleet"],
  ["Services", "/services"],
];

const company: [label: string, href: string][] = [
  ["About us", "/about"],
  ["Journal", "/blog"],
  ["Contact us", "/book#contact"],
];

function LinkList({ items }: { items: [label: string, href: string][] }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map(([label, href]) => (
        <li key={href}>
          <Link
            href={href}
            className="transition-colors hover:text-copper-light"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="bg-deep text-sand/80">
      <div className="mx-auto max-w-wrap px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-3xl text-sand">Island Route</p>
            <p className="eyebrow mt-1 text-copper-light">Sri Lanka</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-sand/60">
              Private, chauffeur-driven journeys across the pearl of the Indian
              Ocean — crafted by people who call the island home.
            </p>
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border border-sand/30 px-6 py-3 text-[12px] uppercase tracking-[0.18em] text-sand transition-colors hover:bg-sand hover:text-deep"
            >
              WhatsApp us — {site.phoneDisplay}
            </a>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Explore</p>
            <LinkList items={explore} />
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Look around</p>
            <LinkList items={lookAround} />
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Company</p>
            <LinkList items={company} />
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Contact</p>
            <ul className="space-y-2.5 text-sm text-sand/60">
              <li>{site.address}</li>
              <li>
                <a
                  href={`tel:${site.phoneE164}`}
                  className="transition-colors hover:text-copper-light"
                >
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="break-all transition-colors hover:text-copper-light"
                >
                  {site.email}
                </a>
              </li>
              <li className="pt-2 text-sand/65">
                Available 24/7 · English-speaking team
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-sand/10 pt-7 text-xs text-sand/65 md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Private journeys across Sri Lanka · Insured vehicles</p>
        </div>
      </div>
    </footer>
  );
}

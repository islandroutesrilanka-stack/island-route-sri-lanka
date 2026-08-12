import Link from "next/link";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { site, waLink, defaultWaMessage, socialProfiles } from "@/lib/site";

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

/**
 * Social icons.
 *
 * Driven by `socialProfiles` so the footer and the JSON-LD `sameAs` array can
 * never list different profiles. The icon is decorative — the accessible name
 * comes from the label, which names the account rather than just the network
 * ("Instagram — @islandroutesrilanka"), because "Instagram" alone tells a
 * screen-reader user nothing about whose account it opens.
 */
const socialIcons: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  WhatsApp: MessageCircle,
};

function SocialLinks() {
  return (
    <ul className="mt-7 flex items-center gap-3">
      {socialProfiles.map(({ name, handle, href }) => {
        const Icon = socialIcons[name] ?? MessageCircle;
        return (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} — ${handle}`}
              title={`${name} — ${handle}`}
              className="flex h-10 w-10 items-center justify-center border border-sand/25 text-sand/75 transition-colors hover:border-copper-light hover:text-copper-light"
            >
              <Icon size={17} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

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
  /* Split once here rather than inline, so the <wbr/> below reads as a break
     opportunity and not as string surgery. A missing @ would be a malformed
     address anyway; the fallback just keeps it rendering. */
  const [mailboxName, mailboxHost = ""] = site.email.split("@");

  return (
    <footer className="bg-deep text-sand/80">
      <div className="mx-auto max-w-wrap px-5 py-16 md:px-8 md:py-20">
        {/*
          ── Column widths, measured rather than assumed ────────────────────

          This was one twelve-column grid with a 48px gutter from md up, which
          spends 528px of every row on gutters. At 768px that left each link
          column 77px wide: "Plan your journey" wrapped to three lines and the
          address ran to four. The contact column is the worst case, because
          it carries the two longest strings on the site — a 29-character
          email and the WhatsApp ID — and 77px broke both mid-word
          ("islandroutesrilanka@gm / ail.com").

          So: an 8px-tighter gutter, and the brand block takes its own
          full-width row at md, where twelve columns cannot be divided into
          five sensibly. The four remaining columns get three each — 152px at
          md, 165px at lg — and the two long strings are given deliberate
          break points below rather than more width, because widening contact
          enough to hold the email on one line would leave the brand column
          too narrow for its own WhatsApp button.
        */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-8 md:gap-y-12">
          <div className="md:col-span-12 lg:col-span-4">
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
              WhatsApp us — {site.whatsappDisplay}
            </a>
            <SocialLinks />
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Explore</p>
            <LinkList items={explore} />
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Look around</p>
            <LinkList items={lookAround} />
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <p className="eyebrow mb-4 text-sand/65">Company</p>
            <LinkList items={company} />
          </div>

          <div className="md:col-span-3 lg:col-span-2">
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
                {/* The address is longer than the column at every breakpoint,
                    so the only question is where it breaks. `break-all` let it
                    land wherever the line ran out ("…@gm / ail.com"); the wbr
                    after the @ gives it the one break a reader recognises, and
                    break-words keeps that opportunity in preference to
                    splitting the token. */}
                <a
                  href={`mailto:${site.email}`}
                  className="break-words transition-colors hover:text-copper-light"
                >
                  {mailboxName}@<wbr />
                  {mailboxHost}
                </a>
              </li>
              {/* The WhatsApp username, shown but not linked — wa.me resolves
                  numbers, not usernames, so the tappable link is the number
                  above and this is here for people searching in the app. */}
              <li className="text-sand/60">
                WhatsApp&nbsp;ID{" "}
                {/* nowrap because a username broken across a line stops being
                    a username — "islandrout / eSL" is not searchable in the
                    app, which is the only reason this line exists. */}
                <span className="whitespace-nowrap text-sand/80">
                  {site.whatsappId}
                </span>
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

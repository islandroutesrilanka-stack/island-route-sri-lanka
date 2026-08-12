/**
 * The canonical origin for this deployment — the single source of truth.
 *
 * Everything that emits an absolute URL (metadata canonicals, Open Graph,
 * sitemap.xml, robots.txt, JSON-LD) must read this and nothing else. Before,
 * `layout.tsx` preferred the env var while `sitemap.ts` hardcoded the constant,
 * so a preview or staging deployment would advertise canonicals on one host and
 * a sitemap on another — which is an indexing bug that is very hard to spot.
 *
 * Set NEXT_PUBLIC_SITE_URL in Vercel per environment. Never hardcode elsewhere.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.islandroutesrilanka.com"
).replace(/\/+$/, "");

export const site = {
  name: "Island Route Sri Lanka",
  shortName: "Island Route",
  tagline: "Private journeys across the pearl of the Indian Ocean",
  description:
    "Island Route Sri Lanka crafts private, chauffeur-driven journeys across Sri Lanka — airport transfers, day tours, safaris, surf trips and tailor-made multi-day itineraries with trusted English-speaking drivers.",
  /** @deprecated Import `siteUrl` instead — this mirrors it for older call sites. */
  url: siteUrl,
  email: "islandroutesrilanka@gmail.com",

  /*
    One number, three shapes — display, tel: and wa.me — kept together so they
    can never drift apart. The previous number (+94 77 801 0391) was replaced
    wholesale on 2026-08-12: the owner supplied +94 77 106 6677 as the WhatsApp
    line, and every place the old number appeared was labelling a WhatsApp link
    with it, so keeping the two separate would have printed one number beside a
    link that opened another.

    If the voice line ever genuinely differs from the WhatsApp line, split
    `phoneE164`/`phoneDisplay` from `whatsappNumber`/`whatsappDisplay` — the
    call sites are already split along exactly that seam (tel: links read
    phone*, WhatsApp buttons read whatsapp*), so it is a data change only.
  */
  phoneDisplay: "+94 77 106 6677",
  phoneE164: "+94771066677",
  /** Digits only, no `+` — the shape wa.me requires. */
  whatsappNumber: "94771066677",
  /** Human-readable form of `whatsappNumber`; label WhatsApp links with this. */
  whatsappDisplay: "+94 77 106 6677",
  /**
   * The account's WhatsApp username. Shown as a handle, never used to build a
   * link: wa.me resolves phone numbers, not usernames, so a `wa.me/islandrouteSL`
   * would 404. `waLink()` stays on the number for that reason.
   */
  whatsappId: "islandrouteSL",

  address: "Colombo, Sri Lanka",

  /*
    Social. Handles are stored separately from URLs because both are needed:
    the URL for the href and `sameAs` in JSON-LD, the handle for the visible
    label. A page's *name* is not part of its URL on Facebook, so `facebookName`
    carries it for accessible labels and structured data.
  */
  instagramHandle: "islandroutesrilanka",
  instagram: "https://www.instagram.com/islandroutesrilanka/",
  facebookName: "Island Route Sri Lanka",
  /**
   * The page's vanity URL exactly as the owner supplied it, capital I and
   * trailing slash included. Facebook resolves usernames case-insensitively, so
   * a lowercase spelling would also land — but this string is what goes into
   * JSON-LD `sameAs`, where a URL is matched as a literal, so it should be the
   * canonical one the page itself advertises rather than a variant of it.
   */
  facebook: "https://www.facebook.com/Islandroutesrilanka/",
};

/** Build a WhatsApp deep link with a prefilled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * The site's social profiles, in the order they should be rendered.
 *
 * A single list rather than three ad-hoc links, so the footer, JSON-LD `sameAs`
 * and anything added later cannot disagree about which profiles exist.
 */
export const socialProfiles: { name: string; handle: string; href: string }[] = [
  { name: "Instagram", handle: `@${site.instagramHandle}`, href: site.instagram },
  { name: "Facebook", handle: site.facebookName, href: site.facebook },
  { name: "WhatsApp", handle: site.whatsappDisplay, href: waLink() },
];

export const defaultWaMessage =
  "Hello Island Route! I'd like to plan a trip in Sri Lanka.";

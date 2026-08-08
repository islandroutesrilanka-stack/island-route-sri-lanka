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
  phoneDisplay: "+94 77 801 0391",
  phoneE164: "+94778010391",
  whatsappNumber: "94778010391",
  address: "Colombo, Sri Lanka",
  instagram: "https://instagram.com/islandroutesrilanka",
  facebook: "https://facebook.com/islandroutesrilanka",
};

/** Build a WhatsApp deep link with a prefilled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultWaMessage =
  "Hello Island Route! I'd like to plan a trip in Sri Lanka.";

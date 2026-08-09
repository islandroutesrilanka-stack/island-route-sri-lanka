/**
 * FAQ content.
 *
 * Deliberately a plain, directive-free module containing no JSX.
 *
 * This data is consumed from two sides: the Server Component `app/page.tsx`
 * reads it to emit FAQPage structured data, and `components/patterns/FaqPreview`
 * renders it. A non-component value exported from a client-boundary module is
 * replaced on the server by a client-reference proxy, so calling `.map()` on it
 * throws — the property access resolves to a stub rather than the array method.
 * Keeping shared data in a neutral module removes that class of bug rather than
 * working around it.
 *
 * A `faqs` table with per-entity attachment arrives in a later phase; these
 * become its seed rows.
 *
 * Every answer here describes how Island Route works. None makes a statistical,
 * award, rating or credential claim.
 */

export type Faq = { q: string; a: string };

export const HOMEPAGE_FAQS: Faq[] = [
  {
    q: "How does pricing work?",
    a: "Every journey is built around your dates, pace and choice of stays, so there is no fixed shelf price. Tell us what you have in mind and you'll get a clear, itemised quote — what's included, what isn't, and no commission built into the route.",
  },
  {
    q: "How far ahead should I book?",
    a: "For December to March on the south and west coasts, and for July and August, earlier is genuinely better — the best drivers and rooms go first. Outside those windows a few weeks is usually comfortable. If you're already close to your dates, message us anyway and we'll tell you honestly what's still possible.",
  },
  {
    q: "What if my plans change?",
    a: "Itineraries are a starting point, not a contract with the road. Stay an extra night, skip something, add a detour your guide suggests — changes during the trip are handled between you and your chauffeur-guide. If dates move before you travel, talk to us early and we'll do what we can.",
  },
];

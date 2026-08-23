/**
 * FAQ content.
 *
 * Deliberately a plain, directive-free module containing no JSX.
 *
 * `components/patterns/FaqPreview` renders these and emits the FAQPage
 * structured data from the same array, so the markup and the questions it
 * describes cannot drift apart. A non-component value exported from a
 * client-boundary module is replaced on the server by a client-reference proxy,
 * so calling `.map()` on it throws — the property access resolves to a stub
 * rather than the array method. Keeping shared data in a neutral module removes
 * that class of bug rather than working around it.
 *
 * The name is now historical: these moved off the homepage to /book in the
 * homepage redesign, and are kept under this export so the admin's later `faqs`
 * table can seed from a stable identifier.
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
    a: "You pay by the day for the vehicle and chauffeur — US$80 a day for a car, US$120 for a van, per vehicle rather than per person, with fuel, tolls, parking and the driver's own costs already inside it. There is no fixed package price on top, because accommodation moves by season and by how early you book, and we would rather you chose your own. If you'd like us to shortlist hotels along your route and quote them, tick the box on the booking form.",
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

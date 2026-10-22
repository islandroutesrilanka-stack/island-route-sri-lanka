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
 * ── On the two shapes ──────────────────────────────────────────────────────
 *
 * `FAQ_GROUPS` is the full set, rendered by /faq. `HOMEPAGE_FAQS` is the three
 * that sit on /book, at the point where last objections surface. They are the
 * *same objects*, composed below rather than copied, so an edit to an answer
 * cannot leave the two pages disagreeing — which matters more than usual here,
 * because both pages emit FAQPage structured data and Google requires that the
 * markup match text actually visible on the page it sits on.
 *
 * Every answer here describes how Island Route works. None makes a statistical,
 * award, rating or credential claim — see PENDING_FAQS at the bottom for the
 * questions that cannot be answered from inside this codebase, and why
 * guessing at them would be worse than leaving them out.
 */

export type Faq = { q: string; a: string };

export type FaqGroup = {
  /** Anchor id — also the jump-rail target, so it must stay URL-safe. */
  id: string;
  label: string;
  /** One line under the group heading. Optional; not every group needs one. */
  blurb?: string;
  faqs: Faq[];
};

/* ------------------------------ Money ------------------------------------- */

const pricing: Faq = {
  q: "How does pricing work?",
  a: "You pay by the day for the vehicle and chauffeur — US$80 a day for a car, US$120 for a van, per vehicle rather than per person, with fuel, tolls, parking and the driver's own costs already inside it. There is no fixed package price on top, because accommodation moves by season and by how early you book, and we would rather you chose your own. If you'd like us to shortlist hotels along your route and quote them, tick the box on the booking form.",
};

const perVehicle: Faq = {
  q: "Is that price per person or per vehicle?",
  a: "Per vehicle, per day. Two of you travelling in the car pay the same as three, and the rate does not change because your group grew — it changes only if the group outgrows the vehicle and moves up to the van. It is worth saying plainly because per-person pricing is the norm in this industry and the comparison is easy to get wrong in our favour.",
};

const included: Faq = {
  q: "What is actually included in the day rate?",
  a: "The private vehicle and your English-speaking chauffeur-guide, fuel and all vehicle running costs, every parking fee, toll and highway charge, and the driver's own accommodation and meals. Those last two catch people out elsewhere: a rate that excludes them is not comparable to this one. What the day rate does not include is your own accommodation, your meals, and entrance tickets to the places you visit.",
};

const hotels: Faq = {
  q: "Do you book our hotels as well?",
  a: "Only if you ask us to. Hotels are not bundled into the transport rate, and that is a deliberate choice rather than a gap — someone paying for a private car usually has opinions about where they sleep, often points to spend, and no wish to be routed into whichever property pays the best commission. Booking your own stays keeps that choice yours, and keeps any dispute over a room between you and the hotel that took the money. Tick the box on the booking form and we will happily do the legwork and shortlist along your route.",
};

const nothingCharged: Faq = {
  q: "Do I pay anything on this website?",
  a: "No. There is no checkout here and no card details are ever asked for or stored. The form sends us your dates and what you have in mind; we read it and reply, usually within hours, with a route and a price. Nothing is committed until you have that in front of you and say yes.",
};

/* ----------------------------- Planning ----------------------------------- */

const howFarAhead: Faq = {
  q: "How far ahead should I book?",
  a: "For December to March on the south and west coasts, and for July and August, earlier is genuinely better — the best drivers and rooms go first. Outside those windows a few weeks is usually comfortable. If you're already close to your dates, message us anyway and we'll tell you honestly what's still possible.",
};

const plansChange: Faq = {
  q: "What if my plans change?",
  a: "Itineraries are a starting point, not a contract with the road. Stay an extra night, skip something, add a detour your guide suggests — changes during the trip are handled between you and your chauffeur-guide. If dates move before you travel, talk to us early and we'll do what we can.",
};

const customRoute: Faq = {
  q: "Can you build a route that isn't one of your journeys?",
  a: "That is the usual case, not the exception. The journeys on this site are inspiration — a route, a length and a reason to go — and every price on the site is composed from the same day rate, so a route we have never run before costs no more to plan than one we have. Send us the places you already know you want and roughly how long you have, and we will build around them.",
};

/* ---------------------------- On the road --------------------------------- */

const whoDrives: Faq = {
  q: "Who will be driving?",
  a: "A chauffeur-guide who speaks English and knows the roads you are on — not a pool driver assigned on the morning. They drive, they navigate, and they are the person who tells you which of two beaches is worth the extra hour today. Changes to the day's plan are agreed with them directly, which is why the same person stays with you for the whole journey rather than being swapped at a regional boundary.",
};

const vehicles: Faq = {
  q: "What are the vehicles like?",
  a: "Air-conditioned, maintained, and sized to the group rather than to the booking — a car for up to three travellers, a van when there are more of you or more luggage than a boot will take. The fleet, with capacities and what each one is suited to, is set out on the About page.",
};

const airport: Faq = {
  q: "Can you meet us at the airport?",
  a: "Yes — airport pick-up and drop-off are the most common single request we get, and they work either as a transfer on their own or as the first and last day of a longer journey. Tell us your flight number rather than just the time: a delayed arrival is the one thing we would rather know about before you land.",
};

/* -------------------------------------------------------------------------- */

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "money",
    label: "Money",
    blurb:
      "What a day costs, what is inside that number, and what is not.",
    faqs: [pricing, perVehicle, included, hotels, nothingCharged],
  },
  {
    id: "planning",
    label: "Planning",
    blurb: "Dates, lead times, and how fixed an itinerary really is.",
    faqs: [howFarAhead, plansChange, customRoute],
  },
  {
    id: "on-the-road",
    label: "On the road",
    blurb: "Your driver, the vehicle, and the day you arrive.",
    faqs: [whoDrives, vehicles, airport],
  },
];

/** Every question on /faq, flattened — used for the page's FAQPage schema. */
export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.faqs);

/**
 * The three on /book.
 *
 * The name is historical: these were the homepage's, and moved to /book in the
 * homepage redesign. Kept under this export so the admin's later `faqs` table
 * can seed from a stable identifier — and composed from the consts above so
 * /book and /faq can never show two versions of the same answer.
 */
export const HOMEPAGE_FAQS: Faq[] = [pricing, howFarAhead, plansChange];

/**
 * ── Questions we are NOT answering yet, and why ────────────────────────────
 *
 * These are the FAQs a Sri Lanka tour operator is actually searched for, and
 * every one of them is a business or legal fact that is nowhere in this
 * codebase: visa cost and process, what deposit you take and how, your
 * cancellation and refund terms, whether you require travel insurance,
 * tipping, child seats, and your SLTDA registration.
 *
 * Writing plausible answers here would be the single most damaging thing this
 * file could do. A wrong visa fee or an invented cancellation term is not a
 * copy error — it is a statement a guest can hold you to, on a page carrying
 * FAQPage structured data that invites Google to quote it in a search result.
 *
 * So they sit here, unrendered, as a worklist. Fill an answer in, move the
 * object into the right group above, and it appears on /faq and in the schema
 * with no other change. Nothing reads this array.
 */
export const PENDING_FAQS: { q: string; needs: string }[] = [
  {
    q: "Do we need a visa, and how do we get one?",
    needs:
      "Current ETA cost and process. Changes often — link to the official portal rather than restating the fee, so the page cannot go stale.",
  },
  {
    q: "When is the best time to visit Sri Lanka?",
    needs:
      "Owner's own month-by-month view. lib/seasons.ts already holds the coastal split the journeys use; this answer should agree with it.",
  },
  {
    q: "How do I pay, and is there a deposit?",
    needs: "Accepted methods, deposit amount or percentage, and when the balance is due.",
  },
  {
    q: "What is your cancellation policy?",
    needs:
      "The actual terms. Must match whatever the booking confirmation says — this is contractual.",
  },
  {
    q: "Do we need travel insurance?",
    needs: "Whether it is required or recommended, and what your own liability cover is.",
  },
  {
    q: "Is tipping expected?",
    needs: "Owner's honest guidance for drivers and guides.",
  },
  {
    q: "Can you provide child seats?",
    needs: "Availability, which vehicles, and whether there is a charge.",
  },
  {
    q: "Are you a registered tour operator?",
    needs:
      "SLTDA registration number and any other licence worth naming. A credential claim, so it ships only with the number behind it.",
  },
];

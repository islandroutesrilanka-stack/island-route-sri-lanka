/**
 * Plan Your Journey (homepage §09).
 *
 * Two paths, because visitors reach the foot of the page in two different
 * states of readiness. A single contact form serves only the ready ones and
 * loses everybody else.
 *
 *   Left  — ready to talk: a named human, WhatsApp, a response promise.
 *   Right — not ready: three low-commitment chips that prefill the enquiry.
 *
 * The chips are plain links carrying searchParams, not client state. Every
 * combination is a real, shareable URL that works with JavaScript disabled, and
 * it is the same filtering vocabulary the tours index will use — so the planner
 * and the tour filters never drift apart.
 */
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/motion";
import { waLink, defaultWaMessage, site } from "@/lib/site";
import { experienceCategories } from "@/lib/experiences";
import { filterTours } from "@/lib/tour-filters";
import type { Tour } from "@/lib/tours";

const DURATIONS = [
  { label: "3–4 days", value: "3-4" },
  { label: "5–7 days", value: "5-7" },
  { label: "8–10 days", value: "8-10" },
  { label: "11–14 days", value: "11-14" },
];

const PARTIES = [
  { label: "Couple", value: "couple" },
  { label: "Family", value: "family" },
  { label: "Friends", value: "friends" },
  { label: "Solo", value: "solo" },
];

/** A handful of interests — the full set lives on the experiences index. */
const INTERESTS = experienceCategories
  .filter((c) =>
    ["wildlife", "surf-ocean", "culture-heritage", "tea-country", "wellness"].includes(
      c.slug
    )
  )
  .map((c) => ({ label: c.name, value: c.slug }));

function Chips({
  legend,
  items,
  param,
}: {
  legend: string;
  items: { label: string; value: string }[];
  param: string;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-sand/50">{legend}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.value}>
            <Link
              href={`/tours?${param}=${i.value}`}
              className="inline-flex min-h-[44px] items-center rounded-sm border border-sand/25 px-3.5 text-[12px] uppercase tracking-[0.1em] text-sand/75 transition-colors hover:border-copper-light hover:text-copper-light"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A chip is only offered when it actually leads somewhere.
 *
 * Measured against the real catalogue, two of these promised journeys that do
 * not exist: "3–4 days" matched nothing, and so did "Wellness". The tours page
 * handles an empty result honestly, but a chip that can never match is a
 * control advertising a product we don't have — the visitor's first click on
 * the homepage lands on "no set journey matches that combination".
 *
 * Filtering here rather than editing the lists keeps this self-correcting: add
 * a wellness journey or a short break and the chip returns on its own. The
 * taxonomy in lib/experiences.ts is untouched — this decides what is offered,
 * not what exists.
 *
 * `party` is excluded on purpose. It never filters the catalogue (nothing in
 * the data supports a suitability claim); it is enquiry context that is carried
 * through to the booking form, so every option remains meaningful.
 */
function offered(
  items: { label: string; value: string }[],
  tours: Tour[],
  key: "theme" | "duration"
) {
  return items.filter((i) => filterTours(tours, { [key]: i.value }).length > 0);
}

export default function PlannerEntry({ tours }: { tours: Tour[] }) {
  const interests = offered(INTERESTS, tours, "theme");
  const durations = offered(DURATIONS, tours, "duration");

  return (
    <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
      {/* ------------------------------ Ready to talk ----------------------------- */}
      <Reveal>
        <p className="eyebrow text-copper-light">Begin the journey</p>
        <h2 className="h-display mt-3 text-4xl text-sand md:text-5xl">
          Tell us what you have in mind
        </h2>
        <p className="mt-6 max-w-md leading-relaxed text-sand/65">
          Send us your dates and the kind of trip you&apos;re imagining. You&apos;ll
          get a considered reply from the people who will actually plan and drive
          it — not a template.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/book"
            className="bg-copper-deep px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
          >
            Plan your journey
          </Link>
          <a
            href={waLink(defaultWaMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 border border-sand/30 px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-sand hover:text-deep"
          >
            <MessageCircle size={16} /> {site.phoneDisplay}
          </a>
        </div>
      </Reveal>

      {/* ----------------------------- Journey Planner ---------------------------- */}
      <Reveal index={1}>
        <div className="border border-sand/15 p-7 md:p-9">
          <p className="eyebrow text-copper-light">Journey planner</p>
          <h3 className="h-display mt-3 text-2xl text-sand md:text-3xl">
            Not sure where to start?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-sand/60">
            Pick anything that sounds like your kind of trip. We&apos;ll take it
            from there.
          </p>

          {interests.length > 0 && (
            <Chips legend="What moves you" items={interests} param="theme" />
          )}
          {durations.length > 0 && (
            <Chips legend="How long" items={durations} param="duration" />
          )}
          <Chips legend="Travelling as" items={PARTIES} param="party" />

          <Link
            href="/tours"
            className="link-line mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-copper-light"
          >
            Browse every journey <ArrowRight size={15} />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

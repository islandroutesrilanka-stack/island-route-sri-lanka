"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Send,
  Check,
  Loader2,
  Sparkles,
  Car,
  PenLine,
  ChevronDown,
} from "lucide-react";
import GradientPanel from "@/components/media/GradientPanel";
import { site } from "@/lib/site";
import { submitBooking, submitInquiry } from "@/lib/actions";

/**
 * The enquiry form.
 *
 * ── One submission path, on purpose ────────────────────────────────────────
 *
 * This form used to offer two: "Send request" (server action → database →
 * notification email) and, beside it at equal visual weight, "Or send via
 * WhatsApp", which opened wa.me with the fields pasted into a chat message.
 * A third route appeared on failure — when the backend was unconfigured the
 * submit handler silently redirected the visitor into WhatsApp.
 *
 * All three are gone, at the owner's request: enquiries now arrive in one
 * place, in one shape, and every one of them is recorded. A WhatsApp handoff
 * left no row in the database, so it could not be counted, followed up from
 * the admin, or answered by anyone who wasn't holding that phone.
 *
 * WhatsApp is still a contact channel — the floating button, the footer, the
 * navbar and the sidebar beside this form all still open a chat. What it is no
 * longer is a way to *submit this form*. If you are reintroducing a WhatsApp
 * affordance here, that is the distinction to hold: a link that says "talk to
 * us" is fine; a button that ships the form's contents into a chat window is
 * what was removed.
 *
 * ── Why the first question is a mode and not a dropdown ────────────────────
 *
 * The form used to open with one <select> of nine service names — "Airport
 * Transfer", "Day Tour", "Custom Itinerary" and so on. That list predates the
 * signature collection, and it had no room for it: someone arriving from
 * "The Cultural Odyssey" — an eight-day, US$1,850 itinerary they had just read
 * end to end — landed on a blank form and had to re-describe it as "Multi-Day
 * Tour". The most considered thing on the site was invisible at the one moment
 * it mattered most.
 *
 * So the first question is now what *kind* of thing is being planned, and each
 * answer reveals the control that suits it: the journeys as cards with their
 * own photography, the transfers as the short list they always were, and
 * tailor-made as no control at all — just the message box, because a request
 * that doesn't fit the catalogue shouldn't be squeezed into it.
 *
 * `service` still leaves here as one of the same taxonomy strings as before, so
 * existing bookings, the admin filters and the notification emails are
 * unaffected. What changed is how the visitor arrives at it.
 */

/** The subset of a Tour this form needs. Kept flat so the server can hand it
 *  across the client boundary without dragging itineraries and highlights. */
export type JourneyOption = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  priceFrom: number;
  image: string;
};

type Mode = "journey" | "transfer" | "tailor";

const modes: {
  id: Mode;
  label: string;
  hint: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "journey",
    label: "A signature journey",
    hint: "Our multi-day, chauffeur-driven collections",
    icon: Sparkles,
  },
  {
    id: "transfer",
    label: "Transfers & private driving",
    hint: "Airport runs, point-to-point, a car and driver by the day",
    icon: Car,
  },
  {
    id: "tailor",
    label: "Something tailor-made",
    hint: "Tell us the shape of it and we'll design it around you",
    icon: PenLine,
  },
];

/* The transfer half of the old service list. The tour categories that used to
   sit alongside them have moved into the journey picker, where they can be
   shown with a duration, a price and a photograph instead of a bare noun. */
const transferOptions = [
  "Airport Transfer",
  "Hotel Transfer",
  "Surf Transfer",
  "Taxi / Point-to-Point",
  "Private Driver Hire",
];

/** A journey's own category, in the vocabulary `service` has always used. The
 *  three keys are the whole `Tour["category"]` union; the fallback covers a
 *  category added to the catalogue later without a mapping here. */
const serviceForCategory: Record<string, string> = {
  "Multi-Day": "Multi-Day Tour",
  Safari: "Safari Tour",
  "Day Tour": "Day Tour",
};

/*
  Placeholders are text and WCAG scores them like any other: /55 composited over
  this panel is 3.8:1. /65 (5.0:1) is the lowest ink opacity that clears AA and
  is still visibly lighter than a filled value, which is the distinction the
  placeholder has to carry.
*/
const inputCls =
  "w-full border border-ink/25 bg-white/70 px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/65 focus:border-copper transition-colors";

const money = (n: number) => `US$${n.toLocaleString("en-US")}`;

/* ─────────────────────────── Section scaffolding ─────────────────────────── */

/**
 * Three labelled steps rather than one undifferentiated stack of eleven fields.
 * Purely visual — everything still submits at once — but it gives the eye
 * somewhere to rest and makes the form's length feel deliberate.
 */
function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink/10 pt-7 first:border-0 first:pt-0">
      <p className="eyebrow mb-5 flex items-center gap-2.5 text-ink/65">
        <span className="text-copper-deep">
          {String(step).padStart(2, "0")}
        </span>
        {title}
      </p>
      {children}
    </section>
  );
}

/* ───────────────────────────── Journey picker ────────────────────────────── */

function JourneyTile({
  journey,
  checked,
  onSelect,
}: {
  journey: JourneyOption;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer gap-4 border p-3 transition-colors ${
        checked
          ? "border-copper bg-copper/[0.06]"
          : "border-ink/15 bg-white/50 hover:border-copper/50"
      }`}
    >
      <input
        type="radio"
        name="journey"
        className="sr-only"
        checked={checked}
        onChange={onSelect}
      />
      <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden">
        {/* Same guard as TourCard: a journey can legitimately ship without a
            photograph, and passing "" to next/image renders a sourceless <img>
            rather than nothing. The treatment is the designed empty state. */}
        {journey.image ? (
          <Image
            src={journey.image}
            alt=""
            fill
            sizes="68px"
            className="object-cover"
            aria-hidden
          />
        ) : (
          <GradientPanel
            tone="moss"
            pattern="contour"
            className="h-full w-full"
          />
        )}
      </div>
      <div className="min-w-0 self-center">
        <p
          className={`font-display text-[19px] leading-tight transition-colors ${
            checked
              ? "text-copper-deep"
              : "text-ink group-hover:text-copper-deep"
          }`}
        >
          {journey.title}
        </p>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">
          {journey.duration}
        </p>
        <p className="mt-0.5 text-[13px] text-ink/70">
          from <span className="text-ink">{money(journey.priceFrom)}</span> per
          person
        </p>
      </div>
      {checked && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-copper text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </label>
  );
}

/**
 * The chosen journey, shown back to the visitor.
 *
 * This is the whole point of the redesign: someone arriving from
 * /tours/cultural-odyssey has already chosen. Showing them the journey they
 * came from — with its photograph, its length and its price — confirms the
 * form knows what they clicked, and turns the first question from "what do you
 * want?" into "is this right?".
 */
function SelectedJourneyCard({
  journey,
  onChange,
}: {
  journey: JourneyOption;
  onChange: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border border-copper/35 bg-white/60"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-44">
          {journey.image ? (
            <Image
              src={journey.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-cover"
              aria-hidden
            />
          ) : (
            <GradientPanel
              tone="deep"
              pattern="contour"
              className="h-full w-full"
            />
          )}
        </div>
        <div className="min-w-0 flex-1 p-5 md:p-6">
          <p className="eyebrow text-copper-deep">Your selected journey</p>
          <p className="font-display mt-2 text-2xl leading-tight text-ink md:text-3xl">
            {journey.title}
          </p>
          <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-ink/65">
            {journey.duration}
          </p>
          <p className="mt-1 text-[15px] text-ink/75">
            from <span className="text-ink">{money(journey.priceFrom)}</span>{" "}
            per person
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={onChange}
              className="text-[12px] uppercase tracking-[0.16em] text-ink/65 underline underline-offset-4 transition-colors hover:text-copper-deep"
            >
              Choose a different journey
            </button>
            <Link
              href={`/tours/${journey.slug}`}
              className="text-[12px] uppercase tracking-[0.16em] text-ink/65 underline underline-offset-4 transition-colors hover:text-copper-deep"
            >
              Read the itinerary
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────── The form ───────────────────────────────── */

export default function BookingForm({
  signature = [],
  dayTrips = [],
  selectedJourney = null,
  customJourneyLabel,
  defaultService,
  defaultMessage,
  defaultTourTitle,
  kind = "booking",
}: {
  /** The premium collection, shown as cards. */
  signature?: JourneyOption[];
  /** Single-day tours and safaris, offered as a secondary list. */
  dayTrips?: JourneyOption[];
  /** Resolved server-side from `?tour=`, when it matches the catalogue. */
  selectedJourney?: JourneyOption | null;
  /**
   * A `?tour=` value with no catalogue match — the journey builder sends
   * "Custom journey: Galle → Ella". It is a real answer to "what are you
   * planning", so it is shown rather than silently dropped.
   */
  customJourneyLabel?: string;
  defaultService?: string;
  defaultMessage?: string;
  /**
   * The tour name to store against the booking.
   *
   * Previously this was reverse-engineered out of `defaultMessage` by stripping
   * a known prefix, which meant anything else added to the message leaked into
   * a structured database column. Passing it explicitly keeps the two separate;
   * when it is omitted the old extraction still runs, so existing callers are
   * unaffected.
   */
  defaultTourTitle?: string;
  kind?: "booking" | "inquiry";
}) {
  /*
    Opening mode, inferred from how the visitor arrived rather than asked.

    A matched journey or a builder outline means they are here about a journey.
    A `?service=` that names a transfer opens on transfers. Everything else —
    including "Custom Itinerary", which is what /destinations and the experience
    pages send — opens on tailor-made, because that is what those links mean.
  */
  const initialMode: Mode =
    selectedJourney || customJourneyLabel
      ? "journey"
      : defaultService && transferOptions.includes(defaultService)
        ? "transfer"
        : defaultService && !transferOptions.includes(defaultService)
          ? "tailor"
          : "journey";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [journey, setJourney] = useState<JourneyOption | null>(selectedJourney);
  /** Open the picker when nothing is chosen yet; a preselected journey shows
   *  its card first and expands the picker only if asked. */
  const [picking, setPicking] = useState(!selectedJourney);
  const [transfer, setTransfer] = useState(
    defaultService && transferOptions.includes(defaultService)
      ? defaultService
      : "",
  );
  /* Held as a slug rather than a title: titles are not guaranteed unique once
     the catalogue is CMS-edited, and the category behind the slug is what
     decides which `service` string this becomes. */
  const [dayTrip, setDayTrip] = useState("");
  const dayTripTour = dayTrips.find((d) => d.slug === dayTrip) ?? null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    travellers: "2",
    message: defaultMessage ?? "",
    company: "", // honeypot — real people never fill this in
  });
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const today = new Date().toISOString().slice(0, 10);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  /*
    What actually goes into the two database columns.

    `service` stays inside the taxonomy the admin, the seed and the notification
    emails already use — the mode picker is a way of *reaching* one of those
    strings, not a replacement for them. `tourTitle` carries the exact journey
    when there is one.
  */
  const { service, tourTitle } = useMemo(() => {
    if (kind === "inquiry")
      return { service: transfer || "General enquiry", tourTitle: undefined };

    if (mode === "transfer") return { service: transfer, tourTitle: undefined };

    if (mode === "tailor")
      return {
        service: "Custom Itinerary",
        tourTitle: customJourneyLabel ?? defaultTourTitle,
      };

    // journey
    if (journey)
      return {
        service: serviceForCategory[journey.category] ?? "Multi-Day Tour",
        tourTitle: journey.title,
      };
    if (dayTripTour)
      return {
        service: serviceForCategory[dayTripTour.category] ?? "Day Tour",
        tourTitle: dayTripTour.title,
      };
    if (customJourneyLabel)
      return { service: "Custom Itinerary", tourTitle: customJourneyLabel };
    // "recommend one" — a real answer, and one the team can act on
    return { service: "Signature Journey", tourTitle: undefined };
  }, [
    kind,
    mode,
    transfer,
    journey,
    dayTripTour,
    customJourneyLabel,
    defaultTourTitle,
  ]);

  const composed = useMemo(() => {
    const lines = [
      kind === "booking"
        ? "Hello Island Route! I'd like to request a quote."
        : "Hello Island Route! I have a question.",
      form.name && `Name: ${form.name}`,
      form.email && `Email: ${form.email}`,
      form.phone && `Phone: ${form.phone}`,
      service && `Service: ${service}`,
      tourTitle && `Journey: ${tourTitle}`,
      form.date && `Travel date: ${form.date}`,
      form.travellers && `Travellers: ${form.travellers}`,
      form.message && `Details: ${form.message}`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [form, kind, service, tourTitle]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res =
        kind === "booking"
          ? await submitBooking({
              name: form.name,
              email: form.email,
              phone: form.phone,
              service,
              tourTitle:
                tourTitle ??
                defaultTourTitle ??
                defaultMessage?.replace(/^I'm interested in: /, ""),
              travelDate: form.date || undefined,
              travellers: form.travellers,
              message: form.message,
              company: form.company,
            })
          : await submitInquiry({
              name: form.name,
              email: form.email,
              phone: form.phone,
              subject: service || "General enquiry",
              message: form.message,
              company: form.company,
            });

      if (res.ok) {
        setState("saved");
      } else if (res.code === "invalid") {
        setError(res.message ?? "Please check the form and try again.");
        setState("error");
      } else if (res.code === "no_backend") {
        /*
          The database isn't configured for this deployment. This used to open
          WhatsApp with the enquiry pasted in, which quietly moved the visitor
          to a channel nobody had asked them to use. It now surfaces as an
          error like any other, and the error message offers the email fallback
          below — which carries the same composed text, and leaves the visitor
          in control of where their enquiry goes.
        */
        setError(res.message ?? "We couldn't save your request just now.");
        setState("error");
      } else {
        setError(res.message ?? "");
        setState("error");
      }
    });
  };

  /**
   * Email fallback for a failed submission — the composed enquiry, prefilled,
   * so nothing the visitor typed is lost if the save fails.
   */
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
    `Trip enquiry — ${tourTitle || service || "Sri Lanka travel"}`,
  )}&body=${encodeURIComponent(composed)}`;

  if (state === "saved") {
    return (
      /* Reduced motion is declared per-surface now that framer-motion no longer
         loads from the root layout — see the note there. Both of this
         component's return paths carry it. */
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-copper/30 bg-white/60 p-8 md:p-10 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-copper/10 text-copper-deep">
            <Check size={26} />
          </div>
          <h3 className="font-display text-3xl text-ink mt-5">
            Request received
          </h3>
          <p className="mt-3 text-ink/70 leading-relaxed max-w-md mx-auto">
            Thank you, {form.name.split(" ")[0] || "traveller"} — we&apos;ll
            reply to <span className="text-ink">{form.email}</span> within a few
            hours with a personal quote. A confirmation email is on its way.
          </p>
          {/* Somewhere to go next, rather than a dead end. Deliberately a quiet
            secondary link: the request is already in, and the visitor has no
            further action to take. */}
          <Link
            href="/tours"
            className="mt-7 inline-block border border-ink/25 px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-copper-deep hover:text-copper-deep"
          >
            Browse our journeys
          </Link>
        </motion.div>
      </MotionConfig>
    );
  }

  const showPicker = mode === "journey" && (picking || !journey);

  return (
    <MotionConfig reducedMotion="user">
      <form onSubmit={submit} className="relative space-y-8" noValidate={false}>
        {kind === "booking" && (
          <Section step={1} title="What can we plan for you?">
            {/* A radiogroup, not three buttons: this is one choice among three,
              and arrow-key navigation between them is the behaviour a keyboard
              user expects from that. */}
            <div
              role="radiogroup"
              aria-label="What can we plan for you?"
              className="grid gap-3 sm:grid-cols-3"
            >
              {modes.map((m) => {
                const active = mode === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer flex-col gap-2 border p-4 transition-colors ${
                      active
                        ? "border-copper bg-copper/[0.06]"
                        : "border-ink/15 bg-white/50 hover:border-copper/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      className="sr-only"
                      checked={active}
                      onChange={() => setMode(m.id)}
                    />
                    <m.icon
                      size={19}
                      strokeWidth={1.6}
                      className={active ? "text-copper-deep" : "text-ink/50"}
                      aria-hidden
                    />
                    <span
                      className={`text-[15px] leading-snug ${
                        active ? "text-copper-deep" : "text-ink"
                      }`}
                    >
                      {m.label}
                    </span>
                    <span className="text-[13px] leading-relaxed text-ink/65">
                      {m.hint}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* min-h keeps the fields below from jumping as the modes swap. The
              value is the tallest revealed block (the two-column picker at sm),
              measured rather than guessed; re-check it if a mode gains a
              control. */}
            <div className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {mode === "journey" && (
                    <>
                      {customJourneyLabel && !journey && !dayTrip && (
                        <div className="mb-5 border border-copper/35 bg-copper/[0.06] p-5">
                          <p className="eyebrow text-copper-deep">
                            Your outline
                          </p>
                          <p className="mt-2 text-[15px] leading-relaxed text-ink">
                            {customJourneyLabel}
                          </p>
                          <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
                            Sent through from the journey planner. Pick a
                            signature journey below if you&apos;d rather start
                            from one — or leave it as it is and we&apos;ll build
                            around it.
                          </p>
                        </div>
                      )}

                      {journey && !picking ? (
                        <SelectedJourneyCard
                          journey={journey}
                          onChange={() => setPicking(true)}
                        />
                      ) : (
                        showPicker && (
                          <>
                            <div
                              role="radiogroup"
                              aria-label="Signature journeys"
                              className="grid gap-3 sm:grid-cols-2"
                            >
                              {signature.map((j) => (
                                <JourneyTile
                                  key={j.slug}
                                  journey={j}
                                  checked={journey?.slug === j.slug}
                                  onSelect={() => {
                                    setJourney(j);
                                    setDayTrip("");
                                    setPicking(false);
                                  }}
                                />
                              ))}
                              <label
                                className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors sm:col-span-2 ${
                                  !journey && !dayTrip
                                    ? "border-copper bg-copper/[0.06]"
                                    : "border-ink/15 bg-white/50 hover:border-copper/50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="journey"
                                  className="sr-only"
                                  checked={!journey && !dayTrip}
                                  onChange={() => {
                                    setJourney(null);
                                    setDayTrip("");
                                  }}
                                />
                                <span className="text-[15px] text-ink">
                                  Not sure yet — recommend something
                                </span>
                                <span className="text-[13px] text-ink/65">
                                  Tell us below what you&apos;re after and
                                  we&apos;ll propose the right one.
                                </span>
                              </label>
                            </div>

                            {dayTrips.length > 0 && (
                              <div className="mt-5">
                                <label
                                  className="eyebrow mb-2 block text-ink/65"
                                  htmlFor="bf-daytrip"
                                >
                                  Or something from the wider catalogue
                                </label>
                                <div className="relative">
                                  <select
                                    id="bf-daytrip"
                                    className={`${inputCls} appearance-none pr-11`}
                                    value={dayTrip}
                                    onChange={(e) => {
                                      setDayTrip(e.target.value);
                                      if (e.target.value) setJourney(null);
                                    }}
                                  >
                                    <option value="">
                                      Day tours, safaris & shorter trips…
                                    </option>
                                    {dayTrips.map((d) => (
                                      <option key={d.slug} value={d.slug}>
                                        {d.title} — {d.duration}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45"
                                    aria-hidden
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )
                      )}
                    </>
                  )}

                  {mode === "transfer" && (
                    <div>
                      <label
                        className="eyebrow mb-2 block text-ink/65"
                        htmlFor="bf-transfer"
                      >
                        Which service?
                      </label>
                      <div className="relative">
                        <select
                          id="bf-transfer"
                          required
                          className={`${inputCls} appearance-none pr-11`}
                          value={transfer}
                          onChange={(e) => setTransfer(e.target.value)}
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {transferOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-ink/65">
                        Add pick-up and drop-off points, flight numbers and
                        times further down and we&apos;ll quote the exact run.
                      </p>
                    </div>
                  )}

                  {mode === "tailor" && (
                    <p className="border border-ink/15 bg-white/50 p-5 text-[15px] leading-relaxed text-ink/75">
                      Nothing to choose here — the details box further down is
                      the brief. Dates, the places you have in mind, how you
                      like to travel, an occasion worth marking. We design from
                      whatever you have, however rough.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Section>
        )}

        <Section
          step={kind === "booking" ? 2 : 1}
          title="Who we're replying to"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                className="eyebrow text-ink/65 block mb-2"
                htmlFor="bf-name"
              >
                Your name
              </label>
              <input
                id="bf-name"
                required
                autoComplete="name"
                className={inputCls}
                placeholder="Jane Traveller"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div>
              <label
                className="eyebrow text-ink/65 block mb-2"
                htmlFor="bf-email"
              >
                Email
              </label>
              <input
                id="bf-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                pattern="[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}"
                className={inputCls}
                placeholder="you@email.com"
                value={form.email}
                onChange={set("email")}
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              className="eyebrow text-ink/65 block mb-2"
              htmlFor="bf-phone"
            >
              Phone{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="bf-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className={`${inputCls} sm:max-w-[calc(50%-0.625rem)]`}
              placeholder="+44 …"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
        </Section>

        <Section step={kind === "booking" ? 3 : 2} title="The details">
          {kind === "booking" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  className="eyebrow text-ink/65 block mb-2"
                  htmlFor="bf-date"
                >
                  Travel date
                </label>
                <input
                  id="bf-date"
                  type="date"
                  min={today}
                  className={inputCls}
                  value={form.date}
                  onChange={set("date")}
                />
              </div>
              <div>
                <label
                  className="eyebrow text-ink/65 block mb-2"
                  htmlFor="bf-pax"
                >
                  Travellers
                </label>
                <div className="relative">
                  <select
                    id="bf-pax"
                    className={`${inputCls} appearance-none pr-11`}
                    value={form.travellers}
                    onChange={set("travellers")}
                  >
                    {["1", "2", "3", "4", "5", "6", "7", "8+"].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/45"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          )}

          <div className={kind === "booking" ? "mt-5" : ""}>
            <label className="eyebrow text-ink/65 block mb-2" htmlFor="bf-msg">
              {kind === "booking" ? "Tell us about your trip" : "Your message"}
            </label>
            <textarea
              id="bf-msg"
              rows={5}
              className={inputCls}
              placeholder="Route ideas, hotels, interests, special occasions…"
              value={form.message}
              onChange={set("message")}
            />
          </div>
        </Section>

        {/* Honeypot: hidden from people, irresistible to bots */}
        <div
          className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
          aria-hidden
        >
          <label htmlFor="bf-company">Company (leave blank)</label>
          <input
            id="bf-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={set("company")}
          />
        </div>

        {/* One button now. It was previously paired with a WhatsApp button of
          equal weight, which made "how do I send this?" a question the form
          asked the visitor rather than answered. */}
        <div className="border-t border-ink/10 pt-7">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2.5 bg-ink px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-deep disabled:opacity-60 sm:w-auto"
          >
            {pending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {pending ? "Sending…" : "Request your proposal"}
          </motion.button>

          <div aria-live="polite">
            {state === "error" && (
              <p className="pt-4 text-sm text-copper-deep">
                {error || "Something went wrong saving your request"} — please
                email us directly at{" "}
                <a href={mailto} className="underline">
                  {site.email}
                </a>
                . Your message is already prefilled.
              </p>
            )}
          </div>

          {/* Kept as a phone line only. WhatsApp is still one tap away on every
            page (the floating button, the footer, the navbar) — it just isn't
            offered from inside the form, where it read as a second way to send
            this enquiry. */}
          <p className="pt-4 text-xs leading-relaxed text-ink/65">
            Prefer to talk it through? Call us on{" "}
            <a
              href={`tel:${site.phoneE164}`}
              className="underline hover:text-copper-deep"
            >
              {site.phoneDisplay}
            </a>
            . No payment is taken online — everything is confirmed personally
            first.
          </p>
        </div>
      </form>
    </MotionConfig>
  );
}

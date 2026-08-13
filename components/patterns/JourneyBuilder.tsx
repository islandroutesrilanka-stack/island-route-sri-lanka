"use client";

/**
 * Build Your Own Journey (/tours).
 *
 * A visitor who doesn't want a packaged trip can assemble the shape of one and
 * hand it to us. Deliberately NOT a booking system: nothing is reserved,
 * nothing is persisted, no table exists. Selections live in component state
 * and leave as a link into the enquiry flow that already works.
 *
 * ── Why this is a wizard now ───────────────────────────────────────────────
 *
 * The previous version put all thirty-two options on screen at once, in four
 * unlabelled chip rows. Everything was visible, which sounds like a virtue and
 * isn't: nothing signalled where to start, nothing signalled when you were
 * finished, and the reward for picking well was a summary box you had to look
 * away from the chips to read. On a phone the whole thing was one long scroll
 * of near-identical grey pills.
 *
 * So: one question per screen, five screens, and the last one shows you what
 * you built before you send it. Each question is answerable in a single glance
 * and a single tap, which is the actual test of a form like this.
 *
 * Two rules the design holds to:
 *
 *   • Every step is optional and every step is reversible. Nothing gates
 *     "Continue", the stepper jumps anywhere at any time, and tapping a chosen
 *     card again clears it. A planner that can strand you is worse than a list
 *     of chips.
 *
 *   • No auto-advance on selection. It demos beautifully and it traps people:
 *     if the panel leaves the moment you choose, you cannot un-choose without
 *     going back, and anyone reading with a screen reader loses their place
 *     mid-sentence. Continue is a button because the visitor decides when.
 *
 * ── How the handoff stays inside the existing query model ──────────────────
 *
 * `theme`, `duration` and `party` map one-to-one onto TourFilters and are
 * encoded by `filtersToQuery`, so /book's `describeFilters` renders them into
 * the message exactly as the homepage planner's chips already do.
 *
 * Destinations are the exception, and worth explaining. `destination` is a
 * single-value filter — `parseTourFilters` takes the first entry of a repeated
 * param — so encoding a four-stop route there would silently drop three stops.
 * Rather than widen the query model (which /book, /tours and the QA suite all
 * depend on), a multi-stop route is written into `tour`, the free-text field
 * /book already turns into "I'm interested in: …". Existing params keep their
 * exact meaning; nothing new is invented.
 *
 * A single chosen destination still goes through `destination`, so the
 * enquiry carries the same structured context it would from any other entry
 * point on the site.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { experienceCategories } from "@/lib/experiences";
import {
  filtersToQuery,
  DURATION_LABELS,
  PARTY_LABELS,
} from "@/lib/tour-filters";

type StepId = "theme" | "duration" | "party" | "places" | "review";

/** Question per step. `label` is the stepper's word for it — one word where
 *  possible, because five labels have to sit on one line at 1024px. */
const STEPS: { id: StepId; label: string; question: string; hint: string }[] = [
  {
    id: "theme",
    label: "Interests",
    question: "What moves you?",
    hint: "Pick the one thing you'd be sorry to miss. We'll build the rest around it.",
  },
  {
    id: "duration",
    label: "Length",
    question: "How long do you have?",
    hint: "A rough idea is plenty — we'll tell you honestly what fits.",
  },
  {
    id: "party",
    label: "Party",
    question: "Who's travelling?",
    hint: "It changes the pace, the vehicle and where we'd send you.",
  },
  {
    id: "places",
    label: "Places",
    question: "Anywhere you already know you want?",
    hint: "Tap them in the order you'd like to travel. Leave it blank and we'll route it for you.",
  },
  {
    id: "review",
    label: "Review",
    question: "Here's the shape of it",
    hint: "Send this over and we'll come back with a route, a price and a plan.",
  },
];

/** Party labels read as sentence fragments ("a couple") because that is how the
 *  summary uses them. As a card label they need a capital. */
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The step's question, focused when the panel it belongs to mounts.
 *
 * Focus has to move on a step change or a keyboard visitor is left on a
 * Continue button that now belongs to a screen they can't see, and a screen
 * reader announces nothing at all. It lives in its own component on purpose:
 * an effect in the parent keyed on `step` fires while AnimatePresence is still
 * playing the *previous* panel out, so the ref points at a heading that is
 * about to be unmounted and focus lands on <body>. Mounting with the new panel
 * is the only moment the new heading exists.
 */
function StepHeading({
  id,
  text,
  autoFocus,
}: {
  id: string;
  text: string;
  autoFocus: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    ref.current?.focus({ preventScroll: true });
    // `nearest` scrolls only when the question is actually out of view — which
    // it is on a phone after a long step, and isn't on a desktop where the
    // whole builder fits. Never scrolls on first load: autoFocus is false then.
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [autoFocus]);

  return (
    <h3
      id={id}
      ref={ref}
      tabIndex={-1}
      className="h-display text-2xl text-sand outline-none md:text-3xl"
    >
      {text}
    </h3>
  );
}

/** The id the option grids point their `aria-labelledby` at, so a screen reader
 *  announces the question when focus enters the choices. */
const QUESTION_ID = "jb-question";

function OptionCard({
  label,
  sub,
  subFromSm = false,
  selected,
  order,
  onClick,
  align = "left",
}: {
  label: string;
  sub?: string;
  /** Hide the sub-line on phones. Twelve two-line cards is a 1,400px step. */
  subFromSm?: boolean;
  selected: boolean;
  /** 1-based position, shown on multi-select cards where sequence is meaningful. */
  order?: number;
  onClick: () => void;
  align?: "left" | "center";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex h-full min-h-[64px] w-full flex-col justify-center border px-4 py-3.5 text-left transition-colors duration-200 ${
        align === "center" ? "items-center text-center" : "items-start"
      } ${
        selected
          ? "border-copper-light bg-copper-light/10"
          : "border-sand/15 hover:border-sand/40 hover:bg-sand/[0.03]"
      }`}
    >
      <span
        className={`text-[13px] uppercase tracking-[0.1em] transition-colors ${
          selected ? "text-copper-light" : "text-sand/85 group-hover:text-sand"
        } ${order ? "pr-7" : ""}`}
      >
        {label}
      </span>
      {sub && (
        <span
          className={`mt-1.5 line-clamp-2 text-[13px] leading-snug text-sand/50 ${
            subFromSm ? "hidden sm:block" : ""
          }`}
        >
          {sub}
        </span>
      )}

      {/* Selection mark. On the ordered step it carries the stop number, which
          is the only signal that the sequence you tap is the sequence we read. */}
      {selected && (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-copper-light text-[10px] font-medium text-deep"
        >
          {order ?? <Check size={12} strokeWidth={3} />}
        </span>
      )}
    </button>
  );
}

/** A chosen value in the review panel, with its own clear button. */
function SummaryPill({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-sand/20 py-1.5 pl-3 pr-1.5 text-[12px] text-sand/80">
      {text}
      <button
        type="button"
        onClick={onClear}
        className="flex h-6 w-6 items-center justify-center text-sand/40 transition-colors hover:text-copper-light"
        aria-label={`Remove ${text}`}
      >
        <X size={13} />
      </button>
    </span>
  );
}

export default function JourneyBuilder() {
  const reduce = useReducedMotion();

  /** Ordered: the sequence a visitor picks reads as the route they want. */
  const [stops, setStops] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [party, setParty] = useState<string>();

  const [step, setStep] = useState(0);
  /** Slide direction, so going back doesn't animate like going forward. */
  const [dir, setDir] = useState(1);
  /** False until the visitor moves for the first time, so the builder never
   *  grabs focus or scroll from the rest of the page on load. */
  const navigated = useRef(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goTo = (i: number) => {
    if (i === step) return;
    navigated.current = true;
    setDir(i > step ? 1 : -1);
    setStep(Math.min(Math.max(i, 0), STEPS.length - 1));
  };

  const toggleStop = (slug: string) =>
    setStops((s) =>
      s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug],
    );

  /** Toggling the selected value off is how a visitor clears one choice. */
  const pick =
    (set: (v: string | undefined) => void, currentValue: string | undefined) =>
    (v: string) =>
      set(currentValue === v ? undefined : v);

  const stopNames = useMemo(
    () =>
      stops
        .map((s) => destinations.find((d) => d.slug === s)?.name)
        .filter((n): n is string => Boolean(n)),
    [stops],
  );

  const href = useMemo(() => {
    const query = filtersToQuery({
      theme,
      duration,
      party,
      // Structured single-destination context, exactly as elsewhere on the site.
      destination: stops.length === 1 ? stops[0] : undefined,
    });
    // A multi-stop route goes in `tour` — free text /book already renders.
    if (stopNames.length > 1) {
      const p = new URLSearchParams(query.replace(/^\?/, ""));
      p.set("tour", `Custom journey: ${stopNames.join(" → ")}`);
      return `/book?${p.toString()}`;
    }
    return `/book${query}`;
  }, [theme, duration, party, stops, stopNames]);

  const chosenCount =
    (theme ? 1 : 0) + (duration ? 1 : 0) + (party ? 1 : 0) + stops.length;

  /*
    Which steps actually hold an answer — not which ones you have walked past.

    The stepper used to tick every step behind the current one, so skipping
    "Party" and continuing marked it complete. That is the one thing a progress
    indicator must not do: it told the visitor they had answered a question
    they hadn't, and the only way to discover otherwise was to reach the review
    panel and find it missing. Position still drives the connecting rule (where
    you are); answers drive the ticks (what you've said).
  */
  const answers: Record<StepId, boolean> = {
    theme: Boolean(theme),
    duration: Boolean(duration),
    party: Boolean(party),
    places: stops.length > 0,
    review: false,
  };
  const questionCount = STEPS.length - 1; // review asks nothing
  const answeredCount = STEPS.filter(
    (s) => s.id !== "review" && answers[s.id],
  ).length;

  /** Clears just this step, for the visitor who picked the wrong thing and
   *  can't be expected to guess that tapping a chosen card again un-picks it. */
  const clearStep = () => {
    if (current.id === "theme") setTheme(undefined);
    if (current.id === "duration") setDuration(undefined);
    if (current.id === "party") setParty(undefined);
    if (current.id === "places") setStops([]);
  };

  const themeName = experienceCategories.find((c) => c.slug === theme)?.name;

  /* `mode="wait"` means exit runs to completion before the next panel enters,
     so the two durations add up on every single step. A symmetrical 0.3/0.3
     costs 600ms per tap, which reads as lag in a five-step form — the exit is
     deliberately clipped to little more than a fade-out. */
  const slide = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0, x: dir * 24 },
        animate: { opacity: 1, x: 0 },
        exit: {
          opacity: 0,
          x: dir * -16,
          transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
        },
      };

  return (
    <div className="mx-auto max-w-4xl lg:mx-0">
      {/* ───────────────────────────────────────────────────────── stepper */}
      <nav aria-label="Journey builder steps">
        {/* Progress rule. Desktop gets named steps; on a phone five labels
            cannot sit on one line without truncating into nonsense, so the
            count carries it instead. */}
        <ol className="hidden md:flex md:items-center md:gap-1">
          {STEPS.map((s, i) => {
            const passed = i < step;
            const here = i === step;
            const answered = answers[s.id];
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={here ? "step" : undefined}
                  /* Spelled out rather than left to the tick alone: "Party,
                     answered" is unambiguous where a checkmark glyph is not. */
                  aria-label={`${s.label}${
                    s.id === "review"
                      ? ""
                      : answered
                        ? " — answered"
                        : " — not answered yet"
                  }`}
                  className={`group flex items-center gap-2.5 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    here
                      ? "text-copper-light"
                      : passed || answered
                        ? "text-sand/70 hover:text-sand"
                        : /* /55 (4.7:1 on this ground) is the floor for AA;
                             /35 was 2.97:1. The three states still read as
                             three, because /70 above is a further step up. */
                          "text-sand/55 hover:text-sand/80"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors ${
                      answered
                        ? "border-copper-light/40 bg-copper-light/15 text-copper-light"
                        : here
                          ? "border-copper-light text-copper-light"
                          : "border-sand/25 text-sand/55 group-hover:border-sand/50"
                    }`}
                  >
                    {answered ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </span>
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={`h-px flex-1 transition-colors ${
                      passed ? "bg-copper-light/40" : "bg-sand/15"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Phone: same stepper, stripped to its numbers. Five labels cannot sit
            on one line at 375px without truncating into nonsense — five 24px
            markers can, and keeping them *tappable* matters more than naming
            them. Without this the only route from step one to the review panel
            on a phone was four taps on Continue, while a desktop visitor could
            jump straight there. The ticks carry the same meaning as on desktop:
            answered, not merely walked past.

            The count sits opposite because the phone layout has nowhere else to
            show it — the bottom bar has no room for it at 375px. */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const here = i === step;
              const answered = answers[s.id];
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={here ? "step" : undefined}
                    aria-label={`${s.label}${
                      s.id === "review"
                        ? ""
                        : answered
                          ? " — answered"
                          : " — not answered yet"
                    }`}
                    /* Padding rather than a bigger circle: 44px of thumb with
                       24px of ink, so the row still fits beside the count. */
                    className="flex min-h-[44px] items-center px-1.5"
                  >
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors ${
                        here
                          ? /* Filled: with no labels here, "where I am" has to
                               beat "what I've answered" for the eye. */
                            "border-copper-light bg-copper-light text-deep"
                          : answered
                            ? "border-copper-light/40 bg-copper-light/15 text-copper-light"
                            : "border-sand/25 text-sand/55"
                      }`}
                    >
                      {answered ? <Check size={11} strokeWidth={3} /> : i + 1}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {/* The live region below md — the bottom bar's copy takes over from md
              up, and the two never overlap, so a change is announced once. */}
          <p
            aria-live="polite"
            className={`shrink-0 text-[11px] uppercase tracking-[0.14em] ${
              answeredCount ? "text-copper-light" : "text-sand/55"
            }`}
          >
            {answeredCount} of {questionCount} answered
          </p>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────── panel */}
      <div className="mt-9 min-h-[22rem] md:mt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            {...slide}
            transition={{
              duration: reduce ? 0.15 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-start justify-between gap-5">
              <StepHeading
                id={QUESTION_ID}
                text={current.question}
                autoFocus={navigated.current}
              />
              {/* Un-picking by tapping the chosen card again works, but nothing
                  advertises it. This does — and it is the only way to empty a
                  four-stop route in one action. Present only when there is
                  something to clear, so it never sits there greyed out. */}
              {answers[current.id] && (
                <button
                  type="button"
                  onClick={clearStep}
                  className="mt-1.5 shrink-0 text-[11px] uppercase tracking-[0.14em] text-sand/55 transition-colors hover:text-copper-light"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-sand/55">
              {current.hint}
            </p>

            <div className="mt-7">
              {current.id === "theme" && (
                /* Two-up on phones with the blurb withheld: twelve full cards
                   stacked made this step 1,400px tall, which is the scroll the
                   wizard exists to remove. The blurb returns from sm, where
                   there is room for it to be read rather than skimmed past. */
                <ul
                  role="group"
                  aria-labelledby={QUESTION_ID}
                  className="grid grid-cols-2 gap-2.5 lg:grid-cols-3"
                >
                  {experienceCategories.map((c) => (
                    <li key={c.slug}>
                      <OptionCard
                        label={c.name}
                        sub={c.blurb}
                        subFromSm
                        selected={theme === c.slug}
                        onClick={() => pick(setTheme, theme)(c.slug)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {current.id === "duration" && (
                <ul
                  role="group"
                  aria-labelledby={QUESTION_ID}
                  className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
                >
                  {Object.entries(DURATION_LABELS).map(([value, label]) => (
                    <li key={value}>
                      <OptionCard
                        label={label}
                        align="center"
                        selected={duration === value}
                        onClick={() => pick(setDuration, duration)(value)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {current.id === "party" && (
                <ul
                  role="group"
                  aria-labelledby={QUESTION_ID}
                  className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
                >
                  {Object.entries(PARTY_LABELS).map(([value, label]) => (
                    <li key={value}>
                      <OptionCard
                        label={titleCase(label)}
                        align="center"
                        selected={party === value}
                        onClick={() => pick(setParty, party)(value)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {current.id === "places" && (
                <ul
                  role="group"
                  aria-labelledby={QUESTION_ID}
                  className="grid grid-cols-2 gap-2.5 lg:grid-cols-3"
                >
                  {destinations.map((d) => {
                    const at = stops.indexOf(d.slug);
                    return (
                      <li key={d.slug}>
                        <OptionCard
                          label={d.name}
                          sub={d.region}
                          selected={at > -1}
                          order={at > -1 ? at + 1 : undefined}
                          onClick={() => toggleStop(d.slug)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}

              {current.id === "review" && (
                <div className="border border-sand/15 p-6 md:p-8">
                  {chosenCount === 0 ? (
                    <p className="text-[15px] leading-relaxed text-sand/60">
                      You haven&apos;t chosen anything — which is a perfectly
                      good start. Send it as it is and we&apos;ll ask the
                      questions ourselves, or step back and pick whatever you
                      already know.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {(duration || themeName) && (
                        <div>
                          {duration && (
                            <p className="font-display text-2xl text-sand md:text-3xl">
                              {DURATION_LABELS[duration]}
                            </p>
                          )}
                          {themeName && (
                            <p className="mt-1.5 text-[13px] uppercase tracking-[0.14em] text-copper-light">
                              {themeName}
                            </p>
                          )}
                        </div>
                      )}

                      {stopNames.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-sand/55">
                            Your route
                          </p>
                          <p className="mt-1.5 text-[15px] leading-relaxed text-sand/85">
                            {stopNames.join(" → ")}
                          </p>
                        </div>
                      )}

                      {/* Every choice, individually removable. Getting one thing
                          wrong shouldn't mean walking back through the steps. */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {themeName && (
                          <SummaryPill
                            text={themeName}
                            onClear={() => setTheme(undefined)}
                          />
                        )}
                        {duration && (
                          <SummaryPill
                            text={DURATION_LABELS[duration]}
                            onClear={() => setDuration(undefined)}
                          />
                        )}
                        {party && (
                          <SummaryPill
                            text={`Travelling as ${PARTY_LABELS[party]}`}
                            onClear={() => setParty(undefined)}
                          />
                        )}
                        {stops.map((s) => {
                          const name =
                            destinations.find((d) => d.slug === s)?.name ?? s;
                          return (
                            <SummaryPill
                              key={s}
                              text={name}
                              onClear={() => toggleStop(s)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-stretch gap-x-6 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center gap-2.5 bg-copper-deep px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
                    >
                      Plan my journey <ArrowRight size={15} aria-hidden />
                    </Link>
                    {chosenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTheme(undefined);
                          setDuration(undefined);
                          setParty(undefined);
                          setStops([]);
                          goTo(0);
                        }}
                        className="text-[12px] uppercase tracking-[0.14em] text-sand/55 transition-colors hover:text-sand"
                      >
                        Start over
                      </button>
                    )}
                  </div>

                  <p className="mt-5 text-[12px] leading-relaxed text-sand/50">
                    This starts an enquiry — nothing is booked and no payment is
                    taken. You can edit everything on the next page.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ──────────────────────────────────────────────────── step controls */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-sand/15 pt-6">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className="inline-flex min-h-[44px] items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-sand/60 transition-colors hover:text-sand disabled:pointer-events-none disabled:opacity-0"
        >
          <ArrowLeft size={15} aria-hidden />
          Back
        </button>

        {/* The count is the quiet reassurance that the earlier steps kept what
            you gave them — the panel can only ever show one of them at a time.
            Hidden below md: at 375px, Back + this + Continue do not fit on one
            line, and the phone stepper carries the same count already. The
            breakpoint matches the stepper's exactly so the two counts are never
            on screen together — one live region at a time, announced once. */}
        <p
          aria-live="polite"
          className="hidden text-[11px] uppercase tracking-[0.14em] text-sand/55 md:block"
        >
          {answeredCount === 0
            ? "Every step is optional"
            : `${answeredCount} of ${questionCount} answered`}
        </p>

        {isLast ? (
          <span className="min-h-[44px] w-[4.5rem]" aria-hidden />
        ) : (
          /* Filled, not outlined. This is the primary action on four of the
             five steps, and it previously sat at the same weight as "Back" —
             two low-contrast outlines at opposite ends of a rule, with nothing
             saying which way the form goes. The last hop is labelled "Review"
             rather than "Continue" so the end of the wizard is visible from
             the step before it. */
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            className="inline-flex min-h-[44px] items-center gap-2 bg-sand px-6 text-[12px] uppercase tracking-[0.14em] text-deep transition-colors hover:bg-copper-light"
          >
            {step === STEPS.length - 2 ? "Review" : "Continue"}
            <ArrowRight size={15} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

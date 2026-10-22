import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "What Island Route Sri Lanka does with the details you send us, who processes them, what cookies this site sets, and how to have your data deleted.",
  alternates: { canonical: "/privacy" },
};

/**
 * The privacy notice.
 *
 * ── Why this page is not optional ──────────────────────────────────────────
 *
 * This site collects a name, an email address, a phone number, travel dates
 * and a free-text message, writes them to a database, and pushes a copy into
 * a Telegram chat. It also ships a language switcher offering German, French
 * and other EU languages, which is a clear statement of intent to solicit
 * business from people the GDPR protects. Until now there was no notice of any
 * of that anywhere on the site, and no link to one from the form that does the
 * collecting.
 *
 * ── Why the contents are reliable ──────────────────────────────────────────
 *
 * Every factual claim below was read out of this codebase rather than
 * borrowed from a template, which is the part a generic policy always gets
 * wrong:
 *
 *   • the field lists come from the two inserts in lib/actions.ts;
 *   • the processors are the four this project actually talks to — Supabase,
 *     Vercel, Telegram and Google;
 *   • the cookie section is exhaustive because there is nothing else to list:
 *     a grep for gtag, googletagmanager, google-analytics, plausible, posthog,
 *     hotjar and fbq across app/, components/ and lib/ returns nothing. This
 *     site has no analytics and no advertising pixels, so the notice can say
 *     so plainly — a rare and genuinely useful thing to be able to claim.
 *
 * ── What still needs a human ───────────────────────────────────────────────
 *
 * Two things here are business facts, not code facts, and must be confirmed
 * by the owner before this is treated as final:
 *
 *   1. RETENTION. The commitment below is deliberately expressed as a
 *      purpose rather than a number. Replace it with a definite period once
 *      you have one, because "as long as necessary" is the clause regulators
 *      ask about first.
 *   2. THE CONTROLLER'S IDENTITY. The notice names the business and its
 *      contact channels. If Island Route Sri Lanka trades under a registered
 *      company name or number, that belongs in the first section.
 *
 * And the standing caveat: this is an accurate description of what the
 * software does, written by the person who built it. It is not legal advice,
 * and it should have a lawyer's eye over it before you rely on it.
 */

/** Bump this whenever the text below changes. A stale date is worse than none. */
const LAST_UPDATED = "23 October 2026";

function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-ink/10 py-10">
      <h2 className="h-display text-2xl text-ink md:text-3xl">{heading}</h2>
      {/*
        `space-y` on the wrapper rather than margins on every <p>, so prose
        added later inherits the rhythm without anyone having to remember it.
        The measure is capped at 68ch: this is the longest unbroken reading on
        the site and a full 1280px line of 16px text is unreadable.
      */}
      <div className="mt-5 max-w-[68ch] space-y-4 text-[15px] leading-relaxed text-ink/75">
        {children}
      </div>
    </section>
  );
}

const SECTIONS: [id: string, label: string][] = [
  ["who-we-are", "Who we are"],
  ["what-we-collect", "What we collect"],
  ["why", "Why we need it"],
  ["who-sees-it", "Who else sees it"],
  ["cookies", "Cookies"],
  ["how-long", "How long we keep it"],
  ["your-rights", "Your rights"],
  ["contact", "Getting in touch"],
];

export default async function PrivacyPage() {
  const s = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy notice"
        intro="What happens to the details you send us — in plain words, written by the person who built the website rather than copied from a template."
        note={`Last updated ${LAST_UPDATED}`}
      />

      <div className="bg-sand py-14 md:py-20">
        <div className="mx-auto max-w-wrap px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/*
              Contents rail. `lg:sticky` only — a sticky block inside a short
              viewport on a phone steals the screen, and at phone width this is
              a plain list above the prose, which is the correct shape for it.
            */}
            <nav
              aria-label="On this page"
              className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start"
            >
              <p className="eyebrow text-copper-deep">On this page</p>
              {/* Same 24px floor as the FAQ jump rail, paid for differently:
                  there is no underline to keep against the text here, and a
                  vertical list wants the extra spacing anyway, so these buy
                  the target with padding. On the links and not the <ul>,
                  because the hit area of an inline anchor is its own box. */}
              <ul className="mt-3 space-y-0.5">
                {SECTIONS.map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="inline-block py-1.5 text-[14px] text-ink/65 transition-colors hover:text-copper-deep"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-9">
              <Section id="who-we-are" heading="Who we are">
                <p>
                  {site.name} plans and operates private, chauffeur-driven
                  journeys in Sri Lanka. We are the ones who decide what happens
                  to the details you send through this website, which in data
                  protection language makes us the controller of that
                  information.
                </p>
                <p>
                  You can reach us at{" "}
                  <a
                    href={`mailto:${s.email}`}
                    className="link-line text-copper-deep"
                  >
                    {s.email}
                  </a>
                  , on {s.phoneDisplay}, or by writing to us at {s.address}.
                </p>
              </Section>

              <Section id="what-we-collect" heading="What we collect">
                <p>
                  Only what you type into one of our two forms. Nothing on this
                  site collects anything about you in the background.
                </p>
                <p>
                  <strong className="font-semibold text-ink">
                    When you plan a journey
                  </strong>{" "}
                  we receive your name, your email address, your phone number if
                  you give one, which service or journey you are asking about,
                  your travel date, how many of you there are, and your message.
                </p>
                <p>
                  <strong className="font-semibold text-ink">
                    When you send a general enquiry
                  </strong>{" "}
                  we receive your name, your email address, your phone number if
                  you give one, a subject, and your message.
                </p>
                <p>
                  There is no payment on this website and no account to create,
                  so we never ask for and never hold card details or a password
                  of yours. Our hosting provider also keeps short-lived
                  technical logs of requests, which include IP addresses, as
                  every web server does.
                </p>
              </Section>

              <Section id="why" heading="Why we need it">
                <p>
                  To answer you, and then to plan and run the journey you asked
                  about. Your email address and phone number are how we send a
                  quote back; your dates and group size are what a route is
                  built from; your message is usually the most useful thing in
                  the whole enquiry.
                </p>
                <p>
                  We do not sell your details, we do not share them with
                  advertisers, and we do not add you to a marketing list. If we
                  ever want to email you something you did not ask for, we will
                  ask first.
                </p>
              </Section>

              <Section id="who-sees-it" heading="Who else sees it">
                <p>
                  Our own team, and the four service providers the website
                  depends on to work. Each one only handles what it needs to:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="font-semibold text-ink">Supabase</strong>{" "}
                    stores the enquiry itself. It is the database behind this
                    site.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Vercel</strong>{" "}
                    hosts and serves the website, and keeps the technical
                    request logs mentioned above.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Telegram</strong>{" "}
                    carries a notification to our team when an enquiry arrives,
                    so that a message sent at midnight is read in the morning
                    rather than in a week. That notification contains your
                    enquiry.
                  </li>
                  <li>
                    <strong className="font-semibold text-ink">Google</strong>{" "}
                    receives two things, in two separate situations: our email
                    runs on Gmail, so an email you send us sits there; and if
                    you choose a language other than English, the page text is
                    sent to Google Translate to be translated. Leave the site in
                    English and that second one never happens.
                  </li>
                </ul>
              </Section>

              <Section id="cookies" heading="Cookies">
                <p>
                  This website sets no analytics cookies, no advertising
                  cookies, and no tracking cookies of any kind. There is no
                  Google Analytics on it, no Meta pixel, and no third-party
                  tracker — which is why you have not been shown a cookie
                  banner. There is nothing to consent to.
                </p>
                <p>Two cookies can exist, and both do a job you asked for:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    A translation cookie, set only if you pick a language other
                    than English, remembering which one. Choosing English again
                    clears it.
                  </li>
                  <li>
                    A sign-in cookie on the staff area of the site. Unless you
                    work here, you will never have one.
                  </li>
                </ul>
              </Section>

              <Section id="how-long" heading="How long we keep it">
                <p>
                  Enquiries are kept while we are answering them, and then for
                  as long as we need them to run the journey you booked and to
                  meet our own accounting obligations afterwards. We do not keep
                  enquiries indefinitely for marketing.
                </p>
                <p>
                  If you would like yours removed sooner, ask us and we will
                  delete it.
                </p>
              </Section>

              <Section id="your-rights" heading="Your rights">
                <p>
                  You can ask us for a copy of what we hold about you, ask us to
                  correct it, or ask us to delete it. You can object to us using
                  it, and ask us to send it to you in a portable form. If you
                  are in the UK or the EU these are rights the GDPR gives you;
                  we will honour the same requests from anyone, wherever they
                  wrote to us from, because keeping two standards would be
                  harder than keeping the better one.
                </p>
                <p>
                  Write to{" "}
                  <a
                    href={`mailto:${s.email}`}
                    className="link-line text-copper-deep"
                  >
                    {s.email}
                  </a>{" "}
                  and we will deal with it. You do not need to use any
                  particular form of words. If you think we have handled your
                  details badly and we have not put it right, you are entitled
                  to complain to your national data protection authority.
                </p>
              </Section>

              <Section id="contact" heading="Getting in touch">
                <p>
                  Any question about this notice — or about anything we hold —
                  goes to{" "}
                  <a
                    href={`mailto:${s.email}`}
                    className="link-line text-copper-deep"
                  >
                    {s.email}
                  </a>
                  . A real person reads it.
                </p>
                <p>
                  If you would rather just ask us about a journey,{" "}
                  <Link href="/book#contact" className="link-line text-copper-deep">
                    the enquiry form
                  </Link>{" "}
                  is the quickest route, and{" "}
                  <Link href="/faq" className="link-line text-copper-deep">
                    the FAQ
                  </Link>{" "}
                  answers most of what people ask before they write.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

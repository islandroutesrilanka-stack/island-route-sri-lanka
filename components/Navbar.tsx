"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import LanguageSwitcher, { TranslateHost } from "@/components/LanguageSwitcher";
import { WhatsAppMark } from "@/components/icons";
import { socialProfiles, waLink, defaultWaMessage } from "@/lib/site";

/**
 * Primary navigation — five destinations and one action.
 *
 * Five is the count, and it is deliberate: each item is an axis a traveller
 * actually navigates by (a journey, a place, a thing to do, our writing, us),
 * and the sixth control is not a destination at all but the conversion. A nav
 * where everything looks equally clickable converts nothing.
 *
 * "Journeys" points at /tours — the URL is preserved for SEO, the label speaks
 * the brand's language. "Experiences" now points at the real /experiences axis
 * rather than a homepage anchor.
 *
 * The language control is the one addition, and it is placed after the
 * links rather than among them: it is not somewhere you can go. It sits
 * between the last destination and the conversion, which is where a
 * utility belongs — reachable, unweighted, and out of the CTA's way.
 *
 * On a phone it is in the bar itself, left of the menu button, and not in
 * the sheet. Someone who cannot read the page cannot be expected to guess
 * that the control which fixes that is behind a button labelled in the
 * language they cannot read. It is the one utility that has to be visible
 * before anything else is understood.
 *
 * Services, Gallery and Reviews are demoted, not removed: they stay in the
 * mobile sheet and in the footer. Fleet and Contact live in the footer only —
 * they are merging into /about and /book respectively.
 *
 * ── The sheet ───────────────────────────────────────────────────────────────
 *
 * The phone menu is a centred column, and the order in it is an argument: five
 * places to go, then the three quieter ones, then the two ways to start a
 * conversation, then where to find us elsewhere. It descends from destination
 * to intent to afterthought, and nothing in it competes with the booking
 * button for weight.
 *
 * Its contents rise in on a stagger. See `riseDelay` for why that is a
 * transition rather than an animation — the reason is Google Translate, and it
 * is not optional.
 *
 * ── On the absence of an animation library ──────────────────────────────────
 *
 * This component used framer-motion, and because it is mounted by the root
 * layout that put framer on the critical path of every page on the site:
 * 107 kB of JavaScript to download, parse and execute before anything could
 * hydrate, measured at roughly a fifth of the page's total main-thread time.
 * Worse, `initial={{ opacity: 0 }}` is written into the server HTML, so the
 * header — the topmost element on every page — was painted invisible and
 * stayed that way until the bundle had run.
 *
 * Every gesture below is the same as it was. The entrance is the same curve,
 * distance and stagger as CSS keyframes (globals.css), which run off the style
 * sheet rather than off hydration. The sliding rule is the one thing that
 * genuinely needed measurement, and it gets exactly that: eighteen lines that
 * read the active link's box and hand it to a CSS transition. That is what
 * framer's shared-layout animation does internally, minus the library.
 */
const links = [
  { href: "/tours", label: "Journeys" },
  { href: "/destinations", label: "Destinations" },
  { href: "/experiences", label: "Experiences" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

/** Kept accessible, given less weight. Mirrored in the footer.
 *  Reviews now lives inside /about — link the anchor, not the retired route. */
const secondaryLinks = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about#reviews", label: "Reviews" },
];

/**
 * The networks the mobile sheet links, and the glyph each one gets.
 *
 * Filtered from `socialProfiles` rather than listed again, so the sheet and the
 * footer can never disagree about which accounts exist or where they point.
 * WhatsApp is filtered out on purpose: it has its own button directly above,
 * and a menu that offers the same channel twice reads as padding rather than
 * as choice.
 */
const menuSocialIcons: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
};
const menuSocials = socialProfiles.filter((p) => p.name in menuSocialIcons);

/** Entrance: transform and opacity only. See the note at the render below. */
const enter = (delay: number, from: string, dur: string): CSSProperties =>
  ({
    "--rise-from": from,
    "--rise-dur": dur,
    animationDelay: `${delay}s`,
  }) as CSSProperties;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navRef = useRef<HTMLElement>(null);
  const [rule, setRule] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Close the mobile menu on Escape, and stop the page scrolling behind it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /*
      Tell the page the sheet is open, so the floating WhatsApp button can get
      out of its way (globals.css). The two collide: the float is fixed to the
      bottom-right corner and the sheet ends with its own WhatsApp button, so
      on a short phone the bubble sat directly on top of it — the same channel
      offered twice, one covering the other.

      A data attribute rather than a prop or a context because the float is a
      server component in the root layout with no JavaScript of its own, and
      making it a client component to hide it would add a hydration boundary
      to every page on the site to solve a corner-of-the-screen problem.
    */
    document.documentElement.dataset.navOpen = "true";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      delete document.documentElement.dataset.navOpen;
    };
  }, [open]);

  const solid = scrolled || !isHome || open;

  /*
    Exact-or-descendant, not `startsWith`.

    Plain `startsWith` marked /tours current on /tours-and-transfers-style
    siblings and, more to the point, would light up two items the moment any
    future route shares a prefix. `/` is excluded entirely — every path starts
    with it.
  */
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  /*
    The sliding rule.

    Measure the current link's box against the nav and hand the numbers to a
    CSS transition on a single shared element — which is what a shared-layout
    animation is, once the library is taken away. Layout effect rather than
    effect so the first measurement lands before paint and the rule never
    appears in the wrong place.

    It is rendered only once a measurement exists. That makes it the one part
    of the header that needs JavaScript, and it is the right part to give up:
    the current section is already carried by `aria-current` and by the copper
    of the active label. The rule is the flourish on top of a state that is
    legible without it.
  */
  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>("[data-nav-active]");
    if (!nav || !el) return setRule(null);
    /*
      Rects, not `offsetLeft`.

      `offsetLeft` is measured from the offset parent, and each link's offset
      parent is not this nav — it is the `rise-in` wrapper immediately around
      it, because an element carrying a transform animation counts as one. So
      every link reported an offset of 0 and the rule sat at the far left of
      the nav with the right width and the wrong position, whichever section
      you were in. Two rects subtract to the distance that was actually
      wanted, and they answer for the real box regardless of what is wrapped
      around it.
    */
    const bar = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const x = box.left - bar.left;
    const w = box.width;
    // Same numbers, same object: an observer that feeds this must not be
    // able to re-render its way into a loop.
    setRule((prev) => (prev && prev.x === x && prev.w === w ? prev : { x, w }));
  }, []);

  useLayoutEffect(() => {
    measure();
    /*
      The active label can change width without the window moving: the
      display font swaps in, and the language switcher rewrites every label
      in place. Watching the element itself catches both, and catches them
      even when the nav's overall width happens to come out the same.
    */
    const el = navRef.current?.querySelector<HTMLElement>("[data-nav-active]");
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, pathname]);

  useEffect(() => {
    // Nav labels reflow when the font swaps in and when the viewport changes.
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /*
    The sheet's staggered entrance.

    A transition, not a keyed animation.

    The stagger used to be a CSS animation restarted by giving each link a
    `key` that carried `open`, because an animation only replays for an element
    the browser has not seen before. Remounting is exactly what must not happen
    once the page can be translated: Google rewrites the text nodes it finds,
    and a node React creates afterwards is one it never revisits — so the sheet
    reopened in English on an otherwise German page. A transition replays on
    the same element, so the words survive.

    The rise is vertical now rather than in from the leading edge. A centred
    column has no leading edge to enter from; things arriving sideways under a
    centred headline look like they missed their mark. Eight pixels up, and the
    whole sheet settles rather than slides.

    Closing collapses the delays to zero. A staggered exit means the last item
    is still on screen a third of a second after the menu was dismissed, which
    reads as lag — the gesture people want back is instant.
  */
  const riseDelay = (i: number): CSSProperties => ({
    transitionDelay: open ? `${0.05 * i}s` : "0s",
  });

  const rise = `transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
    open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
  }`;

  return (
    /*
      Entrance animation.

      Transform and opacity only — never height or padding. Every page's top
      padding is calibrated to this header's h-16/md:h-20, so anything that
      animated its box would shift the whole document on load.

      It plays once: Navbar is mounted by the root layout and survives
      client-side navigation, so the keyframe runs on first paint and never
      again. Reduced motion is handled globally in globals.css, which collapses
      every animation on the site to a single frame.
    */
    <header
      style={enter(0.05, "-18px", "0.7s")}
      className={`rise-in fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-ink/10 bg-sand/95 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/*
        Scrim keeps nav text legible over bright hero imagery.

        Sized from the measurement rather than by eye. The bar is h-16 / h-20,
        so nav text sits in the top quarter of this band — which is why the
        gradient holds near its full weight down to 45% and only then falls
        away, instead of easing off linearly from the first pixel and leaving
        the type in the thin end of it. At the worst frame a hero can produce,
        a pure white one, that puts `text-sand/70` — the faintest thing in the
        bar — above 4.5:1 on this layer alone, before the hero adds its own.

        The band is taller than the bar it protects (14rem against 5rem) for
        the same reason a film title has a graded top edge: the fade has to
        finish somewhere the eye does not read as an edge.
      */}
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(to_bottom,rgba(3,39,34,0.88),rgba(3,39,34,0.78)_45%,rgba(3,39,34,0.34)_72%,transparent)]"
        />
      )}
      {/* `z-10` so the language panel, which drops out of this bar, paints
          over the sheet below it — a later sibling would otherwise win. */}
      <div className="relative z-10 mx-auto max-w-wrap px-5 md:px-8">
        {/* Height is unchanged (h-16 / md:h-20). Every page's top padding is
            calibrated to it, so anything added here has to fit inside it. */}
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Wordmark. Tighter optical tracking on the display face, and the
              locality set in small caps rather than as a second-class label. */}
          <div className="rise-in" style={enter(0.22, "-8px", "0.5s")}>
            {/* A brand name, not a phrase: `translate` keeps it reading
                Island Route in every language the switcher offers. */}
            <Link
              href="/"
              translate="no"
              className="group flex items-baseline gap-2.5"
            >
              <span
                className={`font-display text-xl tracking-[-0.015em] transition-colors md:text-[1.6rem] ${
                  solid ? "text-ink" : "text-sand"
                }`}
              >
                Island Route
              </span>
              <span
                className={`hidden text-[10px] uppercase tracking-[0.28em] transition-colors sm:inline ${
                  solid ? "text-copper-deep" : "text-sand/70"
                }`}
              >
                Sri Lanka
              </span>
            </Link>
          </div>

          {/*
            Nav typography.

            Smaller, wider and lighter than before — 11px at 0.2em reads as
            considered rather than shouted, which is the whole difference
            between a nav that looks premium and one that looks like a toolbar.
            The active state is a single rule that slides between items (the
            same device RegionExplorer uses for its tabs), so the current
            section is legible without heavy colour or weight.
          */}
          <nav
            ref={navRef}
            aria-label="Main"
            className="relative hidden items-center gap-9 lg:flex"
          >
            {links.map((l, i) => {
              const active = isActive(l.href);
              return (
                <div
                  key={l.href}
                  className="rise-in"
                  style={enter(0.275 + i * 0.055, "-8px", "0.5s")}
                >
                  <Link
                    href={l.href}
                    data-nav-active={active ? "" : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`relative block py-1 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      solid
                        ? active
                          ? "text-copper-deep"
                          : "text-ink/70 hover:text-ink"
                        : active
                          ? "text-copper-light"
                          : "text-sand/80 hover:text-sand"
                    }`}
                  >
                    {l.label}
                  </Link>
                </div>
              );
            })}

            {rule && (
              <span
                aria-hidden
                style={{ transform: `translateX(${rule.x}px)`, width: rule.w }}
                className={`pointer-events-none absolute bottom-1 left-0 h-px origin-left transition-[transform,width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  solid ? "bg-copper-deep/70" : "bg-copper-light/80"
                }`}
              />
            )}

            <div
              className="rise-in"
              style={enter(0.275 + links.length * 0.055, "-8px", "0.5s")}
            >
              <LanguageSwitcher solid={solid} />
            </div>

            <div
              className="rise-in"
              style={enter(0.275 + (links.length + 1) * 0.055, "-8px", "0.5s")}
            >
              <Link
                href="/book"
                aria-current={isActive("/book") ? "page" : undefined}
                className={`ml-1 inline-block px-6 py-3 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  solid
                    ? "bg-ink text-sand hover:bg-copper-deep"
                    : "bg-sand text-ink hover:bg-copper-deep hover:text-sand"
                }`}
              >
                Plan your journey
              </Link>
            </div>
          </nav>

          {/* The mobile pair. Two controls, both 44px, both reachable with
              the thumb that is already holding the phone. */}
          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSwitcher solid={solid} touch />

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className={`-mr-2 flex h-11 w-11 items-center justify-center transition-colors ${
                solid ? "text-ink" : "text-sand"
              }`}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/*
        Mobile sheet.

        `grid-template-rows: 0fr → 1fr` is the height-auto transition without a
        measurement — the row resolves to the content's natural height at both
        ends, so it animates open and shut without anything reading a box. It
        replaces an AnimatePresence whose only job was the same two states.

        `visibility` is in the transition list on purpose: it is discrete, so it
        holds `visible` for the full collapse and only then flips, which both
        keeps the closing animation on screen and takes the links out of the
        tab order once they are gone.
      */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,visibility] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0"
        }`}
      >
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="min-h-0 overflow-hidden border-b border-ink/10 bg-sand"
        >
          {/*
            One centred column.

            Left-aligned links read as a list of options to be worked through.
            Centred, at this size, on this much space, they read as a title
            sequence — which is the difference between a menu that looks like
            navigation and one that looks like an invitation. Everything below
            inherits the alignment from here; the rows that need it add their
            own `justify-center`.

            The bottom padding clears the home indicator on phones that have
            one, which matters because the social row is the last thing in the
            sheet and sits exactly where the gesture bar lives.
          */}
          <div
            style={{
              paddingBottom: "max(2.25rem, env(safe-area-inset-bottom))",
            }}
            className="max-h-[calc(100svh-4rem)] overflow-y-auto px-6 pt-4 text-center"
          >
            {links.map((l, i) => {
              const active = isActive(l.href);
              return (
                <div key={l.href} style={riseDelay(i)} className={rise}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    /*
                      Short screens compress rather than scroll. At this size
                      the column is 687px, which a 390x844 phone holds with
                      room over and an iPhone SE does not — and a menu you have
                      to scroll to reach the booking button is a menu that has
                      lost the argument. Above 720px of viewport the spacing is
                      the generous one; below it the type steps down and the
                      padding halves, and the whole sheet fits again.
                    */
                    className={`relative block py-4 font-display text-[1.7rem] leading-[1.15] transition-colors [@media(max-height:720px)]:py-2 [@media(max-height:720px)]:text-[1.45rem] ${
                      active ? "text-copper-deep" : "text-ink"
                    }`}
                  >
                    {l.label}
                    {/*
                      The same copper rule the desktop nav slides between its
                      items, held still under one label. It is the flourish on
                      a state the copper already carries, so it is absolutely
                      positioned and cannot touch the rhythm of the column.

                      It goes away on the compressed layout. There the padding
                      is 8px, which is not enough clearance for a detached rule
                      — it lands against the descenders and reads as an
                      underline rather than as the mark it is on every other
                      screen. The copper carries the state on its own.

                      The hairlines that used to run under every link are gone.
                      Edge-to-edge rules under centred type read as table rows,
                      and the spacing does that job better.
                    */}
                    {active && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-px w-8 bg-copper-deep/60 [@media(max-height:720px)]:hidden"
                      />
                    )}
                  </Link>
                </div>
              );
            })}

            {/* Secondary — present and reachable, given less weight. The rule
                above it is short and centred rather than edge to edge: it
                closes the navigation group without drawing a box around it. */}
            <div style={riseDelay(links.length)} className={rise}>
              <div aria-hidden className="mx-auto mt-8 h-px w-10 bg-ink/15" />
              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                {secondaryLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[11px] uppercase tracking-[0.18em] text-ink/60 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div style={riseDelay(links.length + 1)} className={rise}>
              <Link
                href="/book"
                className="mt-8 block bg-ink py-4 text-[12px] uppercase tracking-[0.18em] text-sand transition-colors hover:bg-copper-deep"
              >
                Plan your journey
              </Link>
            </div>

            {/* The WhatsApp channel stays — the raw number does not. It opens
                a pre-filled chat, which is the useful part; printing the
                digits only added noise the header had to carry.

                The mark is WhatsApp's own shape in the site's green rather
                than the brand's. #25D366 on sand is under 2:1 and looks
                washed out at 17px; moss is a real colour from this palette
                and reads as deliberate. The shape is what carries the
                recognition, and the label carries the meaning. */}
            <div style={riseDelay(links.length + 2)} className={rise}>
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2.5 border border-ink/20 py-4 text-[12px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink/40"
              >
                <WhatsAppMark size={17} className="text-moss" />
                WhatsApp us
              </a>
            </div>

            {/* Socials close the sheet, and are the quietest thing in it.

                Bare, where the footer's are boxed. The two buttons directly
                above are already a filled rectangle and an outlined one, and a
                third and a fourth outline underneath them turned the bottom of
                the sheet into a stack of boxes — the icons started reading as
                empty form fields rather than as a signature. The 44px target
                stays; only the border goes. */}
            <div style={riseDelay(links.length + 3)} className={rise}>
              <ul className="mt-8 flex items-center justify-center gap-4">
                {menuSocials.map(({ name, handle, href }) => {
                  const Icon = menuSocialIcons[name];
                  return (
                    <li key={name}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${name} — ${handle}`}
                        title={`${name} — ${handle}`}
                        className="flex h-11 w-11 items-center justify-center text-ink/65 transition-colors hover:text-copper-deep"
                      >
                        <Icon size={19} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </div>

      {/* Google's gadget builds itself in here and is hidden in
          globals.css. It has to hang off something that survives every
          client-side navigation, and the header is exactly that. */}
      <TranslateHost />
    </header>
  );
}

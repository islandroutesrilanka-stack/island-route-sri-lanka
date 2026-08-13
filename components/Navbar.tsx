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
import { Menu, X } from "lucide-react";
import { waLink, defaultWaMessage } from "@/lib/site";

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
 * Services, Gallery and Reviews are demoted, not removed: they stay in the
 * mobile sheet and in the footer. Fleet and Contact live in the footer only —
 * they are merging into /about and /book respectively.
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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
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
    setRule({ x: el.offsetLeft, w: el.offsetWidth });
  }, []);

  useLayoutEffect(measure, [measure, pathname]);

  useEffect(() => {
    // Nav labels reflow when the font swaps in and when the viewport changes.
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

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
      {/* Scrim keeps nav text legible over bright hero imagery */}
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-deep/70 to-transparent"
        />
      )}
      <div className="relative mx-auto max-w-wrap px-5 md:px-8">
        {/* Height is unchanged (h-16 / md:h-20). Every page's top padding is
            calibrated to it, so anything added here has to fit inside it. */}
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Wordmark. Tighter optical tracking on the display face, and the
              locality set in small caps rather than as a second-class label. */}
          <div className="rise-in" style={enter(0.22, "-8px", "0.5s")}>
            <Link href="/" className="group flex items-baseline gap-2.5">
              <span
                className={`font-display text-xl tracking-[-0.015em] transition-colors md:text-[1.6rem] ${
                  solid ? "text-ink" : "text-sand"
                }`}
              >
                Island Route
              </span>
              <span
                className={`hidden text-[10px] uppercase tracking-[0.28em] transition-colors sm:inline ${
                  solid ? "text-copper-deep/90" : "text-sand/70"
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

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className={`-mr-2 flex h-11 w-11 items-center justify-center transition-colors lg:hidden ${
              solid ? "text-ink" : "text-sand"
            }`}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
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
          <div className="max-h-[calc(100svh-4rem)] overflow-y-auto px-5 pb-8 pt-2">
            {links.map((l, i) => {
              const active = isActive(l.href);
              return (
                /* `key` carries `open` so the stagger restarts on each opening
                   — a CSS animation only replays if the element is new. */
                <div
                  key={`${l.href}-${open}`}
                  className={open ? "slide-in" : undefined}
                  style={
                    open
                      ? ({ animationDelay: `${0.05 * i}s` } as CSSProperties)
                      : undefined
                  }
                >
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block border-b border-ink/5 py-3 font-display text-2xl transition-colors ${
                      active ? "text-copper-deep" : "text-ink"
                    }`}
                  >
                    {l.label}
                  </Link>
                </div>
              );
            })}

            {/* Secondary — present and reachable, given less weight */}
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {secondaryLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[12px] uppercase tracking-[0.14em] text-ink/65"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/book"
              className="mt-6 block bg-ink py-3.5 text-center text-[13px] uppercase tracking-[0.14em] text-sand"
            >
              Plan your journey
            </Link>
            {/* The WhatsApp channel stays — the raw number does not. It opens
                a pre-filled chat, which is the useful part; printing the
                digits only added noise the header had to carry. */}
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block border border-ink/20 py-3.5 text-center text-[13px] uppercase tracking-[0.14em] text-ink"
            >
              WhatsApp us
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

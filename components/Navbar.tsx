"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const reduce = useReducedMotion();
  const uid = useId();

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
    Entrance animation.

    Transform and opacity only — never height or padding. Every page's top
    padding is calibrated to this header's h-16/md:h-20, so anything that
    animated its box would shift the whole document on load.

    It plays once: Navbar is mounted by the root layout and survives client-side
    navigation, so `initial` runs on first paint and never again. Framer writes
    the initial transform into the server-rendered markup, so there is no
    flash of an un-offset header before hydration.
  */
  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, y: -18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 },
      };

  /* Links fade up fractionally after the bar itself, in reading order. */
  const itemEnter = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: 0.22 + i * 0.055,
          },
        };

  return (
    <motion.header
      {...enter}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-ink/10 bg-sand/95 backdrop-blur"
          : "bg-transparent"
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
          <motion.div {...itemEnter(0)}>
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
          </motion.div>

          {/*
            Nav typography.

            Smaller, wider and lighter than before — 11px at 0.2em reads as
            considered rather than shouted, which is the whole difference
            between a nav that looks premium and one that looks like a toolbar.
            The active state is a shared-element rule that slides between items
            (the same `layoutId` device RegionExplorer uses for its tabs), so
            the current section is legible without heavy colour or weight.
          */}
          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {links.map((l, i) => {
              const active = isActive(l.href);
              return (
                <motion.div key={l.href} {...itemEnter(i + 1)} className="relative">
                  <Link
                    href={l.href}
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
                  {active && (
                    <motion.span
                      layoutId={`${uid}-nav-rule`}
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 right-0 h-px ${
                        solid ? "bg-copper-deep/70" : "bg-copper-light/80"
                      }`}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                </motion.div>
              );
            })}

            <motion.div {...itemEnter(links.length + 1)}>
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
            </motion.div>
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

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Main"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-ink/10 bg-sand lg:hidden"
          >
            <div className="flex flex-col px-5 pb-8 pt-2">
              {links.map((l, i) => {
                const active = isActive(l.href);
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
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
                  </motion.div>
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
                className="mt-6 bg-ink py-3.5 text-center text-[13px] uppercase tracking-[0.14em] text-sand"
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
                className="mt-3 border border-ink/20 py-3.5 text-center text-[13px] uppercase tracking-[0.14em] text-ink"
              >
                WhatsApp us
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

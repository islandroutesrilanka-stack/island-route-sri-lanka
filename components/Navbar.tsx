"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { site, waLink, defaultWaMessage } from "@/lib/site";

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

  return (
    <header
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
          <Link href="/" className="group flex items-baseline gap-2">
            <span
              className={`font-display text-xl tracking-tight transition-colors md:text-2xl ${
                solid ? "text-ink" : "text-sand"
              }`}
            >
              Island Route
            </span>
            <span
              className={`eyebrow hidden transition-colors sm:inline ${
                solid ? "text-copper-deep" : "text-sand/80"
              }`}
            >
              Sri Lanka
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-line text-[13px] uppercase tracking-[0.14em] transition-colors ${
                    solid
                      ? active
                        ? "text-copper-deep"
                        : "text-ink/80 hover:text-ink"
                      : active
                        ? "text-copper-light"
                        : "text-sand/90 hover:text-sand"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}

            {/*
              A visible human channel next to the CTA.

              This is the single highest-trust element a small travel operator
              has: a real number, answered by a person. It appears from xl only
              so the five links and the CTA never crowd at lg, and it reuses the
              header's own height rather than adding a strip above it — which
              would shift the top of every page on the site.
            */}
            <a
              href={waLink(defaultWaMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-1 hidden items-center gap-2 text-[13px] tracking-[0.06em] transition-colors xl:inline-flex ${
                solid
                  ? "text-ink/75 hover:text-copper-deep"
                  : "text-sand/85 hover:text-sand"
              }`}
            >
              <MessageCircle size={15} aria-hidden />
              <span className="sr-only">WhatsApp us on </span>
              {site.phoneDisplay}
            </a>

            <Link
              href="/book"
              aria-current={isActive("/book") ? "page" : undefined}
              className={`ml-2 px-5 py-2.5 text-[13px] uppercase tracking-[0.14em] transition-all duration-300 ${
                solid
                  ? "bg-ink text-sand hover:bg-copper-deep"
                  : "bg-sand text-ink hover:bg-copper-deep hover:text-sand"
              }`}
            >
              Plan your journey
            </Link>
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
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 border border-ink/20 py-3.5 text-center text-[13px] uppercase tracking-[0.14em] text-ink"
              >
                WhatsApp {site.phoneDisplay}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

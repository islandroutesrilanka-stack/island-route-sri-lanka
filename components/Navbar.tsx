"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { site, waLink, defaultWaMessage } from "@/lib/site";

const links = [
  { href: "/tours", label: "Tours" },
  { href: "/destinations", label: "Destinations" },
  { href: "/services", label: "Services" },
  { href: "/fleet", label: "Fleet" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-sand/95 backdrop-blur border-b border-ink/10" : "bg-transparent"
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
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-2">
            <span
              className={`font-display text-xl md:text-2xl tracking-tight transition-colors ${
                solid ? "text-ink" : "text-sand"
              }`}
            >
              Island Route
            </span>
            <span
              className={`eyebrow hidden sm:inline transition-colors ${
                solid ? "text-copper-deep" : "text-sand/80"
              }`}
            >
              Sri Lanka
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-7">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
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
                      : "text-sand/90 hover:text-sand"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/book"
              className={`ml-2 px-5 py-2.5 text-[13px] uppercase tracking-[0.14em] transition-all duration-300 ${
                solid
                  ? "bg-ink text-sand hover:bg-copper-deep"
                  : "bg-sand text-ink hover:bg-copper-deep hover:text-sand"
              }`}
            >
              Plan my trip
            </Link>
          </nav>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden -mr-2 flex h-11 w-11 items-center justify-center transition-colors ${
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
            className="lg:hidden overflow-y-auto max-h-[calc(100svh-4rem)] bg-sand border-b border-ink/10"
          >
            <div className="px-5 pb-8 pt-2 flex flex-col">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={l.href}
                    aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                    className="block py-3 font-display text-2xl text-ink border-b border-ink/5"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/book"
                className="mt-5 bg-ink text-sand text-center py-3.5 text-[13px] uppercase tracking-[0.14em]"
              >
                Plan my trip
              </Link>
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 border border-ink/20 text-ink text-center py-3.5 text-[13px] uppercase tracking-[0.14em]"
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

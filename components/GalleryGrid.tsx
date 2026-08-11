"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GalleryItem } from "@/lib/content";

/**
 * Display order for the filter bar. Not the list of buttons — the buttons are
 * derived from the photographs actually published (see `cats` below).
 *
 * The category is a fixed six-option select in the admin, so the site can very
 * plausibly be published with, say, no Surf photographs at all. A hard-coded
 * button list then offers a filter that returns nothing, with no grid and no
 * message: a control that does nothing, which is worse than an absent one.
 */
const CATEGORY_ORDER: GalleryItem["category"][] = [
  "Beaches",
  "Wildlife",
  "Hills",
  "Culture",
  "Surf",
  "Journeys",
];

export default function GalleryGrid({ gallery }: { gallery: GalleryItem[] }) {
  const [cat, setCat] = useState<string>("All");

  /**
   * Only categories that have at least one published photograph. Anything the
   * data contains but the order list doesn't is appended rather than dropped,
   * so a category added directly in the database still reaches the visitor.
   */
  const cats = useMemo(() => {
    const found = new Set(gallery.map((g) => g.category));
    const known = CATEGORY_ORDER.filter((c) => found.has(c));
    const extra = Array.from(found).filter((c) => !CATEGORY_ORDER.includes(c));
    return ["All", ...known, ...extra];
  }, [gallery]);
  const [active, setActive] = useState<GalleryItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Lightbox: Escape to close, lock background scroll, manage focus
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      openerRef.current?.focus();
    };
  }, [active]);

  const items = cat === "All" ? gallery : gallery.filter((g) => g.category === cat);

  return (
    <div>
      {/* A single category is not a choice — the bar is omitted rather than
          rendered with one inert alternative to "All". */}
      {cats.length > 2 && (
      <div
        className="flex flex-wrap gap-2.5"
        role="group"
        aria-label="Filter gallery by category"
      >
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`min-h-[44px] px-4 py-2 text-[11px] uppercase tracking-[0.16em] border transition-colors ${
              cat === c
                ? "bg-ink text-sand border-ink"
                : "border-ink/20 text-ink/70 hover:border-copper hover:text-copper-deep"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      )}

      <motion.div layout className="mt-10 columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        <AnimatePresence mode="popLayout">
          {items.map((g, i) => (
            <motion.button
              key={g.src + g.caption}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              type="button"
              aria-label={`View larger: ${g.caption}`}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setActive(g);
              }}
              className="img-frame group mb-4 block w-full break-inside-avoid text-left"
            >
              <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`}>
                <Image
                  src={g.src}
                  alt={g.caption}
                  fill
                  sizes="(max-width:768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-deep/0 group-hover:bg-deep/25 transition-colors" />
              </div>
              <p className="py-3 px-1 text-xs text-ink/70">{g.caption}</p>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={active.caption || "Gallery image"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-deep/90 p-5 backdrop-blur-sm"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close image"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center text-sand/80 hover:text-sand"
            >
              <X size={30} />
            </button>
            <motion.figure
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="max-h-[85vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={active.src}
                  alt={active.caption}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-4 text-center text-sm text-sand/70">
                {active.caption} · <span className="text-copper-light">{active.category}</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

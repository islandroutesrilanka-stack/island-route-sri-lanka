"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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

/**
 * The shape used for a frame whose real dimensions were never recorded.
 *
 * Only the seeded fallback assets are in that position — everything uploaded
 * through scripts/upload-photography.mjs stores its measured width and height.
 * One consistent upright default is the honest answer here: the previous code
 * assigned a ratio from the item's *index*, so the same photograph changed
 * shape when a filter was clicked, and every portrait frame that landed on a
 * 4:3 cell lost its top and bottom.
 */
const DEFAULT_RATIO = { w: 4, h: 5 };

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

  const items = useMemo(
    () => (cat === "All" ? gallery : gallery.filter((g) => g.category === cat)),
    [cat, gallery],
  );

  /**
   * The lightbox holds an index into `items`, not the item itself. That is what
   * makes previous/next possible at all: the open photograph knows where it
   * sits in the set the visitor is actually looking at, so navigation stays
   * inside the filter rather than wandering into frames the grid is hiding.
   */
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : (items[open] ?? null);
  /* The enlarged frame reserves its box from the real dimensions when we have
     them. An <img> with CSS width and height both auto has no box until its
     file decodes, so the lightbox opened onto nothing for as long as the
     optimizer took to transcode the original — and the blur placeholder, which
     exists precisely for that gap, had no box to paint into.

     Only when they are real, though. Guessing a ratio here is worse than not
     reserving: a row with no stored dimensions would get the 4:5 default
     locked in, and `object-contain` would letterbox the photograph inside it
     for good, where `w-auto` at least recovers the true shape once the file
     lands. So a frame with no measurements keeps the old behaviour and gains
     the reservation the moment its row is backfilled. */
  const reserved =
    active?.width && active.height
      ? {
          width: `min(100%, calc(76vh * ${active.width / active.height}))`,
          aspectRatio: `${active.width} / ${active.height}`,
        }
      : undefined;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const step = useCallback(
    (delta: number) =>
      setOpen((i) =>
        i === null ? i : (i + delta + items.length) % items.length,
      ),
    [items.length],
  );

  /* An index into a list that just changed length means nothing, so changing
     the filter closes the lightbox rather than silently showing a different
     photograph than the one that was opened. */
  useEffect(() => setOpen(null), [cat]);

  // Lightbox: keyboard, background scroll lock, focus in and focus back out.
  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(null);
      if (e.key === "ArrowRight") return step(1);
      if (e.key === "ArrowLeft") return step(-1);
      if (e.key !== "Tab") return;
      /* aria-modal="true" is a promise that Tab cannot leave the dialog.
         Without this the next Tab lands on the page behind, where a screen
         reader has been told there is nothing. */
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      openerRef.current?.focus();
    };
  }, [open, step]);

  return (
    /* Declared here rather than in the root layout: framer-motion is only
       loaded by the handful of surfaces that animate with it, so the reduced-
       motion contract has to travel with them. `user` drops movement and keeps
       opacity, so nothing vanishes for a reader who has asked for stillness. */
    <MotionConfig reducedMotion="user">
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

        <motion.div
          layout
          className="mt-10 columns-2 md:columns-3 gap-4 [column-fill:_balance]"
        >
          <AnimatePresence mode="popLayout">
            {items.map((g, i) => {
              const w = g.width ?? DEFAULT_RATIO.w;
              const h = g.height ?? DEFAULT_RATIO.h;
              return (
                <motion.button
                  key={g.src}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: Math.min(i, 9) * 0.04 }}
                  type="button"
                  aria-label={`View larger: ${g.caption}`}
                  onClick={(e) => {
                    openerRef.current = e.currentTarget;
                    setOpen(i);
                  }}
                  className="img-frame group mb-4 block w-full break-inside-avoid text-left"
                >
                  {/* The cell takes the photograph's own ratio, so object-cover
                      has nothing left to crop. That is the point: a portrait
                      frame stays portrait and the columns do the composing. */}
                  <div className="relative" style={{ aspectRatio: `${w} / ${h}` }}>
                    <Image
                      src={g.src}
                      alt={g.alt || g.caption}
                      fill
                      sizes="(max-width:768px) 50vw, 33vw"
                      /* The first row is the largest-contentful candidate on
                         this page; everything below it can wait for the
                         viewport. */
                      priority={i < 3}
                      placeholder={g.blurDataURL ? "blur" : "empty"}
                      blurDataURL={g.blurDataURL}
                      className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-deep/0 group-hover:bg-deep/25 transition-colors" />
                  </div>
                  <p className="py-3 px-1 text-xs text-ink/70">{g.caption}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {active && (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={active.caption || "Gallery image"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-deep/95 p-5 backdrop-blur-sm"
            >
              <button
                ref={closeRef}
                type="button"
                aria-label="Close image"
                onClick={() => setOpen(null)}
                className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center text-sand/80 transition-colors hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-light"
              >
                <X size={28} />
              </button>

              {items.length > 1 && (
                <>
                  {/* 48px square, clear of the figure on every breakpoint.
                      WCAG 2.5.8 asks for 24; a control you hunt for on a phone
                      while holding it one-handed wants twice that. */}
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(-1);
                    }}
                    className="absolute left-1 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-sand/70 transition-colors hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-light sm:left-4"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(1);
                    }}
                    className="absolute right-1 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-sand/70 transition-colors hover:text-sand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-light sm:right-4"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}

              <motion.figure
                key={active.src}
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
                className="flex max-w-5xl flex-col items-center px-10 sm:px-14"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Intrinsic sizing rather than a fixed 3:2 box. The old frame
                    letterboxed every landscape photograph and shrank every
                    portrait one to a third of the screen; handing the real
                    dimensions to the browser lets it fill whichever axis runs
                    out first. */}
                <Image
                  src={active.src}
                  alt={active.alt || active.caption}
                  width={active.width ?? 1200}
                  height={active.height ?? 1500}
                  sizes="(max-width:768px) 92vw, 1100px"
                  placeholder={active.blurDataURL ? "blur" : "empty"}
                  blurDataURL={active.blurDataURL}
                  style={reserved}
                  className={`h-auto max-h-[76vh] max-w-full object-contain${
                    reserved ? "" : " w-auto"
                  }`}
                />
                <figcaption className="mt-4 max-w-prose text-center text-sm text-sand/75">
                  {active.caption}
                  {active.place && (
                    <span className="text-sand/50"> · {active.place}</span>
                  )}
                  <span className="mt-1.5 block text-[11px] uppercase tracking-[0.16em] text-copper-light">
                    {active.category}
                    {items.length > 1 && (
                      <span className="text-sand/40">
                        {" "}
                        · {open! + 1} of {items.length}
                      </span>
                    )}
                  </span>
                </figcaption>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

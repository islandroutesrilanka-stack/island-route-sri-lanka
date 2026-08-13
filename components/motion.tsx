"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Entrance motion, without an animation library.
 *
 * These four helpers were framer-motion components used on essentially every
 * section of the site — around thirteen instances on /destinations alone. That
 * cost two things worth naming:
 *
 *   • Main-thread time. Profiled under Lighthouse's mobile throttling,
 *     framer-motion was 220 ms of scripted work on /destinations, ahead of
 *     React's own 197 ms, and most of it was mounting animation components
 *     whose entire output was a fade and a 28px rise.
 *
 *   • First paint. A framer entrance is JavaScript, so `initial={{opacity:0}}`
 *     ships in the server HTML as a real `opacity: 0` and stays that way until
 *     the bundle has hydrated. With almost all copy inside a Reveal, the page
 *     had nothing to paint until then — measured first contentful paint was
 *     1248 ms against a 51 ms server response.
 *
 * The animations themselves are unchanged: same curve, same distance, same
 * duration, same one-way trigger. They are CSS now (see globals.css), driven by
 * one shared IntersectionObserver rather than one per element.
 *
 * This file imports nothing. That is the point: it is used by the root layout's
 * subtree on every route, so anything it pulls in is on the critical path of
 * the whole site. framer-motion is still a dependency, but it now loads only on
 * /gallery, /book and /admin — the surfaces whose animations genuinely need a
 * physics engine — and each of those declares its own reduced-motion contract.
 * Reduced motion for the helpers below is handled by the media query in
 * globals.css.
 */

/*
  One observer for every Reveal on the page, created lazily on first use.

  Per-element observers were what framer did internally and they are the
  expensive part: each carries its own callback, its own root-margin parse and
  its own entry in the intersection bookkeeping the compositor runs on scroll.
  A single shared instance does the same job once.

  `-60px` reproduces framer's `viewport={{ margin: "-60px" }}`: the element has
  to be 60px inside the viewport before it counts, so nothing animates while
  it is still clipped by the fold. Unobserving on first intersection is the
  `once: true` half.
*/
let observer: IntersectionObserver | null = null;

function sharedObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "-60px" },
  );
  return observer;
}

/** Fade-and-rise into view on scroll. `index` staggers siblings. */
export function Reveal({
  children,
  index = 0,
  className,
  id,
  immediate = false,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  /** Anchor target, for deep links such as /about#fleet. */
  id?: string;
  /**
   * Set on anything above the fold. The element renders visible, with no
   * entrance and no observer, so it can be painted from the server HTML
   * instead of waiting for hydration — which is the difference between a
   * first contentful paint at 51 ms and one at 1.2 s. Scroll-triggered motion
   * on something already on screen was never doing anything anyway: it fired
   * on mount, in the same frame, every time.
   */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (immediate || !el) return;

    // Browsers without IntersectionObserver get the content, not the animation.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }

    const io = sharedObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, [immediate]);

  return (
    <div
      ref={ref}
      id={id}
      className={immediate ? className : `reveal ${className ?? ""}`}
      style={
        immediate || !index
          ? undefined
          : ({ transitionDelay: `${index * 0.08}s` } as CSSProperties)
      }
    >
      {children}
    </div>
  );
}

/** Slow Ken-Burns style scale for imagery. */
export function KenBurns({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`ken-burns ${className ?? ""}`}>{children}</div>;
}

/** Hero entrance for large display text. */
export function HeroLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`rise-in ${className ?? ""}`}
      style={
        {
          "--rise-from": "40px",
          "--rise-dur": "1s",
          animationDelay: delay ? `${delay}s` : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

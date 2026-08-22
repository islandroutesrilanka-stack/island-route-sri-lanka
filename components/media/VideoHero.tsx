"use client";

/**
 * Poster-first cinematic hero.
 *
 * The governing rule: **the poster is the LCP element, always.** It renders on
 * the server, paints immediately, and is never removed. The video is a
 * progressive enhancement layered on top at opacity 0→1, so it can never cause
 * layout shift and can never become the LCP candidate.
 *
 * With nothing configured the hero shows the owner's film over its own first
 * frame (see DEFAULT_VIDEO and DEFAULT_POSTER_URL in lib/media/hero.ts).
 * Pasting a URL into `hero_video_url` or `hero_poster_url` in the admin swaps
 * either one; typing `none` in them turns the video off, or returns the hero
 * to its contour treatment. None of that is a code change.
 *
 * Deliberately absent: a `poster` attribute on the <video>. The image layer
 * beneath IS the poster; adding the attribute would download it twice — once
 * as the preloaded LCP image and once for the video element.
 *
 * The handoff is invisible only while the two layers are cropped identically.
 * The poster is the film's first frame, so both use `object-cover` over the
 * same box at the same `object-position`, and neither is scaled. Break any one
 * of those and the fade stops being a dissolve and starts being a jump.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { VideoAsset, MediaAsset } from "@/lib/media/types";
import { focalOf } from "@/lib/media/types";
import Img from "./Img";
import GradientPanel from "./GradientPanel";

/** navigator.connection is not in the standard DOM lib. */
type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
};

const PAUSE_KEY = "ir:hero-video-paused";
const MOBILE_BREAKPOINT = 768;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Every gate must pass before a single byte of video is requested.
 * Failing any one leaves the poster in place permanently — which is a complete,
 * designed state, not a degraded one.
 */
function connectionAllows(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (!conn) return true; // API absent (Safari/Firefox) — don't punish the user
  if (conn.saveData) return false;
  if (conn.effectiveType && conn.effectiveType !== "4g") return false;
  return true;
}

function onIdle(cb: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (h: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const handle = w.requestIdleCallback(cb, { timeout: 3000 });
    return () => w.cancelIdleCallback?.(handle);
  }
  const t = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(t);
}

export default function VideoHero({
  video,
  slides = [],
  slideshow = { enabled: false, durationMs: 7000 },
}: {
  video: VideoAsset;
  slides?: MediaAsset[];
  slideshow?: { enabled: boolean; durationMs: number };
}) {
  /* ------------------------------- Slideshow -------------------------------- */
  /*
    Slide 0 is rendered on the server with `priority`, so it is the LCP element
    and it appears with JavaScript disabled. Everything below only enhances it.

    `mounted` is how many slides exist in the DOM. It starts at 1 — the initial
    HTML carries exactly one image, never five — and grows by one just ahead of
    the active slide, so the browser fetches slide n+1 while slide n is on
    screen instead of pulling megabytes at first paint.
  */
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(1);
  const [slidesPaused, setSlidesPaused] = useState(false);
  const [still, setStill] = useState(false); // reduced motion / Save-Data

  const runnable = slideshow.enabled && slides.length > 1;

  useEffect(() => {
    if (!runnable) return;
    // A visitor who asked for less motion gets a single static photograph, not
    // a slower slideshow: the request is about motion, not pace.
    if (prefersReducedMotion() || !connectionAllows()) setStill(true);
  }, [runnable]);

  useEffect(() => {
    if (!runnable || slidesPaused || still) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, slideshow.durationMs);
    return () => window.clearInterval(id);
  }, [runnable, slidesPaused, still, slides.length, slideshow.durationMs]);

  // Keep one slide ahead in the DOM so the next fade has something to fade to.
  useEffect(() => {
    if (!runnable || still) return;
    setMounted((m) => Math.max(m, Math.min(slides.length, active + 2)));
  }, [active, runnable, still, slides.length]);

  const [sources, setSources] = useState<VideoAsset["sources"]>([]);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* ---- Gate evaluation. Runs after hydration, never during render. ---- */
  useEffect(() => {
    const desktop = window.innerWidth >= MOBILE_BREAKPOINT;
    const chosen = desktop ? video.sources : video.mobileSources;

    if (chosen.length === 0) return; // nothing configured — poster stays
    if (prefersReducedMotion()) return; // never requested, not merely paused
    if (!connectionAllows()) return;
    if (document.visibilityState !== "visible") return;

    // Honour a previous session's pause choice by not loading at all.
    try {
      if (window.localStorage.getItem(PAUSE_KEY) === "1") return;
    } catch {
      /* storage unavailable — proceed */
    }

    return onIdle(() => setSources(chosen));
  }, [video.sources, video.mobileSources]);

  /* ---- Pause when the tab is hidden: a background tab decoding video
         drains battery for no benefit. ---- */
  useEffect(() => {
    if (sources.length === 0) return;
    const onVisibility = () => {
      const el = videoRef.current;
      if (!el) return;
      if (document.hidden) el.pause();
      else if (!paused) void el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sources.length, paused]);

  const togglePause = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const next = !paused;
    setPaused(next);
    // Also stops the slideshow underneath, which the fade to opacity 0 is
    // about to reveal. Pausing the video only to hand the visitor a
    // cross-fading slideshow would not be pausing anything.
    setSlidesPaused(next);
    if (next) el.pause();
    else void el.play().catch(() => {});
    try {
      window.localStorage.setItem(PAUSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [paused]);

  const showVideo = sources.length > 0;

  /*
    One pause control, never two.

    Both kinds of motion can be live at once — the slideshow runs underneath
    while the video fades in over it — and each used to render its own 44px
    button into the same bottom-right corner, where they stacked. WCAG 2.2.2
    asks for a mechanism to stop the motion, not for one button per moving
    thing, so when a video is present it owns the corner and its button stops
    both. The slideshow keeps its own control only when it is the only thing
    moving.
  */
  const showControl = runnable && !still && !showVideo;

  return (
    <>
      {/* Layer 0 — the LCP element. Server-rendered, always present.
          With no verified poster this is the contour treatment, which is a
          designed surface rather than a flat dark box — the failure mode the
          previous gradient had. */}
      <div className="absolute inset-0" aria-hidden="true">
        {slides.length === 0 ? (
          <GradientPanel tone="deep" pattern="contour" className="h-full w-full" />
        ) : (
          slides.slice(0, mounted).map((asset, i) => {
            const isActive = i === active;
            return (
              <div
                key={asset.src}
                className="absolute inset-0 transition-opacity ease-linear motion-reduce:transition-none"
                style={{
                  opacity: isActive ? 1 : 0,
                  // Long enough to read as a dissolve rather than a cut. Kept
                  // well inside the slide duration so no two images are ever
                  // both half-visible for long.
                  transitionDuration: "1600ms",
                }}
              >
                <div
                  className="h-full w-full will-change-transform"
                  style={
                    /*
                      Ken Burns belongs to a slideshow. With a single slide
                      there is nothing to animate between, and because
                      `isActive` is true from the very first render the scale
                      never animates — it just paints permanently at 1.04. On a
                      hero whose one slide is the film's first frame that is a
                      4% crop away from the video laid over it, which turns the
                      dissolve into a visible jump. `runnable` is derived from
                      props alone, so this matches on the server and the client
                      and cannot snap during hydration.
                    */
                    still || !runnable
                      ? undefined
                      : {
                          // Ken Burns: 1.00 → 1.04 across the slide's life,
                          // easing out so it never looks like a zoom effect.
                          transform: isActive ? "scale(1.04)" : "scale(1)",
                          transition: `transform ${
                            slideshow.durationMs + 1600
                          }ms cubic-bezier(0.22, 1, 0.36, 1)`,
                        }
                  }
                >
                  <Img
                    asset={asset}
                    sizes="100vw"
                    priority={i === 0}
                    quality={82}
                    fallbackTone="deep"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/*
        Motion runs longer than five seconds, so an accessible stop is required
        rather than optional. It is a real <button>, so it is keyboard-reachable
        and announced correctly; 44px, bottom-right, clear of the CTAs at
        bottom-left. Pausing is sticky — the timer does not quietly resume.
      */}
      {showControl && (
        <div className="absolute bottom-5 right-5 z-30 md:bottom-8 md:right-8">
          <button
            type="button"
            onClick={() => setSlidesPaused((p) => !p)}
            aria-label={
              slidesPaused
                ? "Play the hero slideshow"
                : "Pause the hero slideshow"
            }
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sand/30 bg-deep/30 text-sand backdrop-blur-sm transition-colors hover:border-sand/60 hover:bg-deep/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
          >
            {slidesPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      )}

      {/* Layer 1 — decorative video. aria-hidden: it carries no information
          that isn't already in the text layer. */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlayThrough={() => setReady(true)}
          /*
            Matched to the poster underneath rather than left at the CSS
            default. They are the same picture, so they have to be cropped the
            same way; a poster nudged off-centre against a centred video is the
            one thing that makes an otherwise identical pair of frames read as
            two different shots.
          */
          style={slides[0] ? { objectPosition: focalOf(slides[0]) } : undefined}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
            ready && !paused ? "opacity-100" : "opacity-0"
          }`}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {/*
        Scrim — four graded layers, no flat tints anywhere.

        A fixed opacity that is right for the poster frame is wrong two
        seconds later, and the failure mode of every video hero is the same
        one: a bright frame arrives — sky, surf, white sand, a sun flare — and
        the type goes with it. So the darkening is placed where type and
        controls actually live, and the middle of the frame is left clear
        enough that the footage still reads as footage rather than as a
        darkened backdrop.

        Measured against the worst case the video can produce, a pure white
        frame, not against the poster.
      */}

      {/* 1 — Foot of the frame: the headline, the subcopy and both CTAs. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-deep via-deep/25 to-transparent"
      />

      {/* 2 — Lower-left weight, following the diagonal the type block sits on. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_100%,rgba(3,39,34,0.88),rgba(3,39,34,0.35)_45%,transparent_75%)]"
      />

      {/*
        3 — Head of the frame, under the navigation and the language switcher.

        Deliberately the lighter half of that job. The navbar carries its own
        scrim and has to: it is fixed, so it outlives this hero the moment the
        page scrolls, and it must be legible on its own terms. This one is the
        hero's share — enough that the two together hold small sand-toned text
        above 4.5:1 over a white frame, and light enough that neither alone
        reads as a black bar.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(to_bottom,rgba(3,39,34,0.34),rgba(3,39,34,0.14)_55%,transparent)]"
      />

      {/*
        4 — Colour, not protection.

        Stock footage now and real footage later both arrive with a white
        balance of their own, and neither will be this site's. A wash of ocean
        across the upper right pulls the frame back toward the Indian Ocean
        teal everything else is built on, so the hero belongs to the palette
        instead of sitting in front of it — and it happens to fall exactly
        where the language switcher does.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(80%_65%_at_82%_8%,rgba(11,110,127,0.42),rgba(11,110,127,0.14)_45%,transparent_72%)]"
      />

      {/* Cinematic letterbox — a thin bar top and bottom on large screens.
          Reads as framing rather than chrome, and gives the hero a film aspect
          without cropping the media itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-sand/15 lg:block"
      />

      {/* WCAG 2.2.2 — auto-playing motion beyond 5s needs a visible control.
          Only rendered when there is actually motion to pause. */}
      {showVideo && ready && (
        <button
          type="button"
          onClick={togglePause}
          aria-pressed={paused}
          aria-label={paused ? "Play background video" : "Pause background video"}
          className="absolute bottom-6 right-5 z-30 flex h-11 w-11 items-center justify-center border border-sand/30 bg-deep/50 text-sand backdrop-blur-sm transition-colors hover:bg-deep/80 md:bottom-8 md:right-8"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      )}
    </>
  );
}

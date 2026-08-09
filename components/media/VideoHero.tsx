"use client";

/**
 * Poster-first cinematic hero.
 *
 * The governing rule: **the poster is the LCP element, always.** It renders on
 * the server, paints immediately, and is never removed. The video is a
 * progressive enhancement layered on top at opacity 0→1, so it can never cause
 * layout shift and can never become the LCP candidate.
 *
 * At launch no video is configured, so this renders as a still hero. Populating
 * `hero_video_url` in the admin turns the cinematic version on with no code
 * change — which is the whole reason this is built now rather than later.
 *
 * Deliberately absent: a `poster` attribute on the <video>. The image layer
 * beneath IS the poster; adding the attribute would download it twice.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { VideoAsset } from "@/lib/media/types";
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

export default function VideoHero({ video }: { video: VideoAsset }) {
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
    if (next) el.pause();
    else void el.play().catch(() => {});
    try {
      window.localStorage.setItem(PAUSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [paused]);

  const showVideo = sources.length > 0;

  return (
    <>
      {/* Layer 0 — the LCP element. Server-rendered, always present.
          With no verified poster this is the contour treatment, which is a
          designed surface rather than a flat dark box — the failure mode the
          previous gradient had. */}
      <div className="absolute inset-0">
        {video.poster ? (
          <Img
            asset={video.poster}
            sizes="100vw"
            priority
            quality={82}
            fallbackTone="deep"
          />
        ) : (
          <GradientPanel tone="deep" pattern="contour" className="h-full w-full" />
        )}
      </div>

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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
            ready && !paused ? "opacity-100" : "opacity-0"
          }`}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {/* Scrim. Weighted to the lower-left where the type sits, and kept light
          across the upper-right so a future film still reads as a film rather
          than as a darkened backdrop. Flat tints fail on bright frames — sky,
          sand, white architecture — so this protects contrast across a whole
          clip, not just the poster frame. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-deep via-deep/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_100%,rgba(11,31,25,0.88),rgba(11,31,25,0.35)_45%,transparent_75%)]"
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

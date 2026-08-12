"use client";

import { useEffect } from "react";

/**
 * Completes a fragment navigation the App Router dropped.
 *
 * The bug it exists for, precisely: a hard load of `/destinations?region=…#regions`
 * scrolls to the explorer, because the browser resolves the fragment itself. The
 * same URL reached by clicking a region on the island map does not — it lands at
 * the top of the hero.
 *
 * The cause is the Suspense boundary, not the link. On a client-side navigation
 * the router renders `loading.tsx` first, then applies the fragment scroll: it
 * calls getElementById at a moment when the DOM holds a skeleton, finds nothing
 * with that id, and falls back to scrolling to the top. By the time the real
 * page streams in, the scroll decision has already been made and is not revisited.
 * Removing the skeleton would fix it and is not an option — that loading.tsx is
 * load-bearing for the 404 behaviour of /destinations/[slug] (see the note in
 * the file itself).
 *
 * So the correction is made here, from inside the tree that owns the anchor,
 * where the element is guaranteed to exist by the time the effect runs.
 *
 * Three deliberate limits:
 *
 *   • Only when the URL actually asked. No hash, no scroll — a `?region=` link
 *     written without the fragment gets the right tab and no jump, rather than a
 *     lurch half a second after paint. The QA harness asserts every region link
 *     carries the fragment, which is where that guarantee belongs.
 *
 *   • Only from the top. `scrollY > 4` means something already positioned this
 *     page — the browser resolving the fragment natively on a hard load, or a
 *     restored scroll position on reload or back. Never fight that.
 *
 *   • Instant, never smooth. This is finishing a navigation, not an in-page
 *     jump; animating two thousand pixels on arrival reads as a bug and delays
 *     the content. `block: "start"` honours the target's `scroll-margin-top`,
 *     which is what keeps the heading clear of the fixed header.
 */
export default function ScrollToAnchor({ id }: { id: string }) {
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    if (window.scrollY > 4) return;

    const el = document.getElementById(id);
    if (!el) return;

    /*
      Deferred a frame on purpose. The router's own scroll handling runs in a
      layout effect during the same commit, and a streamed segment can commit
      more than once; scrolling synchronously here wins the first race and loses
      the second. One rAF puts this after the commit has settled.
    */
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return null;
}

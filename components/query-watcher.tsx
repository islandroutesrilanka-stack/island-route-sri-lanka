"use client";

/**
 * Read the page's query string without making the page dynamic.
 *
 * Reading `searchParams` in a server component turns the route into `ƒ`
 * (Dynamic): it is re-rendered on every request, `export const revalidate`
 * stops meaning anything, and every visitor waits for a server round trip and
 * a database call before the first byte. That is what /tours and /book were
 * doing, and the whole point of the query string on those pages — a filter, a
 * preselected journey — is a browsing convenience, not something the document
 * itself needs to exist.
 *
 * The obvious fix, calling `useSearchParams()` in a client component, has a
 * trap. In a statically rendered route that hook triggers a client-side
 * rendering bailout: at build time React abandons the subtree, renders the
 * nearest Suspense fallback into the HTML, and re-renders the real thing in
 * the browser. Whatever is inside that boundary is therefore *absent from the
 * served HTML* — invisible to crawlers, and swapped out from under the visitor
 * a moment after the page paints.
 *
 * So the hook is quarantined. `Watch` calls it, renders nothing, and sits
 * alone inside `<Suspense fallback={null}>`. The bailout stops there: the
 * fallback for a component that renders nothing is nothing, so the served HTML
 * is complete and nothing is swapped. The query string is handed back out as
 * state, one render later.
 *
 * `params` is null on the server and on the first client render, which is what
 * makes hydration exact — both sides render the no-query view. Callers treat
 * null as "no parameters yet" and show the unparameterised page, which is the
 * right default anyway: it is what /tours and /book are for.
 *
 * Because this is a real subscription rather than a one-shot read of
 * `window.location`, it also stays correct across in-page navigation — the
 * season pills, the island map, the region index and "Clear filters" all
 * soft-navigate within /tours, and each one updates the view here.
 */

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

function Watch({ onChange }: { onChange: (q: string) => void }) {
  const q = useSearchParams().toString();
  useEffect(() => {
    onChange(q);
  }, [q, onChange]);
  return null;
}

export function useQueryParams(): {
  /** null until the first effect has run — see the note above. */
  params: URLSearchParams | null;
  /** Must be rendered somewhere in the caller's output for `params` to fill. */
  watcher: ReactNode;
} {
  const [q, setQ] = useState<string | null>(null);
  return {
    params: q === null ? null : new URLSearchParams(q),
    watcher: (
      <Suspense fallback={null}>
        <Watch onChange={setQ} />
      </Suspense>
    ),
  };
}

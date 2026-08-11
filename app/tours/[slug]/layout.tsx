import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/data";

export const revalidate = 60;

/**
 * Existence gate — fails the route before the page does any work, and produces
 * a true 404 rather than a soft one.
 *
 * ── Why the route group next door matters ──────────────────────────────────
 * A `loading.tsx` opens a Suspense boundary over its segment AND everything
 * nested beneath it. Once that boundary starts streaming the response is
 * committed as 200, and nothing thrown afterwards — `notFound()` included —
 * can change the status. ISR then records the wrong status and replays it to
 * every later visitor and crawler.
 *
 * That is why `/tours` and its skeleton live in `app/tours/(index)/`: the
 * route group means the skeleton wraps only the index page, not this `[slug]`
 * sibling. Do not add a `loading.tsx` to `app/tours/` or to this folder — it
 * would silently turn every 404 here back into a 200. Verified both ways:
 * with a boundary above, `.next/server/app/tours/not-real.meta` recorded
 * `"status":200`; without one it records `"status":404`.
 *
 * Putting `notFound()` in `generateMetadata` was tried and does not work —
 * metadata resolves inside the same streaming pass.
 *
 * The check itself is free: `getTourBySlug` is wrapped in React.cache, so the
 * layout and the page share one query per render. The `notFound()` inside
 * page.tsx stays as a backstop.
 */
export default async function TourSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  if (!(await getTourBySlug(params.slug))) notFound();
  return <>{children}</>;
}

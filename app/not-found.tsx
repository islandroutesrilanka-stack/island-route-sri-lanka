import type { Metadata } from "next";
import Link from "next/link";

/*
 * `noindex` is belt-and-braces, not the fix.
 *
 * The fix is the HTTP status: these responses now return a real 404 (see the
 * note in app/tours/[slug]/layout.tsx for the route-group arrangement that
 * makes that possible). This tag is the second line of defence — if a Suspense
 * boundary is ever reintroduced above a dynamic segment and the status silently
 * reverts to 200, `noindex` still keeps the error page out of the index.
 *
 * `follow: true` is deliberate: the page links back into the site, and there is
 * no reason to strand a crawler that lands here.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-sand pt-24">
      <div className="mx-auto max-w-wrap px-5 md:px-8 text-center">
        <p className="eyebrow text-copper-deep">Off the map</p>
        <h1 className="h-display mt-4 text-6xl md:text-8xl text-ink">
          Lost in paradise
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ink/70">
          This page has wandered off the route. Let&apos;s get you back on the
          road.
        </p>
        <Link
          href="/"
          className="mt-9 inline-block bg-ink text-sand px-8 py-4 text-[13px] uppercase tracking-[0.16em] hover:bg-copper-deep transition-colors"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

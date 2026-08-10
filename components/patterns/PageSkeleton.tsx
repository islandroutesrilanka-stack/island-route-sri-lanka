/**
 * Loading skeleton shared by the route-level loading.tsx files.
 *
 * One component rather than several near-identical files, so the placeholder
 * rhythm can't drift from the real pages. Built only from existing tokens —
 * `img-frame` already supplies the warm placeholder gradient used elsewhere.
 *
 * Purely decorative: aria-hidden, with a single polite status message for
 * screen readers instead of a grid of meaningless boxes.
 */
export default function PageSkeleton({
  cards = 6,
  label = "Loading",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {label}
      </p>

      <div aria-hidden>
        {/* Header band, matching PageHeader's dark ground and rhythm */}
        <section className="bg-deep pb-16 pt-32 md:pb-24 md:pt-44">
          <div className="mx-auto max-w-wrap px-5 md:px-8">
            <div className="h-3 w-32 animate-pulse bg-sand/15" />
            <div className="mt-5 h-12 w-3/4 max-w-2xl animate-pulse bg-sand/15 md:h-16" />
            <div className="mt-6 h-4 w-full max-w-xl animate-pulse bg-sand/10" />
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-wrap grid-cols-2 gap-4 px-5 md:grid-cols-3 md:gap-6 md:px-8">
            {Array.from({ length: cards }).map((_, i) => (
              <div key={i} className="img-frame aspect-[3/4] animate-pulse" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A disclosure for the second half of a paragraph.
 *
 * The problem it solves: the index pages were carrying detail-page prose. Every
 * seasonal panel, every region card, every catalogue intro opened with a good
 * first sentence and then kept going for two more — so a phone screen that
 * should have been photography and a call to action was four inches of body
 * copy instead. The writing is not the problem. Its position is.
 *
 * So nothing is deleted. The first sentence stays in the flow; the rest goes
 * behind this. Native <details> is doing the work, which matters for three
 * reasons beyond the obvious one:
 *
 *   • The hidden text is in the served HTML. Not fetched on expand, not moved
 *     to a detail page — present, indexed, and found by the browser's own
 *     find-in-page (Chrome and Safari open a closed <details> to reveal a hit).
 *     Progressive disclosure that costs SEO is not worth doing; this doesn't.
 *
 *   • It costs no JavaScript, works before hydration, and survives the site's
 *     static-rendering constraint without a client boundary. These pages are
 *     ○ (Static) and this component does not change that.
 *
 *   • Keyboard operation, focus, and the expanded/collapsed announcement come
 *     from the element. A div with an onClick would look identical and be
 *     wrong in every way that doesn't show up in a screenshot.
 *
 * The open animation is in globals.css under `.disclose`, behind an @supports
 * gate — where the browser can't interpolate to `auto`, the panel just appears.
 */
export default function ReadMore({
  children,
  label = "Read more",
  tone = "light",
  className = "",
}: {
  /** The remainder. Rendered inside the disclosure, always in the DOM. */
  children: ReactNode;
  /** Summary text. Name the reward where you can — "The detail", "Why". */
  label?: string;
  /** `dark` for the deep-ground sections. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const t =
    tone === "dark"
      ? { summary: "text-sand/70 hover:text-sand", body: "text-sand/70" }
      : { summary: "text-ink/70 hover:text-ink", body: "text-ink/65" };

  return (
    <details className={`disclose ${className}`}>
      <summary
        className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors ${t.summary}`}
      >
        {label}
        <ChevronDown size={13} aria-hidden className="disclose-caret" />
      </summary>
      <div className={`pt-3 text-[15px] leading-relaxed ${t.body}`}>
        {children}
      </div>
    </details>
  );
}

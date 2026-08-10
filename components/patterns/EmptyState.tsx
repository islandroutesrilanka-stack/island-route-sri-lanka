/**
 * Empty state.
 *
 * One component rather than seven near-identical blocks, so the wording and
 * spacing can't drift between pages. Uses the existing type scale and hairline
 * language — no new visual vocabulary.
 *
 * Renders as a designed state, not an apology: a heading, a short line, and a
 * way onward. An empty grid with nothing in it reads as a bug.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export default function EmptyState({
  eyebrow,
  title,
  body,
  action,
  dark = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: { label: string; href: string };
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`border-y py-16 text-center md:py-20 ${
        dark ? "border-sand/15" : "border-ink/10"
      }`}
    >
      {eyebrow && (
        <p className={`eyebrow ${dark ? "text-copper-light" : "text-copper-deep"}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`h-display mx-auto mt-3 max-w-xl text-3xl md:text-4xl ${
          dark ? "text-sand" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`mx-auto mt-4 max-w-md text-[15px] leading-relaxed ${
            dark ? "text-sand/70" : "text-ink/70"
          }`}
        >
          {body}
        </p>
      )}
      {children}
      {action && (
        <Link
          href={action.href}
          className={`mt-8 inline-block px-8 py-4 text-[13px] uppercase tracking-[0.16em] transition-colors ${
            dark
              ? "bg-copper-deep text-sand hover:bg-copper-light hover:text-deep"
              : "bg-ink text-sand hover:bg-copper-deep"
          }`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

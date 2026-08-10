"use client";

/**
 * Global error boundary — the last line of defence.
 *
 * `app/error.tsx` cannot catch a failure in the root layout itself, because the
 * layout is what renders it. This one replaces the whole document, so it must
 * supply its own <html> and <body>: the tree it is recovering from never
 * rendered, which also means no Navbar, no Footer, and no fonts or providers
 * from the layout.
 *
 * Consequences worth knowing rather than working around:
 *  - Styling is inline, not Tailwind. Global CSS is imported by the root layout
 *    that just failed, so utility classes cannot be relied on here. The colours
 *    below are the same brand hex values used in tailwind.config.ts.
 *  - Only `digest` is shown. Next replaces server error messages with a generic
 *    string plus this opaque hash in production, so nothing internal leaks.
 */

import { useEffect } from "react";

const DEEP = "#0B1F19";
const SAND = "#F6F1E6";
const COPPER_DEEP = "#8A4E28";
const COPPER_LIGHT = "#D08A55";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error.digest ?? "", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          backgroundColor: DEEP,
          color: SAND,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <main style={{ maxWidth: "44rem", padding: "4rem 1.5rem", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: COPPER_LIGHT,
              margin: 0,
            }}
          >
            Something went wrong
          </p>

          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1.05,
              fontWeight: 300,
              margin: "1.25rem 0 0",
            }}
          >
            The site didn&apos;t load
          </h1>

          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "rgba(246,241,230,0.72)",
              maxWidth: "34rem",
              margin: "1.5rem 0 0",
            }}
          >
            A fault on our side, not yours. Try again — and if it keeps
            happening, please get in touch and we&apos;ll help you directly.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              margin: "2.25rem 0 0",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.8125rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: SAND,
                backgroundColor: COPPER_DEEP,
                border: "none",
                padding: "1rem 2rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.8125rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: SAND,
                border: "1px solid rgba(246,241,230,0.3)",
                padding: "1rem 2rem",
                textDecoration: "none",
              }}
            >
              Back to the homepage
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(246,241,230,0.35)",
                margin: "2.5rem 0 0",
              }}
            >
              Reference {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}

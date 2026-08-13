"use client";

/**
 * Root error boundary.
 *
 * Next requires this to be a Client Component — it receives a reset() callback.
 * Without it, any thrown error in any route falls through to Next's unstyled
 * default screen, which on a production build shows a bare "Application error"
 * with no branding and no way back.
 *
 * Uses only existing design tokens and utilities. No new visual language.
 */

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { site, waLink } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it for whatever collects logs. The digest is the only handle on
    // a production error, so it's worth keeping next to the message.
    console.error("[route error]", error.digest ?? "", error);
  }, [error]);

  return (
    <section className="grain relative flex min-h-[70svh] items-center overflow-hidden bg-deep">
      <div className="relative z-10 mx-auto w-full max-w-wrap px-5 py-24 md:px-8">
        <p className="eyebrow text-copper-light">Something went wrong</p>
        <h1 className="h-display mt-4 max-w-2xl text-4xl text-sand md:text-6xl">
          That didn&apos;t load as it should
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-sand/70">
          A temporary fault on our side, not yours. Try again — and if it keeps
          happening, message us and we&apos;ll sort it out directly.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2.5 bg-copper-deep px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-copper-light hover:text-deep"
          >
            <RotateCcw size={16} /> Try again
          </button>
          <Link
            href="/"
            className="border border-sand/30 px-8 py-4 text-center text-[13px] uppercase tracking-[0.16em] text-sand transition-colors hover:bg-sand hover:text-deep"
          >
            Back to the homepage
          </Link>
        </div>

        <p className="mt-10 border-t border-sand/15 pt-6 text-[13px] text-sand/60">
          Need us now?{" "}
          <a
            href={waLink("Hello Island Route! I hit an error on your website.")}
            target="_blank"
            rel="noopener noreferrer"
            className="link-line text-sand/85"
          >
            WhatsApp {site.whatsappDisplay}
          </a>
        </p>

        {error.digest && (
          <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-sand/55">
            Reference {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}

"use client";

import { useId, useRef, useState } from "react";
import { AlertTriangle, ImageUp, Loader2, RotateCcw, X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * One editable picture: preview, upload, paste-a-URL, clear.
 *
 * ── Why an uploader and not just the text box ──────────────────────────────
 *
 * Every image in this admin was a plain text input holding a URL, with a
 * thumbnail underneath if the URL happened to resolve. That is a developer's
 * control: it assumes you already have the file hosted somewhere, know its
 * address, and can paste it. The client has a photograph on a phone. Between
 * those two facts sat a deploy, or an email to the developer, which is exactly
 * the dependency this field removes.
 *
 * ── Where the file goes ────────────────────────────────────────────────────
 *
 * Straight to the `media` bucket in this project's own Supabase Storage — the
 * one the hero video and poster already live in, public-read, so no signing,
 * no proxy route and no new infrastructure. `next.config.mjs` already allows
 * `*.supabase.co` under `images.remotePatterns`, so the URL that comes back is
 * immediately usable by next/image; nothing else has to be told about it.
 *
 * Uploads are `upsert: false` under a timestamped name, so a re-upload never
 * overwrites a file another record still points at, and `cacheControl` is a
 * year because the name is unique — the URL for a given file never needs to be
 * re-fetched, and a changed picture is a different URL.
 *
 * ── What it does not do ────────────────────────────────────────────────────
 *
 * It does not resize, re-encode or strip EXIF. next/image handles delivery —
 * it re-encodes to AVIF/WebP at the size each breakpoint asks for — so the
 * useful thing to upload is the largest good original, and shrinking it here
 * would only throw away the detail the desktop breakpoint wants. The size
 * ceiling below is a guard against a 40MB phone burst, not a quality policy.
 */

/** Refuse politely rather than let a huge file sit uploading for two minutes. */
const MAX_BYTES = 12 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export default function ImageField({
  value,
  onChange,
  /** Shown when the field is empty — the picture the site uses by default. */
  fallbackSrc,
  /** Folder inside the bucket, so uploads stay sorted by what they are for. */
  folder = "uploads",
  hint,
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  fallbackSrc?: string;
  folder?: string;
  hint?: string;
  compact?: boolean;
}) {
  const sb = getBrowserSupabase();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = value.trim() || fallbackSrc || "";
  const isOverride = Boolean(value.trim());

  const upload = async (file: File) => {
    setError(null);
    if (!sb) {
      setError("Not signed in to Supabase — reload the admin and try again.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please keep uploads under 12MB.`,
      );
      return;
    }
    setBusy(true);
    /* Sanitised, timestamped, and the original extension preserved: Storage
       keys are URL path segments, so spaces and accents in a phone's filename
       would come back percent-encoded and be a nuisance to read in the bucket
       listing forever. */
    const dot = file.name.lastIndexOf(".");
    const ext = (dot > -1 ? file.name.slice(dot + 1) : "jpg").toLowerCase();
    const stem = (dot > -1 ? file.name.slice(0, dot) : file.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    const path = `${folder}/${Date.now()}-${stem || "image"}.${ext}`;

    const { error: upErr } = await sb.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }
    const { data } = sb.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-4">
        <div
          className={`relative shrink-0 overflow-hidden border border-ink/10 bg-dune ${
            compact ? "h-20 w-28" : "h-28 w-44"
          }`}
        >
          {shown ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={shown}
              alt=""
              className="h-full w-full object-cover"
              /* A broken URL is the single most likely thing to be wrong in
                 this field, and a silently blank box tells the admin nothing.
                 Failing loudly here is the whole point of a preview. */
              onError={() => setError("That URL did not load as an image.")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.14em] text-ink/35">
              No image
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sand">
              <Loader2 size={18} className="animate-spin" />
            </span>
          )}
          {!isOverride && shown && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1.5 py-0.5 text-center text-[10px] uppercase tracking-[0.12em] text-sand">
              Default
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 border border-ink/15 bg-white px-3 py-2 text-[12px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-copper hover:text-copper-deep"
            >
              <ImageUp size={14} />
              {busy ? "Uploading…" : "Upload"}
            </label>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
              }}
            />
            {isOverride && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  onChange("");
                }}
                className="inline-flex items-center gap-2 border border-ink/15 bg-white px-3 py-2 text-[12px] uppercase tracking-[0.12em] text-ink/55 transition-colors hover:border-red-300 hover:text-red-700"
              >
                {fallbackSrc ? <RotateCcw size={14} /> : <X size={14} />}
                {fallbackSrc ? "Use default" : "Clear"}
              </button>
            )}
          </div>

          <input
            type="text"
            value={value}
            placeholder={
              fallbackSrc
                ? "Using the built-in image"
                : "…or paste an image URL"
            }
            onChange={(e) => {
              setError(null);
              onChange(e.target.value);
            }}
            className="w-full border border-ink/15 bg-white px-3 py-2 text-[12px] text-ink/70 focus:border-copper focus:outline-none"
          />
          {hint && <p className="text-[11px] text-ink/40">{hint}</p>}
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

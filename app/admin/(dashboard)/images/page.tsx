"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { IMAGE_KEY_PREFIX, imageSlotGroups } from "@/lib/media/slots";

/**
 * Admin → Images.
 *
 * The pictures that belong to the layout rather than to a record. A tour's
 * photograph is edited on the tour; the photograph behind the word "Journeys"
 * belongs to no row at all, and until this page existed the only way to change
 * it was to edit a TypeScript file and deploy.
 *
 * ── Why it writes to site_settings ─────────────────────────────────────────
 *
 * Because the table is already there, already writable by an authenticated
 * admin under an existing RLS policy, and already read once per render by
 * `getSettings`. A dedicated `page_images` table would have needed a
 * migration, a policy, and a second round trip on every page view to buy
 * exactly nothing: this is thirty key/value pairs. The `img-` prefix keeps
 * them out of the way of the typed settings, and `getSettings` sorts them into
 * `settings.images` as it reads.
 *
 * ── Blank means default, and that is a feature ─────────────────────────────
 *
 * Every field starts empty and shows the built-in photograph marked "Default".
 * "Use default" empties it again. So the client can experiment without ever
 * being able to leave the site with a hole in it — the worst case is the site
 * they already have.
 */
export default function AdminImagesPage() {
  const sb = getBrowserSupabase();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSlots = useMemo(() => imageSlotGroups.flatMap((g) => g.slots), []);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const { data } = await sb.from("site_settings").select("*");
      const v: Record<string, string> = {};
      data?.forEach((r: { key: string; value: string | null }) => {
        if (r.key.startsWith(IMAGE_KEY_PREFIX)) {
          v[r.key.slice(IMAGE_KEY_PREFIX.length)] = r.value ?? "";
        }
      });
      setValues(v);
      setLoading(false);
    })();
  }, [sb]);

  if (!sb)
    return (
      <div className="border border-copper/40 bg-copper/5 p-6 text-sm text-ink/70">
        Supabase isn&apos;t configured yet — see SETUP.md.
      </div>
    );

  const save = async () => {
    setSaving(true);
    setError(null);
    /* Every slot is written, including the empty ones. An emptied row has to
       reach the database or "Use default" would only ever work until the next
       reload — the stale override would still be sitting there. */
    const { error: err } = await sb.from("site_settings").upsert(
      allSlots.map((s) => ({
        key: IMAGE_KEY_PREFIX + s.key,
        value: (values[s.key] ?? "").trim(),
      })),
    );
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    /* Fire-and-forget, and after the write: pages revalidate within a minute
       anyway, so a failed purge is slow, not wrong. */
    void fetch("/api/revalidate", { method: "POST" }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const changed = allSlots.filter((s) => (values[s.key] ?? "").trim()).length;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Images</h1>
      <p className="mt-1 text-sm text-ink/55">
        The photography built into the layout — page headers, the region tiles
        on Journeys, the experience cards and the closing band. Upload a picture
        or paste a URL. Leave a slot empty to keep the built-in image.
      </p>
      <p className="mt-1 text-sm text-ink/40">
        {changed} of {allSlots.length} slots customised. Changes appear on the
        live site within a minute.
      </p>

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink/50">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </p>
      ) : (
        <>
          {imageSlotGroups.map((g) => (
            <div
              key={g.group}
              className="mt-8 border border-ink/10 bg-white/70 p-6 md:p-8"
            >
              <h2 className="font-display text-2xl text-ink">{g.group}</h2>
              <div className="mt-6 space-y-7">
                {g.slots.map((slot) => (
                  <div key={slot.key}>
                    <label className="eyebrow mb-1.5 block text-ink/50">
                      {slot.label}
                    </label>
                    <ImageField
                      value={values[slot.key] ?? ""}
                      onChange={(v) =>
                        setValues((s) => ({ ...s, [slot.key]: v }))
                      }
                      fallbackSrc={slot.fallback.src}
                      folder={`slots/${slot.key}`}
                      hint={`${slot.help} ${slot.ratio}.`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-sand/95 py-4 backdrop-blur">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-sand transition-colors hover:bg-copper disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save images
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-moss">
                <Check size={15} /> Saved — live within a minute
              </span>
            )}
            {error && <span className="text-sm text-red-700">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Check } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const groups: { title: string; note?: string; keys: { key: string; label: string; long?: boolean; help?: string }[] }[] = [
  {
    title: "Contact details",
    note: "Used across the site header, footer and contact page.",
    keys: [
      { key: "site_name", label: "Business name" },
      { key: "phone_display", label: "Phone (display)", help: "e.g. +94 77 106 6677" },
      { key: "phone_e164", label: "Phone (dialing format)", help: "e.g. +94771066677" },
      {
        key: "whatsapp_number",
        label: "WhatsApp number (digits only)",
        help: "No + and no spaces — this is pasted straight into a wa.me link. e.g. 94771066677",
      },
      { key: "email", label: "Email" },
      { key: "address", label: "Address / base" },
    ],
  },
  {
    title: "SEO",
    note: "Search-engine defaults for the whole site. Individual tours, destinations and posts generate their own titles automatically.",
    keys: [
      { key: "seo_title", label: "Site title (browser tab & Google)" },
      { key: "seo_description", label: "Meta description", long: true },
      { key: "seo_keywords", label: "Keywords (comma-separated)", long: true },
      { key: "tagline", label: "Brand tagline" },
    ],
  },
  {
    title: "Homepage hero",
    note: "The first thing visitors see. Leave any field blank to fall back to the approved default — the hero can never render empty.",
    keys: [
      { key: "hero_headline", label: "Headline", help: "Approved: “Sri Lanka, Unscripted.”" },
      { key: "hero_subcopy", label: "Supporting line", long: true },
      { key: "hero_cta_primary_label", label: "Primary button text" },
      { key: "hero_cta_primary_href", label: "Primary button link", help: "e.g. /book" },
      { key: "hero_cta_secondary_label", label: "Secondary button text" },
      { key: "hero_cta_secondary_href", label: "Secondary button link", help: "#explore scrolls to the map section" },
      {
        key: "hero_poster_url",
        label: "Hero image URL",
        help: "Leave blank until an image is verified — the hero shows an elegant gradient instead. Never use an image whose location you haven't confirmed.",
      },
      { key: "hero_poster_alt", label: "Hero image description (alt text)", long: true },
      {
        key: "hero_video_url",
        label: "Hero video URL — desktop",
        help: "The hero loops your Sri Lanka film from Supabase storage. Paste a different URL to replace it, or type `none` to switch the video off and show the hero image instead.",
      },
      {
        key: "hero_video_mobile_url",
        label: "Hero video URL — mobile",
        help: "Blank sends phones the same file as desktop — currently 21.6 MB, which is a lot on mobile data. Paste a smaller, narrower encode here and phones will use that instead, or `none` to switch video off on phones only.",
      },
      {
        key: "hero_slideshow_enabled",
        label: "Hero slideshow",
        help: "true or false. When false the hero shows only the first slide (or the hero image above). A single slide behaves the same way — nothing animates.",
      },
      {
        key: "hero_slide_duration",
        label: "Seconds per slide",
        help: "6–8 is comfortable. Values outside 3–20 are clamped.",
      },
      {
        key: "hero_slides",
        label: "Hero slides — one per line",
        long: true,
        help:
          "Format: /photography/file.jpg | optional alt text | optional focal point such as 50% 40%. " +
          "Order here is the order on the page; delete a line to remove that slide. " +
          "Leave alt blank to inherit the verified description already recorded for that image. " +
          "Only use photographs whose location you have confirmed — a path typed here does not make an image verified.",
      },
    ],
  },
  {
    title: "Featured journey (homepage)",
    note: "One hand-picked journey, shown as an editorial feature. Nothing rotates automatically.",
    keys: [
      {
        key: "featured_journey_slug",
        label: "Tour URL slug",
        help: "e.g. essential-sri-lanka-7-days. Blank uses the first featured tour.",
      },
      { key: "featured_journey_note", label: "Route note", long: true, help: "One line about the route. Optional." },
      { key: "featured_journey_image_1", label: "Supporting image 1 URL" },
      { key: "featured_journey_image_2", label: "Supporting image 2 URL" },
      { key: "featured_journey_image_3", label: "Supporting image 3 URL" },
    ],
  },
  {
    title: "Featured chauffeur-guide (homepage)",
    note: "Your strongest differentiator — a real person, hand-picked. Leave every field blank and the section simply shows the Why Island Route content. Never invent a guide.",
    keys: [
      { key: "featured_guide_name", label: "Guide name" },
      { key: "featured_guide_role", label: "Role / years driving", help: "e.g. Chauffeur-guide · Hill Country" },
      { key: "featured_guide_note", label: "In their own words", long: true, help: "Two sentences, in the guide's voice." },
      { key: "featured_guide_image", label: "Portrait URL" },
    ],
  },
];

const allKeys = groups.flatMap((g) => g.keys.map((k) => k.key));

export default function SettingsPage() {
  const sb = getBrowserSupabase();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const { data } = await sb.from("site_settings").select("*");
      const v: Record<string, string> = {};
      data?.forEach((r: { key: string; value: string | null }) => {
        v[r.key] = r.value ?? "";
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
    const { error } = await sb
      .from("site_settings")
      .upsert(allKeys.map((key) => ({ key, value: values[key] ?? "" })));

    /*
      Public pages revalidate every 60s, which is too slow to feel like the
      change took. Ask the server to purge now.

      Deliberately fire-and-forget, and deliberately after the write: the save
      is what the editor cares about, and a failed cache purge only means the
      change appears within the normal minute. Reporting a successful save as
      failed because a purge 404'd would be a worse lie than a slightly stale
      page. Authorisation happens server-side in /api/revalidate.
    */
    if (!error) {
      void fetch("/api/revalidate", { method: "POST" }).catch(() => {});
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Site & SEO</h1>
      <p className="mt-1 text-sm text-ink/55">
        Contact details and search-engine content. Changes appear on the live
        site within a minute.
      </p>

      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink/50">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </p>
      ) : (
        <>
          {groups.map((g) => (
            <div key={g.title} className="mt-8 border border-ink/10 bg-white/70 p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">{g.title}</h2>
              {g.note && <p className="mt-1 text-sm text-ink/50">{g.note}</p>}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {g.keys.map((k) => (
                  <div key={k.key} className={k.long ? "sm:col-span-2" : ""}>
                    <label className="eyebrow text-ink/50 block mb-1.5">{k.label}</label>
                    {k.long ? (
                      <textarea
                        rows={3}
                        className="w-full border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-copper"
                        value={values[k.key] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [k.key]: e.target.value }))
                        }
                      />
                    ) : (
                      <input
                        className="w-full border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-copper"
                        value={values[k.key] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [k.key]: e.target.value }))
                        }
                      />
                    )}
                    {k.help && <p className="mt-1 text-xs text-ink/40">{k.help}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-sand hover:bg-copper transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save settings
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-moss">
                <Check size={15} /> Saved — live within a minute
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

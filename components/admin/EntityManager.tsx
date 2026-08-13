"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { EntityConfig, FieldDef } from "@/lib/admin-entities";

type Row = Record<string, any>;

const inputCls =
  "w-full border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-copper transition-colors";

function toFormValue(field: FieldDef, v: any): string | boolean {
  if (field.type === "checkbox") return Boolean(v);
  if (field.type === "lines") return Array.isArray(v) ? v.join("\n") : "";
  if (field.type === "json") return v == null ? "" : JSON.stringify(v, null, 2);
  return v == null ? "" : String(v);
}

function fromFormValue(field: FieldDef, v: string | boolean): any {
  if (field.type === "checkbox") return Boolean(v);
  const s = String(v).trim();
  if (field.type === "number") return s === "" ? null : Number(s);
  if (field.type === "lines")
    return s === ""
      ? []
      : s
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
  if (field.type === "json") {
    if (s === "") return null;
    return JSON.parse(s); // caller catches
  }
  return s === "" ? null : s;
}

export default function EntityManager({ config }: { config: EntityConfig }) {
  const sb = getBrowserSupabase();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sb) return;
    setLoading(true);
    const { data, error } = await sb
      .from(config.table)
      .select("*")
      .order(config.orderBy, { ascending: true });
    if (!error && data) setRows(data);
    setLoading(false);
  }, [sb, config.table, config.orderBy]);

  useEffect(() => {
    load();
  }, [load]);

  if (!sb)
    return (
      <div className="border border-copper/40 bg-copper/5 p-6 text-sm text-ink/70">
        Supabase isn&apos;t configured yet — add your project keys to
        <code className="mx-1 bg-ink/5 px-1.5 py-0.5">.env.local</code> (see
        SETUP.md).
      </div>
    );

  const openEdit = (row: Row | "new") => {
    setError(null);
    const values: Record<string, string | boolean> = {};
    for (const f of config.fields)
      values[f.key] = toFormValue(f, row === "new" ? null : row[f.key]);
    setForm(values);
    setEditing(row);
  };

  const save = async () => {
    setError(null);
    const payload: Row = {};
    try {
      for (const f of config.fields) {
        const val = fromFormValue(f, form[f.key]);
        if (f.required && (val === null || val === ""))
          throw new Error(`"${f.label}" is required`);
        payload[f.key] = val;
      }
    } catch (e: any) {
      setError(
        e.message?.startsWith('"') ? e.message : `Invalid JSON: ${e.message}`,
      );
      return;
    }
    setSaving(true);
    const res =
      editing === "new"
        ? await sb.from(config.table).insert(payload)
        : await sb
            .from(config.table)
            .update(payload)
            .eq("id", (editing as Row).id);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setEditing(null);
    load();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete this ${config.singular}? This cannot be undone.`))
      return;
    await sb.from(config.table).delete().eq("id", row.id);
    load();
  };

  const togglePublished = async (row: Row) => {
    await sb
      .from(config.table)
      .update({ published: !row.published })
      .eq("id", row.id);
    load();
  };

  return (
    /* framer-motion no longer loads from the root layout, so the reduced-motion
       contract travels with the surfaces that use it. */
    <MotionConfig reducedMotion="user">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-ink">{config.title}</h1>
            <p className="mt-1 text-sm text-ink/55">{config.description}</p>
          </div>
          <button
            onClick={() => openEdit("new")}
            className="inline-flex items-center gap-2 bg-ink text-sand px-5 py-3 text-[12px] uppercase tracking-[0.14em] hover:bg-copper transition-colors"
          >
            <Plus size={15} /> Add {config.singular}
          </button>
        </div>

        <div className="mt-8 border border-ink/10 bg-white/70 divide-y divide-ink/5">
          {loading ? (
            <p className="p-6 text-sm text-ink/50 flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Loading…
            </p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-ink/50">
              Nothing here yet. The public site shows the built-in starter
              content until you add rows (or run supabase/seed.sql to import
              it).
            </p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-sand/60 transition-colors"
              >
                {(row.image || row.src) && (
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden bg-dune">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image || row.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ink">
                    {row[config.labelKey] || "(untitled)"}
                  </p>
                  {config.subKey && row[config.subKey] && (
                    <p className="truncate text-xs text-ink/45">
                      {String(row[config.subKey])}
                    </p>
                  )}
                </div>
                {config.hasPublished && (
                  <button
                    onClick={() => togglePublished(row)}
                    title={
                      row.published
                        ? "Published — click to hide"
                        : "Hidden — click to publish"
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] border ${
                      row.published
                        ? "border-moss/30 text-moss"
                        : "border-ink/20 text-ink/40"
                    }`}
                  >
                    {row.published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {row.published ? "Live" : "Hidden"}
                  </button>
                )}
                <button
                  onClick={() => openEdit(row)}
                  className="p-2 text-ink/50 hover:text-copper"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(row)}
                  className="p-2 text-ink/50 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Edit drawer */}
        <AnimatePresence>
          {editing !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-deep/50 backdrop-blur-sm"
              onClick={() => setEditing(null)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-sand shadow-2xl"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-sand px-6 py-4">
                  <h2 className="font-display text-2xl text-ink">
                    {editing === "new"
                      ? `New ${config.singular}`
                      : `Edit ${config.singular}`}
                  </h2>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 text-ink/50 hover:text-ink"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5 px-6 py-6">
                  {config.fields.map((f) => (
                    <div key={f.key}>
                      <label className="eyebrow text-ink/50 block mb-1.5">
                        {f.label}
                        {f.required && <span className="text-copper"> *</span>}
                      </label>
                      {f.type === "textarea" || f.type === "lines" ? (
                        <textarea
                          rows={f.type === "lines" ? 5 : 4}
                          className={inputCls}
                          value={String(form[f.key] ?? "")}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                        />
                      ) : f.type === "json" ? (
                        <textarea
                          rows={8}
                          className={`${inputCls} font-mono text-[12px]`}
                          value={String(form[f.key] ?? "")}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                        />
                      ) : f.type === "checkbox" ? (
                        <label className="flex items-center gap-2.5 text-sm text-ink/70">
                          <input
                            type="checkbox"
                            checked={Boolean(form[f.key])}
                            onChange={(e) =>
                              setForm((s) => ({
                                ...s,
                                [f.key]: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-[#B26A3B]"
                          />
                          Yes
                        </label>
                      ) : f.type === "select" ? (
                        <select
                          className={inputCls}
                          value={String(form[f.key] ?? "")}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                        >
                          <option value="">—</option>
                          {f.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={
                            f.type === "number"
                              ? "number"
                              : f.type === "date"
                                ? "date"
                                : "text"
                          }
                          className={inputCls}
                          value={String(form[f.key] ?? "")}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                        />
                      )}
                      {f.type === "image" && form[f.key] && (
                        <div className="relative mt-2 h-28 w-44 overflow-hidden border border-ink/10 bg-dune">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={String(form[f.key])}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      {f.help && (
                        <p className="mt-1 text-xs text-ink/40">{f.help}</p>
                      )}
                    </div>
                  ))}

                  {error && (
                    <p className="flex items-start gap-2 border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />{" "}
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pb-10 pt-2">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-ink text-sand px-6 py-3 text-[12px] uppercase tracking-[0.14em] hover:bg-copper transition-colors disabled:opacity-60"
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="border border-ink/20 px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

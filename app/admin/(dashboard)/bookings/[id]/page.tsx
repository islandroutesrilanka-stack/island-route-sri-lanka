"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Loader2, Save, MessageCircle, Mail, AlertTriangle, Check,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  BOOKING_STATUSES, statusStyles, fmtDate, type BookingRow,
} from "@/lib/booking-ui";

type Option = { id: string; name: string };

const inputCls =
  "w-full border border-ink/15 bg-white px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-copper transition-colors";

export default function BookingDetail() {
  const sb = getBrowserSupabase();
  const { id } = useParams<{ id: string }>();
  const [b, setB] = useState<BookingRow | null>(null);
  const [vehicles, setVehicles] = useState<Option[]>([]);
  const [drivers, setDrivers] = useState<Option[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!sb) return;
    const [bk, vs, ds] = await Promise.all([
      sb.from("bookings").select("*").eq("id", id).single(),
      sb.from("vehicles").select("id,name").order("sort"),
      sb.from("drivers").select("id,name").eq("active", true).order("name"),
    ]);
    setB(bk.data as BookingRow);
    setVehicles((vs.data as Option[]) ?? []);
    setDrivers((ds.data as Option[]) ?? []);
  }, [sb, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Conflict detection: other confirmed bookings or blocks overlapping this trip
  useEffect(() => {
    if (!sb || !b?.travel_date) {
      setConflicts([]);
      return;
    }
    (async () => {
      const start = b.travel_date!;
      const end = b.end_date || b.travel_date!;
      const found: string[] = [];

      for (const [kind, resId] of [
        ["vehicle", b.vehicle_id],
        ["driver", b.driver_id],
      ] as const) {
        if (!resId) continue;

        const col = kind === "vehicle" ? "vehicle_id" : "driver_id";
        const { data: overlapping } = await sb
          .from("bookings")
          .select("id,name,travel_date,end_date")
          .eq(col, resId)
          .eq("status", "confirmed")
          .neq("id", b.id)
          .lte("travel_date", end)
          .or(`end_date.gte.${start},and(end_date.is.null,travel_date.gte.${start})`);
        overlapping?.forEach((o: any) =>
          found.push(
            `${kind === "vehicle" ? "Vehicle" : "Driver"} already confirmed for ${o.name} (${fmtDate(o.travel_date)})`
          )
        );

        const { data: blocks } = await sb
          .from("availability_blocks")
          .select("reason,start_date,end_date")
          .eq("resource_type", kind)
          .eq("resource_id", resId)
          .lte("start_date", end)
          .gte("end_date", start);
        blocks?.forEach((bl: any) =>
          found.push(
            `${kind === "vehicle" ? "Vehicle" : "Driver"} blocked ${fmtDate(bl.start_date)}–${fmtDate(bl.end_date)}${bl.reason ? ` (${bl.reason})` : ""}`
          )
        );
      }
      setConflicts(found);
    })();
  }, [sb, b?.vehicle_id, b?.driver_id, b?.travel_date, b?.end_date, b?.id, b]);

  if (!sb) return null;
  if (!b)
    return (
      <p className="flex items-center gap-2 text-sm text-ink/50">
        <Loader2 size={15} className="animate-spin" /> Loading booking…
      </p>
    );

  const set = <K extends keyof BookingRow>(k: K, v: BookingRow[K]) => {
    setSaved(false);
    setB((prev) => (prev ? { ...prev, [k]: v } : prev));
  };

  const save = async () => {
    setSaving(true);
    await sb
      .from("bookings")
      .update({
        status: b.status,
        travel_date: b.travel_date,
        end_date: b.end_date,
        vehicle_id: b.vehicle_id,
        driver_id: b.driver_id,
        quote_amount: b.quote_amount,
        currency: b.currency,
        admin_notes: b.admin_notes,
      })
      .eq("id", b.id);
    setSaving(false);
    setSaved(true);
  };

  const waNumber = b.phone?.replace(/[^\d]/g, "");

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-ink/50 hover:text-copper"
      >
        <ArrowLeft size={14} /> All bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{b.name}</h1>
          <p className="mt-1 text-sm text-ink/55">
            {b.email}
            {b.phone && <> · {b.phone}</>} · received {fmtDate(b.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-wa px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-white hover:bg-wa-dark transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          <a
            href={`mailto:${b.email}?subject=${encodeURIComponent(`Your Sri Lanka trip — Island Route`)}`}
            className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] text-ink/70 hover:border-copper hover:text-copper"
          >
            <Mail size={14} /> Email
          </a>
        </div>
      </div>

      {/* Request summary */}
      <div className="mt-6 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Service", b.service ?? "—"],
          ["Tour", b.tour_title ?? "—"],
          ["Travellers", b.travellers ?? "—"],
          ["Requested date", fmtDate(b.travel_date)],
        ].map(([k, v]) => (
          <div key={k as string} className="bg-white/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">{k}</p>
            <p className="mt-1 text-[15px] text-ink">{v}</p>
          </div>
        ))}
      </div>
      {b.message && (
        <div className="mt-4 border border-ink/10 bg-white/70 p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">Guest message</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/80 whitespace-pre-wrap">
            {b.message}
          </p>
        </div>
      )}

      {/* Management */}
      <div className="mt-8 border border-ink/10 bg-white/70 p-6 md:p-8">
        <h2 className="font-display text-2xl text-ink">Manage</h2>

        <div className="mt-5 flex flex-wrap gap-2">
          {BOOKING_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => set("status", s)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                b.status === s
                  ? statusStyles[s] + " font-semibold"
                  : "border-ink/15 text-ink/45 hover:border-copper hover:text-copper"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">Trip start</label>
            <input
              type="date"
              className={inputCls}
              value={b.travel_date ?? ""}
              onChange={(e) => set("travel_date", e.target.value || null)}
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">Trip end</label>
            <input
              type="date"
              className={inputCls}
              value={b.end_date ?? ""}
              onChange={(e) => set("end_date", e.target.value || null)}
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">Quote (USD)</label>
            <input
              type="number"
              className={inputCls}
              value={b.quote_amount ?? ""}
              onChange={(e) =>
                set("quote_amount", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">Assign vehicle</label>
            <select
              className={inputCls}
              value={b.vehicle_id ?? ""}
              onChange={(e) => set("vehicle_id", e.target.value || null)}
            >
              <option value="">— none —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">Assign driver</label>
            <select
              className={inputCls}
              value={b.driver_id ?? ""}
              onChange={(e) => set("driver_id", e.target.value || null)}
            >
              <option value="">— none —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {conflicts.length > 0 && (
          <div className="mt-5 border border-amber-300 bg-amber-50 p-4">
            {conflicts.map((c) => (
              <p key={c} className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {c}
              </p>
            ))}
          </div>
        )}

        <div className="mt-5">
          <label className="eyebrow text-ink/50 block mb-1.5">Internal notes</label>
          <textarea
            rows={4}
            className={inputCls}
            value={b.admin_notes ?? ""}
            onChange={(e) => set("admin_notes", e.target.value)}
            placeholder="Hotel preferences, pickup details, special requests…"
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-sand hover:bg-copper transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-moss">
              <Check size={15} /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

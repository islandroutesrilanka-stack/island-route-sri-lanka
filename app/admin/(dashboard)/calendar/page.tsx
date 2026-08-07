"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fmtDate } from "@/lib/booking-ui";

type Resource = { id: string; name: string };
type Block = {
  id: string;
  resource_type: "vehicle" | "driver";
  resource_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};
type BookingSpan = {
  id: string;
  name: string;
  travel_date: string;
  end_date: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

const inputCls =
  "border border-ink/15 bg-white px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-copper";

export default function CalendarPage() {
  const sb = getBrowserSupabase();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [tab, setTab] = useState<"vehicle" | "driver">("vehicle");
  const [resources, setResources] = useState<Resource[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [bookings, setBookings] = useState<BookingSpan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resource_id: "", start_date: "", end_date: "", reason: "" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStart = iso(new Date(Date.UTC(year, month, 1)));
  const monthEnd = iso(new Date(Date.UTC(year, month, daysInMonth)));
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const load = useCallback(async () => {
    if (!sb) return;
    setLoading(true);
    const table = tab === "vehicle" ? "vehicles" : "drivers";
    const [res, bl, bk] = await Promise.all([
      tab === "vehicle"
        ? sb.from(table).select("id,name").order("sort")
        : sb.from(table).select("id,name").eq("active", true).order("name"),
      sb
        .from("availability_blocks")
        .select("*")
        .eq("resource_type", tab)
        .lte("start_date", monthEnd)
        .gte("end_date", monthStart),
      sb
        .from("bookings")
        .select("id,name,travel_date,end_date,vehicle_id,driver_id")
        .eq("status", "confirmed")
        .not("travel_date", "is", null)
        .lte("travel_date", monthEnd),
    ]);
    setResources((res.data as Resource[]) ?? []);
    setBlocks((bl.data as Block[]) ?? []);
    setBookings(
      ((bk.data as BookingSpan[]) ?? []).filter(
        (b) => (b.end_date ?? b.travel_date) >= monthStart
      )
    );
    setLoading(false);
  }, [sb, tab, monthStart, monthEnd]);

  useEffect(() => {
    load();
  }, [load]);

  /** day (1..n) -> occupancy info per resource */
  const occupancy = useMemo(() => {
    const map = new Map<string, Map<number, { kind: "booking" | "block"; label: string }>>();
    const mark = (
      resId: string,
      start: string,
      end: string,
      kind: "booking" | "block",
      label: string
    ) => {
      if (!map.has(resId)) map.set(resId, new Map());
      const days = map.get(resId)!;
      for (let d = 1; d <= daysInMonth; d++) {
        const cur = iso(new Date(Date.UTC(year, month, d)));
        if (cur >= start && cur <= end && !days.has(d)) days.set(d, { kind, label });
      }
    };
    for (const b of bookings) {
      const resId = tab === "vehicle" ? b.vehicle_id : b.driver_id;
      if (!resId) continue;
      mark(resId, b.travel_date, b.end_date ?? b.travel_date, "booking", `Booking: ${b.name}`);
    }
    for (const bl of blocks) {
      mark(bl.resource_id, bl.start_date, bl.end_date, "block", bl.reason ?? "Blocked");
    }
    return map;
  }, [bookings, blocks, tab, year, month, daysInMonth]);

  if (!sb)
    return (
      <div className="border border-copper/40 bg-copper/5 p-6 text-sm text-ink/70">
        Supabase isn&apos;t configured yet — see SETUP.md.
      </div>
    );

  const nav = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const addBlock = async () => {
    if (!form.resource_id || !form.start_date) return;
    await sb.from("availability_blocks").insert({
      resource_type: tab,
      resource_id: form.resource_id,
      start_date: form.start_date,
      end_date: form.end_date || form.start_date,
      reason: form.reason || null,
    });
    setForm({ resource_id: "", start_date: "", end_date: "", reason: "" });
    setShowForm(false);
    load();
  };

  const removeBlock = async (id: string) => {
    await sb.from("availability_blocks").delete().eq("id", id);
    load();
  };

  const today =
    now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Availability</h1>
          <p className="mt-1 text-sm text-ink/55">
            Confirmed bookings and manual blocks for every vehicle and driver.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-sand hover:bg-copper transition-colors"
        >
          <Plus size={15} /> Block dates
        </button>
      </div>

      {showForm && (
        <div className="mt-5 flex flex-wrap items-end gap-3 border border-ink/10 bg-white/70 p-5">
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">
              {tab === "vehicle" ? "Vehicle" : "Driver"}
            </label>
            <select
              className={inputCls}
              value={form.resource_id}
              onChange={(e) => setForm((f) => ({ ...f, resource_id: e.target.value }))}
            >
              <option value="">Select…</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">From</label>
            <input
              type="date"
              className={inputCls}
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50 block mb-1.5">To</label>
            <input
              type="date"
              className={inputCls}
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-40">
            <label className="eyebrow text-ink/50 block mb-1.5">Reason</label>
            <input
              className={`${inputCls} w-full`}
              placeholder="Maintenance, leave, private use…"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </div>
          <button
            onClick={addBlock}
            className="bg-copper px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] text-sand hover:bg-copper-light transition-colors"
          >
            Add
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["vehicle", "driver"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                tab === t
                  ? "bg-ink text-sand border-ink"
                  : "border-ink/20 text-ink/60 hover:border-copper hover:text-copper"
              }`}
            >
              {t === "vehicle" ? "Vehicles" : "Drivers"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="p-2 text-ink/50 hover:text-copper">
            <ChevronLeft size={18} />
          </button>
          <p className="font-display text-xl text-ink w-44 text-center">{monthLabel}</p>
          <button onClick={() => nav(1)} className="p-2 text-ink/50 hover:text-copper">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-ink/55">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 bg-copper" /> Confirmed booking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 bg-ink/30" /> Blocked
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 overflow-x-auto border border-ink/10 bg-white/70">
        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-ink/50">
            <Loader2 size={15} className="animate-spin" /> Loading…
          </p>
        ) : resources.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">
            No {tab === "vehicle" ? "vehicles" : "drivers"} yet — add them under{" "}
            {tab === "vehicle" ? "Fleet" : "Drivers"}.
          </p>
        ) : (
          <table className="w-full border-collapse text-xs" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th className="sticky left-0 bg-white/95 px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.12em] text-ink/45 font-medium w-44">
                  {tab === "vehicle" ? "Vehicle" : "Driver"}
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <th
                    key={d}
                    className={`px-0.5 py-2 text-center font-normal ${
                      d === today ? "text-copper font-semibold" : "text-ink/40"
                    }`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => {
                const days = occupancy.get(r.id);
                return (
                  <tr key={r.id} className="border-t border-ink/5">
                    <td className="sticky left-0 bg-white/95 px-4 py-3 text-[13px] text-ink whitespace-nowrap">
                      {r.name}
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const occ = days?.get(d);
                      return (
                        <td key={d} className="p-0.5">
                          <div
                            title={occ ? `${d} ${monthLabel}: ${occ.label}` : `${d} ${monthLabel}: available`}
                            className={`h-7 w-full min-w-5 ${
                              occ
                                ? occ.kind === "booking"
                                  ? "bg-copper"
                                  : "bg-ink/30"
                                : d === today
                                  ? "bg-copper/10"
                                  : "bg-dune/60"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Blocks list */}
      {blocks.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink">Blocks this month</h2>
          <div className="mt-3 border border-ink/10 bg-white/70 divide-y divide-ink/5">
            {blocks.map((bl) => (
              <div key={bl.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="text-ink">
                  {resources.find((r) => r.id === bl.resource_id)?.name ?? "—"}
                </span>
                <span className="text-ink/55">
                  {fmtDate(bl.start_date)} → {fmtDate(bl.end_date)}
                </span>
                <span className="flex-1 truncate text-ink/45">{bl.reason}</span>
                <button
                  onClick={() => removeBlock(bl.id)}
                  className="p-1.5 text-ink/40 hover:text-red-700"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

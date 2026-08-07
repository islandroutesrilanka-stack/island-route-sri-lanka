"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  BOOKING_STATUSES, statusStyles, fmtDate, type BookingRow,
} from "@/lib/booking-ui";

function BookingsInner() {
  const sb = getBrowserSupabase();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      setLoading(true);
      let query = sb.from("bookings").select("*").order("created_at", { ascending: false });
      if (status !== "all") query = query.eq("status", status);
      const { data } = await query;
      setRows((data as BookingRow[]) ?? []);
      setLoading(false);
    })();
  }, [sb, status]);

  const filtered = rows.filter((b) =>
    q
      ? [b.name, b.email, b.service, b.tour_title]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      : true
  );

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-ink/55">
        Every request from the website — quote, confirm, assign and track.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {["all", ...BOOKING_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
              status === s
                ? "bg-ink text-sand border-ink"
                : "border-ink/20 text-ink/60 hover:border-copper hover:text-copper"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, tour…"
            className="border border-ink/15 bg-white/70 py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-copper"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-ink/10 bg-white/70">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[11px] uppercase tracking-[0.14em] text-ink/45">
              <th className="px-5 py-3.5 font-medium">Guest</th>
              <th className="px-5 py-3.5 font-medium">Request</th>
              <th className="px-5 py-3.5 font-medium">Travel date</th>
              <th className="px-5 py-3.5 font-medium">Pax</th>
              <th className="px-5 py-3.5 font-medium">Quote</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-ink/50">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-ink/50">No bookings found.</td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-sand/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/bookings/${b.id}`} className="block">
                      <p className="text-ink">{b.name}</p>
                      <p className="text-xs text-ink/45">{b.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">
                    {b.tour_title || b.service || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">{fmtDate(b.travel_date)}</td>
                  <td className="px-5 py-3.5 text-ink/70">{b.travellers ?? "—"}</td>
                  <td className="px-5 py-3.5 text-ink/70">
                    {b.quote_amount ? `${b.currency} ${b.quote_amount}` : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] ${statusStyles[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink/50 text-xs">
                    {fmtDate(b.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsInner />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Inbox, MessageSquare, CalendarCheck, Map } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { statusStyles, fmtDate, type BookingRow } from "@/lib/booking-ui";

export default function AdminDashboard() {
  const sb = getBrowserSupabase();
  const [stats, setStats] = useState({
    newBookings: 0,
    upcoming: 0,
    newInquiries: 0,
    tours: 0,
  });
  const [recent, setRecent] = useState<BookingRow[]>([]);

  useEffect(() => {
    if (!sb) return;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [nb, up, ni, t, rec] = await Promise.all([
        sb.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
        sb.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("travel_date", today),
        sb.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        sb.from("tours").select("id", { count: "exact", head: true }).eq("published", true),
        sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setStats({
        newBookings: nb.count ?? 0,
        upcoming: up.count ?? 0,
        newInquiries: ni.count ?? 0,
        tours: t.count ?? 0,
      });
      setRecent((rec.data as BookingRow[]) ?? []);
    })();
  }, [sb]);

  const cards = [
    { label: "New booking requests", value: stats.newBookings, icon: Inbox, href: "/admin/bookings?status=new" },
    { label: "Upcoming confirmed trips", value: stats.upcoming, icon: CalendarCheck, href: "/admin/bookings?status=confirmed" },
    { label: "New inquiries", value: stats.newInquiries, icon: MessageSquare, href: "/admin/inquiries" },
    { label: "Published tours", value: stats.tours, icon: Map, href: "/admin/content/tours" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/55">
        Good {new Date().getHours() < 12 ? "morning" : "day"} — here&apos;s the
        state of the island.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group border border-ink/10 bg-white/70 p-6 hover:border-copper/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <c.icon size={20} className="text-copper" strokeWidth={1.7} />
              <span className="font-display text-4xl text-ink">{c.value}</span>
            </div>
            <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-ink/50 group-hover:text-copper transition-colors">
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Latest requests</h2>
          <Link
            href="/admin/bookings"
            className="text-[12px] uppercase tracking-[0.14em] text-copper hover:underline"
          >
            All bookings →
          </Link>
        </div>
        <div className="mt-4 border border-ink/10 bg-white/70 divide-y divide-ink/5">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-ink/50">
              No bookings yet — they&apos;ll appear here the moment a guest
              submits the form.
            </p>
          ) : (
            recent.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3.5 hover:bg-sand/60 transition-colors"
              >
                <span className="w-40 truncate text-[15px] text-ink">{b.name}</span>
                <span className="flex-1 min-w-32 truncate text-sm text-ink/55">
                  {b.tour_title || b.service || "—"}
                </span>
                <span className="text-sm text-ink/55">{fmtDate(b.travel_date)}</span>
                <span
                  className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] ${statusStyles[b.status] ?? statusStyles.new}`}
                >
                  {b.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

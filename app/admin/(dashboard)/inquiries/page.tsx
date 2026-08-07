"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { fmtDate } from "@/lib/booking-ui";

type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
};

const inquiryStatuses = ["new", "replied", "closed"] as const;
const badge: Record<string, string> = {
  new: "bg-copper/15 text-copper border-copper/30",
  replied: "bg-sky-100 text-sky-800 border-sky-300",
  closed: "bg-ink/10 text-ink/60 border-ink/20",
};

export default function InquiriesPage() {
  const sb = getBrowserSupabase();
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    if (!sb) return;
    const { data } = await sb
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Inquiry[]) ?? []);
  }, [sb]);

  useEffect(() => {
    load();
  }, [load]);

  if (!sb) return null;

  const setStatus = async (id: string, status: string) => {
    await sb.from("inquiries").update({ status }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    await sb.from("inquiries").delete().eq("id", id);
    load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-ink">Inquiries</h1>
      <p className="mt-1 text-sm text-ink/55">
        Messages from the contact page.
      </p>

      <div className="mt-6 flex gap-2">
        {["all", ...inquiryStatuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
              filter === s
                ? "bg-ink text-sand border-ink"
                : "border-ink/20 text-ink/60 hover:border-copper hover:text-copper"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-ink/10 bg-white/70 divide-y divide-ink/5">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">No inquiries here.</p>
        ) : (
          filtered.map((i) => (
            <div key={i.id}>
              <button
                onClick={() => setOpenId(openId === i.id ? null : i.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-sand/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-ink">
                    {i.name}
                    <span className="ml-2 text-xs text-ink/40">{i.email}</span>
                  </p>
                  <p className="truncate text-sm text-ink/55">
                    {i.subject ?? "General"} — {i.message?.slice(0, 80)}
                  </p>
                </div>
                <span className="text-xs text-ink/40">{fmtDate(i.created_at)}</span>
                <span className={`border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] ${badge[i.status]}`}>
                  {i.status}
                </span>
                {openId === i.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openId === i.id && (
                <div className="border-t border-ink/5 bg-sand/40 px-5 py-5">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink/80">
                    {i.message}
                  </p>
                  {i.phone && (
                    <p className="mt-2 text-sm text-ink/55">Phone: {i.phone}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${i.email}?subject=${encodeURIComponent(`Re: ${i.subject ?? "Your enquiry"} — Island Route`)}`}
                      className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-sand hover:bg-copper transition-colors"
                    >
                      <Mail size={13} /> Reply by email
                    </a>
                    {inquiryStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(i.id, s)}
                        className={`border px-3 py-2 text-[11px] uppercase tracking-[0.12em] ${
                          i.status === s ? badge[s] : "border-ink/15 text-ink/45 hover:border-copper hover:text-copper"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      onClick={() => remove(i.id)}
                      className="ml-auto p-2 text-ink/40 hover:text-red-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

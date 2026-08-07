"use server";

import { getAnonSupabase } from "./supabase/server";
import { notifyNewBooking, notifyNewInquiry } from "./email";
import { validateEnquiry } from "./validation";

export type SubmitResult =
  | { ok: true }
  | { ok: false; code: "no_backend" | "invalid" | "error"; message?: string };

export type EnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  subject?: string;
  tourTitle?: string;
  travelDate?: string;
  travellers?: string;
  message?: string;
  /** Honeypot — must stay empty. */
  company?: string;
};

export async function submitBooking(input: EnquiryInput): Promise<SubmitResult> {
  const valid = validateEnquiry(input, { requireService: true });
  if (!valid.ok) return { ok: false, code: "invalid", message: valid.error };

  const sb = getAnonSupabase();
  if (!sb) return { ok: false, code: "no_backend" };

  const d = valid.data;
  const { error } = await sb.from("bookings").insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    service: d.service,
    tour_title: d.tour_title,
    travel_date: d.travel_date,
    travellers: d.travellers,
    message: d.message,
  });
  if (error) {
    console.error("booking insert failed:", error.message);
    return { ok: false, code: "error", message: "We couldn't save your request." };
  }

  // Fire-and-forget notifications; never block the guest on email issues
  notifyNewBooking({
    name: d.name as string,
    email: d.email as string,
    phone: d.phone ?? undefined,
    service: d.service ?? undefined,
    tourTitle: d.tour_title ?? undefined,
    travelDate: d.travel_date ?? undefined,
    travellers: d.travellers ?? undefined,
    message: d.message ?? undefined,
  }).catch(() => {});

  return { ok: true };
}

export async function submitInquiry(input: EnquiryInput): Promise<SubmitResult> {
  const valid = validateEnquiry(input);
  if (!valid.ok) return { ok: false, code: "invalid", message: valid.error };

  const sb = getAnonSupabase();
  if (!sb) return { ok: false, code: "no_backend" };

  const d = valid.data;
  const { error } = await sb.from("inquiries").insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    subject: d.subject ?? d.service,
    message: d.message,
  });
  if (error) {
    console.error("inquiry insert failed:", error.message);
    return { ok: false, code: "error", message: "We couldn't save your message." };
  }

  notifyNewInquiry({
    name: d.name as string,
    email: d.email as string,
    phone: d.phone ?? undefined,
    subject: (d.subject ?? d.service) ?? undefined,
    message: d.message ?? undefined,
  }).catch(() => {});

  return { ok: true };
}

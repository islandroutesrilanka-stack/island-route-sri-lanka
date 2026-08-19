"use server";

import { getAnonSupabase } from "./supabase/server";
import { notifyNewBooking, notifyNewInquiry } from "./email";
import { notifyBookingTelegram } from "./telegram";
import { parseQuote } from "./pricing";
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

  /* ── The transport calculator, for notifications only ──────────────────
     Not database columns, and deliberately so: `bookings` keeps the quote
     and the hotel request inside `message`, as the fixed lines BookingForm
     folds in (see its `outgoingMessage`). That record is unchanged. These
     three carry the same two facts in structured form so the Telegram alert
     can put the vehicle, the day count and the total on their own lines
     instead of parsing them back out of prose. The money is never taken
     from the client — `parseQuote` recomputes it from the published rate. */
  /** `RateId` as sent; validated by `parseQuote`, not by the type. */
  rateId?: string;
  days?: number;
  hotelHelp?: boolean;
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

  /*
    Telegram, on the owner's phone, within seconds.

    Awaited, unlike the email above, and the difference is deliberate. The
    insert has already committed by this point, so waiting cannot endanger
    the booking — the only cost is latency, capped at TELEGRAM_TIMEOUT_MS
    and normally a few hundred milliseconds. What it buys is delivery: this
    runs on serverless, where the sandbox may be frozen the moment the
    response is returned, and a fire-and-forget fetch is not guaranteed to
    survive that. An alert whose whole purpose is to arrive instantly is
    worth six seconds of ceiling; the email, which is a record rather than
    an alert, is not.

    Fail-safe regardless: every path inside notifyBookingTelegram resolves
    rather than throws, and the `.catch` is the belt to that module's
    braces. A dead token, a revoked chat or an unreachable api.telegram.org
    costs the guest nothing — the row is already saved and `ok: true` is
    returned either way.
  */
  await notifyBookingTelegram({
    name: d.name as string,
    email: d.email as string,
    phone: d.phone ?? undefined,
    service: d.service ?? undefined,
    tourTitle: d.tour_title ?? undefined,
    travelDate: d.travel_date ?? undefined,
    travellers: d.travellers ?? undefined,
    message: d.message ?? undefined,
    quote: parseQuote(input.rateId, input.days),
    hotelHelp: input.hotelHelp === true,
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

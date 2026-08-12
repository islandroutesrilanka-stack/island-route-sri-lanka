import nodemailer from "nodemailer";
import { site } from "./site";

/**
 * Gmail SMTP notifications. Configure in .env:
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / ADMIN_EMAIL
 * When unconfigured, emails are silently skipped (the booking is still saved).
 */
function getTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const wrap = (title: string, rows: [string, string | undefined | null][]) => `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e5ded0;background:#f6f1e6">
    <div style="background:#0B1F19;padding:28px 32px">
      <p style="margin:0;color:#D08A55;font-size:11px;letter-spacing:3px;text-transform:uppercase">Island Route Sri Lanka</p>
      <h1 style="margin:8px 0 0;color:#f6f1e6;font-weight:400;font-size:24px">${title}</h1>
    </div>
    <div style="padding:28px 32px">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#101D18">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 0;color:#8a8272;width:130px;vertical-align:top">${k}</td><td style="padding:7px 0">${v}</td></tr>`
          )
          .join("")}
      </table>
    </div>
    <div style="padding:18px 32px;border-top:1px solid #e5ded0;font-size:12px;color:#8a8272">
      WhatsApp ${site.whatsappDisplay} · ${site.email}
    </div>
  </div>`;

async function send(to: string, subject: string, html: string) {
  const t = getTransport();
  if (!t) return { skipped: true as const };
  try {
    await t.sendMail({
      from: `"Island Route Sri Lanka" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { ok: true as const };
  } catch (e) {
    console.error("email send failed:", e);
    return { error: true as const };
  }
}

export type BookingEmailData = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  tourTitle?: string;
  travelDate?: string;
  travellers?: string;
  message?: string;
};

export async function notifyNewBooking(b: BookingEmailData) {
  const admin = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER;
  const rows: [string, string | undefined][] = [
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone],
    ["Service", b.service],
    ["Tour", b.tourTitle],
    ["Travel date", b.travelDate],
    ["Travellers", b.travellers],
    ["Message", b.message],
  ];
  await Promise.allSettled([
    admin
      ? send(admin, `New booking request — ${b.name}`, wrap("New booking request", rows))
      : Promise.resolve(),
    send(
      b.email,
      "We received your request — Island Route Sri Lanka",
      wrap("Thank you — we're on it", [
        [
          "",
          `Hi ${b.name}, thanks for your booking request. Our team will reply within a few hours with a personal quote. For anything urgent, WhatsApp us at ${site.whatsappDisplay}.`,
        ],
        ["Service", b.service],
        ["Travel date", b.travelDate],
      ])
    ),
  ]);
}

export async function notifyNewInquiry(i: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}) {
  const admin = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER;
  await Promise.allSettled([
    admin
      ? send(
          admin,
          `New enquiry — ${i.name}`,
          wrap("New enquiry", [
            ["Name", i.name],
            ["Email", i.email],
            ["Phone", i.phone],
            ["Subject", i.subject],
            ["Message", i.message],
          ])
        )
      : Promise.resolve(),
    send(
      i.email,
      "We received your message — Island Route Sri Lanka",
      wrap("Thanks for reaching out", [
        [
          "",
          `Hi ${i.name}, we've received your message and will get back to you shortly. For anything urgent, WhatsApp us at ${site.whatsappDisplay}.`,
        ],
      ])
    ),
  ]);
}

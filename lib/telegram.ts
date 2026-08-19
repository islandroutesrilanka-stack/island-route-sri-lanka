import { siteUrl } from "./site";
import { HOTEL_ASSIST_LINE, money, quoteLine, type Quote } from "./pricing";

/**
 * Telegram push notifications for new booking requests.
 *
 * Configure in .env.local (and in Vercel → Settings → Environment Variables):
 *   TELEGRAM_BOT_TOKEN — issued by @BotFather
 *   TELEGRAM_CHAT_ID   — the owner's own chat with the bot, or a group/channel
 *
 * The owner runs a hotel; they are not at a desk, and they are not going to
 * refresh /admin between check-ins. Email already covers the record — this
 * covers the minute after the guest presses send, on the phone in their pocket.
 *
 * When either variable is missing the send is silently skipped, exactly as the
 * SMTP notifications in ./email are: a deployment without a bot is a deployment
 * without alerts, never a deployment that loses bookings.
 */

/**
 * Bounded because this is awaited (see lib/actions.ts for why). Telegram
 * normally answers in well under a second, so this is a ceiling on the worst
 * case — an unreachable API — not a budget anyone should hit.
 */
const TELEGRAM_TIMEOUT_MS = 6000;

export type TelegramResult =
  | { ok: true }
  | { skipped: true }
  | { error: true };

/** True when this deployment has a bot configured. */
export const telegramConfigured = (): boolean =>
  Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

/**
 * POST to the Bot API's sendMessage method.
 *
 * Resolves for every outcome and throws for none — a caller should be able to
 * forget it exists. `text` is parsed as Telegram-flavoured HTML, so anything
 * interpolated into it must go through `esc` first.
 */
export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: true };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        // The message carries no links worth previewing; a preview card would
        // push the guest's details off the notification.
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      /*
        Telegram puts the reason in the body — "chat not found", "bot was
        blocked by the user", "Unauthorized" — and the status alone says very
        little. Worth logging, because these are the three ways a working
        setup quietly stops working.
      */
      const body = await res.text().catch(() => "");
      console.error(
        `telegram sendMessage failed: ${res.status} ${body.slice(0, 300)}`,
      );
      return { error: true };
    }
    return { ok: true };
  } catch (e) {
    /*
      Only the message, never the error object and never the request. The bot
      token is a credential and it is in the URL — anything that might carry
      the URL into a log line has to be kept out of this call.
    */
    console.error(
      "telegram sendMessage failed:",
      e instanceof Error ? e.message : "unknown error",
    );
    return { error: true };
  }
}

/** Escape for Telegram's HTML parse mode. `&` first, or it double-escapes. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type TelegramBookingData = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  tourTitle?: string;
  travelDate?: string;
  travellers?: string;
  message?: string;
  /** Already recomputed server-side by `parseQuote` — never the client's sum. */
  quote?: Quote | null;
  hotelHelp?: boolean;
};

/**
 * The guest's own words, with the two machine-written blocks removed.
 *
 * BookingForm folds `quoteLine()` and `HOTEL_ASSIST_LINE` into the stored
 * message so the database keeps the whole enquiry in one field. Both facts get
 * their own lines in the notification above, so leaving them in the quoted
 * message would make every alert state the quote twice. Matched exactly rather
 * than by prefix: the server recomputes the same quote from the same two
 * inputs, so it can reconstruct the identical sentence and does not have to
 * guess at the copy.
 */
function guestNote(message: string | undefined, quote: Quote | null): string {
  const machine = new Set(
    [HOTEL_ASSIST_LINE, quote ? quoteLine(quote) : ""].filter(Boolean),
  );
  return (message ?? "")
    .split(/\n{2,}/)
    .filter((block) => !machine.has(block.trim()))
    .join("\n\n")
    .trim();
}

/**
 * The alert as the owner reads it on a phone: who, how to reach them, what
 * they were quoted, and whether they asked for hotels — in that order, because
 * that is the order the reply gets written in.
 */
function bookingMessage(b: TelegramBookingData): string {
  const q = b.quote ?? null;

  /*
    The flag and the line say the same thing, and either is enough. The line is
    what BookingForm has appended since the day-rate refactor, so honouring it
    too means a stale client bundle — or a booking replayed from the admin —
    still raises the highlight.
  */
  const hotel =
    b.hotelHelp === true || (b.message ?? "").includes(HOTEL_ASSIST_LINE);

  /*
    Email and phone are deliberately left bare rather than wrapped in a link.
    Telegram auto-links both, which on a phone makes the two things the owner
    actually needs — reply, or call — one tap from the notification.
  */
  const rows: [string, string | undefined][] = [
    ["Guest", b.name],
    ["Email", b.email],
    ["Phone", b.phone],
    ["Service", b.service],
    ["Journey", b.tourTitle],
    ["Travel date", b.travelDate],
    ["Travellers", b.travellers],
    ["Vehicle", q?.rate.label],
    ["Days", q ? String(q.days) : undefined],
    [
      "Transport quote",
      q
        ? `${money(q.total)} — ${money(q.rate.usdPerDay)}/day × ${q.days} ${
            q.days === 1 ? "day" : "days"
          }`
        : undefined,
    ],
  ];

  const lines = [
    "🚗 <b>New booking request</b>",
    "",
    ...rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v as string)}`),
  ];

  if (hotel) {
    lines.push(
      "",
      "🏨 <b>HOTEL BOOKING ASSISTANCE REQUESTED</b>",
      // The wording lives in lib/pricing.ts so the alert, the stored enquiry
      // and the form's own checkbox copy can never drift apart.
      `<i>${esc(HOTEL_ASSIST_LINE)}</i>`,
    );
  }

  const note = guestNote(b.message, q);
  if (note) lines.push("", "<b>Message</b>", esc(note));

  lines.push("", `<a href="${esc(siteUrl)}/admin/bookings">Open in admin →</a>`);

  return lines.join("\n");
}

/**
 * Send the booking alert. Never throws; see `sendTelegramMessage`.
 */
export async function notifyBookingTelegram(
  b: TelegramBookingData,
): Promise<TelegramResult> {
  return sendTelegramMessage(bookingMessage(b));
}

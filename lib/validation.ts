/**
 * Server-side validation for public form submissions.
 * The browser's own validation is a convenience, not a defence — anything
 * reaching the database goes through these checks first.
 */

export const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  service: 80,
  tourTitle: 200,
  travellers: 10,
  message: 4000,
  subject: 200,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export type ValidationResult =
  | { ok: true; data: Record<string, string | null> }
  | { ok: false; error: string };

/** Trim, collapse whitespace, strip control characters, and cap length. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}

/** Rejects the obvious bot signatures we see on travel enquiry forms. */
function looksLikeSpam(text: string): boolean {
  const urls = (text.match(/https?:\/\//gi) || []).length;
  if (urls >= 3) return true;
  if (/\[url=|\[\/url\]|<a\s+href=/i.test(text)) return true;
  return false;
}

export function validateEnquiry(
  input: Record<string, unknown>,
  opts: { requireService?: boolean } = {}
): ValidationResult {
  const name = clean(input.name, LIMITS.name);
  const email = clean(input.email, LIMITS.email);
  const phone = clean(input.phone, LIMITS.phone);
  const service = clean(input.service, LIMITS.service);
  const subject = clean(input.subject, LIMITS.subject);
  const tourTitle = clean(input.tourTitle, LIMITS.tourTitle);
  const travellers = clean(input.travellers, LIMITS.travellers);
  const message = clean(input.message, LIMITS.message);
  const travelDate = clean(input.travelDate, 10);

  // Honeypot: a hidden field only a bot would fill in
  if (clean(input.company, 100)) return { ok: false, error: "Rejected." };

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!EMAIL.test(email))
    return { ok: false, error: "Please enter a valid email address." };
  if (opts.requireService && !service)
    return { ok: false, error: "Please choose a service." };
  if (looksLikeSpam(`${message} ${name}`))
    return { ok: false, error: "Your message looks like spam — please email us directly." };

  if (travelDate && !/^\d{4}-\d{2}-\d{2}$/.test(travelDate))
    return { ok: false, error: "Please enter a valid travel date." };
  if (travelDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (travelDate < today)
      return { ok: false, error: "Travel date can't be in the past." };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone: phone || null,
      service: service || null,
      subject: subject || null,
      tour_title: tourTitle || null,
      travellers: travellers || null,
      message: message || null,
      travel_date: travelDate || null,
    },
  };
}

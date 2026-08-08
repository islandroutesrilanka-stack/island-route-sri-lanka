/**
 * Shared formatters.
 *
 * The en-GB date formatting below was written out by hand in four separate
 * places (`app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` and
 * the admin calendar). Four copies means four chances to drift — and one of
 * them eventually formats a date differently from the others on the same page.
 */

const LOCALE = "en-GB";

/** "12 June 2026" — the site's standard long-form date. */
export function formatDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "June 2026" — for month headings. */
export function formatMonthYear(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
}

/** "12 Jun" — compact, for dense admin lists. */
export function formatDateShort(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

/**
 * "$690" — indicative per-person pricing.
 *
 * Deliberately renders no decimal places: these are guide prices, and trailing
 * ".00" implies a precision the quote process does not actually have.
 */
export function formatPrice(amount: number, currency = "USD"): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Machine-readable date for <time dateTime="…"> and structured data. */
export function toIsoDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

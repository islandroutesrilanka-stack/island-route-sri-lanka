/**
 * Google Translate, on our terms.
 *
 * The brief was a language switcher that works across the whole site without
 * `app/[locale]/…` route folders and without a translation pipeline. Google's
 * element widget is the only thing that does that, so this module wraps it —
 * and most of what is here exists to contain it rather than to use it.
 *
 * ── Three things this does that the copy-paste snippet does not ─────────────
 *
 * 1. It does not load on an English page load. The stock snippet puts a
 *    third-party script on the critical path of every visit; this site's
 *    Performance score was dragged from 59 to the green on the argument that
 *    nothing gets to sit there for free. The script is fetched only when a
 *    visitor has actually chosen another language — which is a cookie read, so
 *    it costs nothing to check. The default visit is byte-for-byte what it was.
 *
 * 2. It patches React's DOM against the widget. Google translates by replacing
 *    text nodes with <font> elements. React still holds references to the nodes
 *    it created, so the next time it removes or reorders one — a mobile menu
 *    closing, a form step advancing, the gallery lightbox — `removeChild`
 *    throws NotFoundError and takes the page down. `guardReact()` below is the
 *    long-standing workaround for that, installed only when translation is
 *    actually in play.
 *
 * 3. It never trusts the cookie. `googtrans` is readable and writable by
 *    anything on the domain; its value is checked against lib/languages.ts
 *    before it reaches the UI.
 *
 * ── What it deliberately does not do ────────────────────────────────────────
 *
 * This is machine translation applied in the browser. It produces no localised
 * URLs, so it adds nothing for search: there is no `hreflang` to emit and no
 * German page for Google to index. It is a convenience for a reader who has
 * already arrived, and the day the business wants European search traffic, it
 * wants real routes and real copy — this is not a step towards that.
 */
import { DEFAULT_LANGUAGE, findLanguage, languages } from "./languages";

const COOKIE = "googtrans";
const SCRIPT_ID = "google-translate-script";

/** The element the widget mounts its (hidden) gadget into. */
export const HOST_ID = "google-translate-host";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
          },
          container: string,
        ) => unknown;
      };
    };
  }
}

/* -------------------------------- The cookie ------------------------------- */

/**
 * Which language is in force, according to the cookie the widget reads.
 *
 * The value is `/<source>/<target>`. Anything not in our own list is treated as
 * English: a stale code from a language we have since removed, or a hand-edited
 * cookie, should show the default rather than a blank trigger.
 */
export function readLanguage(): string {
  if (typeof document === "undefined") return DEFAULT_LANGUAGE;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return DEFAULT_LANGUAGE;
  const code = decodeURIComponent(raw).split("/").filter(Boolean).pop();
  return code && findLanguage(code) ? code : DEFAULT_LANGUAGE;
}

/**
 * Both the exact host and a leading-dot parent, so www and apex agree.
 *
 * Someone who switches to German on www.islandroutesrilanka.com and then
 * follows a link to the apex should still be reading German. Derived from the
 * hostname rather than from a registrable-domain guess, which needs the public
 * suffix list to be right about .co.uk and friends.
 */
function cookieScopes(): string[] {
  const host = window.location.hostname;
  // localhost and bare IPs reject a domain attribute outright.
  if (host === "localhost" || /^[\d.]+$/.test(host)) return [""];
  return ["", `; domain=.${host.replace(/^www\./, "")}`];
}

/** Persist the choice. English clears the cookie rather than storing `/en/en`. */
export function writeLanguage(code: string): void {
  for (const scope of cookieScopes()) {
    document.cookie =
      code === DEFAULT_LANGUAGE
        ? `${COOKIE}=; path=/${scope}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        : `${COOKIE}=/${DEFAULT_LANGUAGE}/${code}; path=/${scope}; max-age=31536000`;
  }
}

/* ------------------------------- The widget -------------------------------- */

export const widgetLoaded = (): boolean =>
  typeof document !== "undefined" &&
  Boolean(document.getElementById(SCRIPT_ID));

/**
 * Fetch and initialise the widget. Idempotent, and safe to call on a page that
 * is already translated.
 */
export function loadWidget(): void {
  if (typeof document === "undefined" || widgetLoaded()) return;
  guardReact();

  window.googleTranslateElementInit = () => {
    const T = window.google?.translate?.TranslateElement;
    if (!T) return;
    new T(
      {
        pageLanguage: DEFAULT_LANGUAGE,
        includedLanguages: languages.map((l) => l.code).join(","),
        // We render the switcher ourselves; Google's own banner is suppressed
        // in globals.css. `autoDisplay` would pop it open on first visit.
        autoDisplay: false,
      },
      HOST_ID,
    );
  };

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

/**
 * Resolve once the gadget is actually usable, or give up.
 *
 * There is no load event worth listening to — element.js fetches further
 * scripts of its own and the callback fires before the gadget is built — so
 * readiness is defined as the thing we need existing. The poll is cheap and
 * bounded; the boolean lets the caller reload instead of hanging.
 */
export function whenWidgetReady(timeoutMs = 8000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const tick = () => {
      if (document.querySelector("select.goog-te-combo")) return resolve(true);
      if (Date.now() > deadline) return resolve(false);
      window.setTimeout(tick, 120);
    };
    tick();
  });
}

/**
 * Switch the running widget in place, without a reload.
 *
 * The gadget's own `<select>` is the only supported way in, so this drives it
 * and lets Google do the retranslation. Returns false when the select isn't
 * there — the widget hasn't finished booting, or Google changed its markup —
 * and the caller falls back to a reload, which always works because the cookie
 * has already been written.
 */
export function applyLanguage(code: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>(
    "select.goog-te-combo",
  );
  if (!combo) return false;
  combo.value = code === DEFAULT_LANGUAGE ? "" : code;
  combo.dispatchEvent(new Event("change"));
  return true;
}

/**
 * Tell assistive technology what language it is now reading.
 *
 * The widget rewrites every word on the page and leaves `<html lang="en">`
 * exactly as it found it, which means a screen reader announces German copy in
 * an English voice — WCAG 3.1.1, and unusable in practice. Nothing else reads
 * this attribute at runtime: the widget translates from the `pageLanguage` it
 * was configured with, not from the document.
 */
export function setDocumentLanguage(code: string): void {
  document.documentElement.lang = code;
}

/* ------------------------------- The guard --------------------------------- */

let guarded = false;

/**
 * Stop Google's DOM rewriting from crashing React.
 *
 * Translation replaces a text node with a <font> wrapper. React's fibre tree
 * still points at the original node, so `parent.removeChild(stale)` and
 * `parent.insertBefore(node, stale)` both throw NotFoundError — the error
 * surfaces as a blank page, usually the moment an unrelated interaction
 * re-renders. The fix, unchanged since facebook/react#11538, is to make those
 * two operations no-ops when the reference node is no longer where React
 * thinks it is; the translated markup is already correct, so there is nothing
 * to repair, only an exception to not throw.
 *
 * Installed lazily and once. Patching Node.prototype for every visitor — most
 * of whom read the site in English — would be an unreasonable thing to do for
 * a feature they never touched.
 */
function guardReact(): void {
  if (guarded || typeof Node === "undefined") return;
  guarded = true;

  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(
    this: Node,
    child: T,
  ): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    node: T,
    ref: Node | null,
  ): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

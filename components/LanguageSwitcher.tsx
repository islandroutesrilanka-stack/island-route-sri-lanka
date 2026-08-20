"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { Check, Globe } from "lucide-react";
import { DEFAULT_LANGUAGE, findLanguage, languages } from "@/lib/languages";
import {
  HOST_ID,
  applyLanguage,
  loadWidget,
  readLanguage,
  setDocumentLanguage,
  whenWidgetReady,
  widgetLoaded,
  writeLanguage,
} from "@/lib/google-translate";

/**
 * The language control, in two shapes.
 *
 * `LanguageSwitcher` is the header disclosure — a globe and two letters, at the
 * same 11px/0.2em as the nav links, opening a panel of language names.
 * `LanguageRow` is the same choice laid flat for the mobile sheet, where a
 * popover inside an already-open sheet would be a menu inside a menu.
 * `TranslateHost` is the widget's mount point and renders nothing you can see.
 *
 * Both shapes share `useLanguageChoice`, which is where the behaviour lives;
 * the components below are presentation.
 *
 * ── Why the names are never translated ──────────────────────────────────────
 *
 * The lists carry `translate="no"`. Without it the widget would helpfully
 * render "Deutsch" as "Allemand" once a French visitor arrived — and then the
 * one control that exists to rescue someone from a page they cannot read would
 * itself be written in the language they cannot read. The heading above the
 * mobile list is left translatable, because "Language" is a word, not a name.
 */

/* -------------------------------- Behaviour -------------------------------- */

/*
  One choice, two controls.

  Both shapes are mounted at every viewport — one of them is merely hidden —
  so a `useState` in each would give the site two disagreeing opinions about
  what language it is in, and a switch made in one would leave the other still
  showing the old one. A module-level store is the smallest thing that keeps
  them equal, and it is the reason the root layout needs no provider: a
  context here would mean a client boundary wrapped around every page.
*/
let currentLanguage = DEFAULT_LANGUAGE;
let booted = false;
const listeners = new Set<() => void>();

function publish(code: string) {
  if (code === currentLanguage) return;
  currentLanguage = code;
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};

function useLanguageChoice() {
  // The third argument is the server's answer: no cookie, so English.
  const code = useSyncExternalStore(
    subscribe,
    () => currentLanguage,
    () => DEFAULT_LANGUAGE,
  );
  const [busy, setBusy] = useState(false);

  /*
    Read after mount, never during render.

    The cookie only exists in the browser, so a render that consulted it would
    disagree with the server HTML — which is always English — and React would
    throw out the tree it was handed. The first paint says EN for everyone; a
    visitor who has chosen otherwise gets the correction a tick later, at which
    point the widget is also fetched, because that is the one moment we know
    the script is actually wanted.
  */
  useEffect(() => {
    if (booted) return;
    booted = true;
    const saved = readLanguage();
    if (saved === DEFAULT_LANGUAGE) return;
    publish(saved);
    loadWidget();
    // Only once the words have actually changed — see setDocumentLanguage.
    void whenWidgetReady().then((r) => r && setDocumentLanguage(saved));
  }, []);

  const choose = useCallback(
    async (next: string) => {
      if (next === code) return;
      writeLanguage(next);
      publish(next);

      /*
        Back to English is a reload, deliberately.

        The gadget's own select does have a "show original" state, and driving
        it back is the sort of thing that works until it doesn't — leaving half
        a page in German with no obvious way out. Discarding the document is
        slower and completely reliable, and the cookie is already cleared, so
        what comes back is the untouched page.
      */
      if (next === DEFAULT_LANGUAGE) {
        window.location.reload();
        return;
      }

      // Already running: retranslate in place, no navigation, scroll intact.
      if (widgetLoaded()) {
        if (!applyLanguage(next)) return window.location.reload();
        setDocumentLanguage(next);
        return;
      }

      /*
        First switch of the visit. There is nothing to drive yet — and nothing
        needs driving: the widget reads `googtrans` when it initialises, and we
        have just written it, so booting the script *is* the switch. That is
        also why this doesn't reload. A reload would fetch Google's script on
        the way back anyway, and cost the visitor their place on the page for
        nothing.

        `busy` covers the second or so of network in between. A control that
        appears to do nothing when pressed gets pressed again.
      */
      setBusy(true);
      loadWidget();
      const ready = await whenWidgetReady();
      setBusy(false);
      if (!ready) return window.location.reload();
      setDocumentLanguage(next);
    },
    [code],
  );

  return { code, busy, choose };
}

/* --------------------------------- Pieces ---------------------------------- */

/**
 * Where Google builds its gadget. Kept out of sight in globals.css — we render
 * the switcher ourselves, and the widget's own select is only ever driven by
 * script.
 */
export function TranslateHost() {
  return <div id={HOST_ID} aria-hidden="true" />;
}

/** Header disclosure. Sized and coloured to sit beside the nav links. */
export default function LanguageSwitcher({ solid }: { solid: boolean }) {
  const { code, busy, choose } = useLanguageChoice();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Without this, Escape leaves focus on an element that no longer exists.
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = findLanguage(code) ?? languages[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="language-menu"
        aria-busy={busy || undefined}
        className={`flex items-center gap-1.5 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
          busy ? "opacity-60" : ""
        } ${
          solid
            ? open
              ? "text-copper-deep"
              : "text-ink/70 hover:text-ink"
            : open
              ? "text-copper-light"
              : "text-sand/80 hover:text-sand"
        }`}
      >
        <Globe size={13} strokeWidth={1.6} aria-hidden />
        {/*
          The name, not an aria-label.

          A label written in the attribute would be read out as English on
          a German page — the widget rewrites body text, and this is the
          one control that must speak the language the reader chose. As a
          text node it is translated with everything else, and "Sprache DE"
          also contains the visible letters, which an aria-label of its own
          wording would not.
        */}
        <span className="sr-only">Language</span>
        <span translate="no">{active.short}</span>
      </button>

      {open && (
        /* The entrance borrows the header's own keyframe, so reduced motion is
           already handled — globals.css collapses every animation on the site. */
        <ul
          id="language-menu"
          translate="no"
          style={
            { "--rise-from": "-6px", "--rise-dur": "0.25s" } as CSSProperties
          }
          className="rise-in absolute right-0 top-full z-50 mt-3 w-44 border border-ink/10 bg-sand py-1.5 shadow-[0_20px_45px_-28px_rgba(16,29,24,0.6)]"
        >
          {languages.map((l) => {
            const on = l.code === code;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  lang={l.code}
                  aria-current={on ? "true" : undefined}
                  onClick={() => {
                    setOpen(false);
                    void choose(l.code);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-[13px] transition-colors ${
                    on
                      ? "text-copper-deep"
                      : "text-ink/75 hover:bg-dune/70 hover:text-ink"
                  }`}
                >
                  {l.label}
                  {on && <Check size={13} strokeWidth={2} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Mobile sheet: flat, because a popover inside an open sheet is a menu in a menu. */
export function LanguageRow() {
  const { code, busy, choose } = useLanguageChoice();

  return (
    <div className="mt-8 border-t border-ink/10 pt-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-ink/45">
        Language
      </p>
      <ul
        translate="no"
        className={`mt-3 flex flex-wrap gap-2 transition-opacity ${
          busy ? "opacity-60" : ""
        }`}
      >
        {languages.map((l) => {
          const on = l.code === code;
          return (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                aria-current={on ? "true" : undefined}
                onClick={() => void choose(l.code)}
                className={`border px-3 py-1.5 text-[12px] transition-colors ${
                  on
                    ? "border-copper-deep bg-copper-deep text-sand"
                    : "border-ink/15 text-ink/70"
                }`}
              >
                {l.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useId,
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
 * The language control.
 *
 * One component, mounted twice: once among the desktop nav links, once in the
 * mobile bar beside the menu button. Both are in the markup at every width —
 * one of them is merely `display: none` — which is why the chosen language
 * lives in the module store below rather than in either one's state.
 *
 * `touch` is the whole difference between them. Among text the trigger is
 * baseline-sized and sits on the nav's own rhythm; among icon buttons it has
 * to be a 44px target like the one it stands next to.
 *
 * `TranslateHost` is the widget's mount point and renders nothing you can see.
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
  One choice, two triggers.

  The desktop and mobile controls are both mounted at every width — one of
  them is merely hidden — so a `useState` in each would give the site two
  disagreeing opinions about what language it is in, and a choice made at one
  width would be forgotten at the other the moment the viewport crossed the
  breakpoint. A module-level store is the smallest thing that keeps them
  equal, and it is the reason the root layout needs no provider: a context
  here would mean a client boundary wrapped around every page.
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

/**
 * Header disclosure. `solid` follows the header's own light/dark state;
 * `touch` swaps the text-sized trigger for a 44px one for the mobile bar.
 */
export default function LanguageSwitcher({
  solid,
  touch = false,
}: {
  solid: boolean;
  touch?: boolean;
}) {
  const { code, busy, choose } = useLanguageChoice();
  const [open, setOpen] = useState(false);
  /*
    The id is generated, not written, because this component is on the page
    twice. A tablet rotating across the `lg` breakpoint with the panel open
    would otherwise leave two elements claiming the same id — the hidden one
    still holds its own `open` state, and nothing closes it on the way past.
  */
  const menuId = useId();
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
        aria-controls={menuId}
        aria-busy={busy || undefined}
        className={`flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${
          touch ? "h-11 px-2" : "py-1"
        } ${busy ? "opacity-60" : ""} ${
          solid
            ? open
              ? "text-copper-deep"
              : "text-ink/70 hover:text-ink"
            : open
              ? "text-copper-light"
              : "text-sand/80 hover:text-sand"
        }`}
      >
        <Globe size={touch ? 15 : 13} strokeWidth={1.6} aria-hidden />
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
          id={menuId}
          translate="no"
          style={
            { "--rise-from": "-6px", "--rise-dur": "0.25s" } as CSSProperties
          }
          /* A phone in landscape is 360px tall and this list is eight names
             deep, so it is allowed to scroll rather than run off the bottom,
             and to keep that scroll to itself. The cap leaves the last name
             half-showing rather than cleanly cut, which is the only thing
             telling a thumb there is more below. */
          className={`rise-in absolute top-full z-50 mt-3 max-h-[calc(100vh-5.5rem)] w-44 overflow-y-auto overscroll-contain border border-ink/10 bg-sand py-1.5 shadow-[0_20px_45px_-28px_rgba(16,29,24,0.6)] ${
            /*
              In the bar the panel hangs off the page's own right margin, not
              off this trigger — the trigger is not the last thing in the row,
              and a panel whose edge lines up with nothing reads as an
              accident. 40px is the menu button (44) plus the gap (4) less the
              8 it is pulled outward by, which is the distance from this
              trigger's right edge to the container's padding regardless of
              how wide the screen is.
            */
            touch ? "-right-10" : "right-0"
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

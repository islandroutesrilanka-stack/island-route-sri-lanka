/**
 * The languages the header offers.
 *
 * Sri Lanka's European inbound market is led by Russia, Germany, the UK and
 * France, with Italy, Spain and the Netherlands behind them — which is the
 * order this list is in, minus the UK, because English is what the site is
 * written in. Japanese sits after them rather than inside that ranking: it
 * is not a European market, and the visitors it serves — pilgrimage travel
 * to the cultural triangle, and the business travel that follows Japan's
 * long involvement in the island's infrastructure — are their own audience.
 *
 * `label` is the endonym on purpose. A visitor who cannot read English cannot
 * find "German" in a list, but recognises "Deutsch" instantly; a picker that
 * names languages in a language you don't speak is the one control on a site
 * that must never need translating. For the same reason the switcher itself
 * carries `translate="no"` — see components/LanguageSwitcher.tsx.
 *
 * Adding one is a line here and a flag in components/Flag.tsx. Nothing else:
 * the widget is initialised from `includedLanguages`, which is derived from
 * this array.
 */
export type Language = {
  /** ISO 639-1, as Google Translate expects it. */
  code: string;
  /** The language's own name for itself. */
  label: string;
  /** Two letters for the collapsed header trigger. */
  short: string;
};

/** The language the site is authored in. Everything else is a translation. */
export const DEFAULT_LANGUAGE = "en";

export const languages: Language[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "it", label: "Italiano", short: "IT" },
  { code: "es", label: "Español", short: "ES" },
  { code: "nl", label: "Nederlands", short: "NL" },
  { code: "ja", label: "日本語", short: "JA" },
];

export const findLanguage = (code: string): Language | undefined =>
  languages.find((l) => l.code === code);

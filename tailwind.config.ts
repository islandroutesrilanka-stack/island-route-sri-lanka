import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Grounds ────────────────────────────────────────────────────────
           The darks are the Indian Ocean at depth rather than neutral
           charcoal: both carry real green-cyan, so a dark band reads as water
           instead of as an absence of light. `deep` is the site's dark canvas;
           `palm` is the one step above it, for cards and panels sitting on it.

           `deep` is saturated rather than lightened, and that distinction is
           the whole of it. A first pass at #04322E looked better in a swatch
           and was four times brighter than the ground it replaced, which put
           every `text-sand/50` and `/55` run on the site — and there are
           dozens — under 4.5:1 at a stroke. This is 92% saturated against the
           old ground's 65% and no lighter, so the page reads as ocean without
           quietly demanding a typography migration to pay for it. Colour
           belongs in the accents below; the canvas's job is to hold type. */
        deep: "#032722",
        palm: "#07423C",
        /** Jungle green. Gradient mid-stop, and small text on sand (5.2:1). */
        moss: "#12735D",
        /** Shallow-water aqua. Decorative only — far too light to carry text. */
        mist: "#8FC7BC",
        /** Warm sand. The light canvas the whole site is set on. */
        sand: "#F8F3E7",
        /** A step deeper than sand, for alternating bands and image frames. */
        dune: "#F0E5CC",
        ink: "#0F211C",

        /* ── Copper ─────────────────────────────────────────────────────────
           Untouched by the tropical pass, deliberately. These three are tuned
           against sand and deep to the decimal, they carry every CTA and every
           eyebrow on the site, and a warmer copper drags white-on-copper below
           AA. Vibrancy comes from the grounds and the accents below, not from
           reopening a solved contrast problem. */
        copper: "#B26A3B",
        "copper-light": "#D08A55",
        /** Darker copper for small text on light backgrounds (WCAG AA: 5.9:1) */
        "copper-deep": "#8A4E28",

        /* ── Tropical accents ───────────────────────────────────────────────
           Each has one job and a stated ground, and none is a substitute for
           another. Colour that turns up everywhere stops meaning anything, so
           these are placed, not sprinkled. The three vivid ones are AA on
           `deep` and on `palm` and nowhere else — never set them on `moss` or
           on `ocean-deep`, where all three land between 2:1 and 4.5:1. */

        /** Cool counterweight to copper. Small text on sand: 5.3:1. */
        ocean: "#0B6E7F",
        /**
         * Ocean as a ground, not as ink.
         *
         * Tuned dark on purpose. A prettier, lighter teal here reads better in
         * a swatch and then fails everything set on it: at #06505E the golden
         * eyebrow lands on 4.5:1 exactly and copper-light on 3.2:1. Four steps
         * down, sand is 11.2:1 and mango 6.1:1 — enough that this can be a
         * real ground rather than a decoration. copper-light is still 4.4:1
         * and so is large text only here; use mango instead.
         */
        "ocean-deep": "#043A45",
        /** Vivid turquoise, for accents on the dark grounds (6.5:1 on deep). */
        lagoon: "#23C4C7",
        /** Vivid green, for accents on the dark grounds (6.0:1 on deep). */
        frond: "#3FBF7A",
        /** Golden sun, for accents on the dark grounds (6.9:1 on deep). */
        mango: "#F5A623",

        /** WhatsApp green, darkened so white button text passes AA (5.8:1) */
        wa: "#0F7263",
        "wa-dark": "#0B5C50",
      },
      fontFamily: {
        // Variables are supplied by next/font in app/layout.tsx, which
        // self-hosts both faces and injects matched fallback metrics.
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        /**
         * Fraunces italic, as a separate face — and it must be reached through
         * this utility, never through `font-display italic`.
         *
         * `--font-display` is the variable Fraunces: a wght 100–900 range plus
         * the optical-size axis, which is 66 kB. Asking Google for its italic
         * in the same shape costs another 80 kB — the single largest file the
         * site downloads, and larger than the roman it accompanies. Every
         * italic on this site is one weight (400) at one or two display sizes,
         * so it is loaded as a static 400 instead: 22 kB, pixel-identical
         * everywhere it is actually used.
         *
         * Writing `font-display italic` would silently get you a browser-
         * synthesised slant of the roman rather than Fraunces' true italic —
         * different letterforms (a, e, g are drawn, not sheared), and visibly
         * worse at the display sizes this is used at. Use `font-display-italic`
         * and no `italic` class; the face carries its own style.
         */
        "display-italic": ["var(--font-display-italic)", "Georgia", "serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        wrap: "76rem",
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37,211,102,0.45)" },
          "50%": { boxShadow: "0 0 0 14px rgba(37,211,102,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

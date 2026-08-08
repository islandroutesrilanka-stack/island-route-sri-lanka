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
        deep: "#0B1F19",
        palm: "#16332B",
        moss: "#2C5247",
        mist: "#93ABA1",
        sand: "#F6F1E6",
        dune: "#ECE3D0",
        copper: "#B26A3B",
        "copper-light": "#D08A55",
        /** Darker copper for small text on light backgrounds (WCAG AA: 5.7:1) */
        "copper-deep": "#8A4E28",
        ink: "#101D18",
        /** WhatsApp green, darkened so white button text passes AA (5.8:1) */
        wa: "#0F7263",
        "wa-dark": "#0B5C50",
      },
      fontFamily: {
        // Variables are supplied by next/font in app/layout.tsx, which
        // self-hosts both faces and injects matched fallback metrics.
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
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

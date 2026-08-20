import { useId, type ReactNode } from "react";

/**
 * The flags in the language menu, drawn rather than typed.
 *
 * The obvious way to do this is the emoji: 🇩🇪 is four bytes and no code at
 * all. It is also invisible to a large share of the people who will open this
 * menu. Windows ships no flag glyphs, so Chrome and Edge fall back to painting
 * the two letters the emoji is assembled from, and the column reads
 * "GB DE FR RU" in grey — shown to precisely the European desktop visitors
 * this switcher exists for. Verified, not assumed: that is what this repo's
 * own browser renders.
 *
 * So they are drawn. Twelve pixels tall, a few hundred bytes each, no font, no
 * network, and the same picture on Windows, macOS, Android and iOS.
 *
 * Every flag is built on one 3:2 box, which is what the emoji fonts do as
 * well. The Union Jack is really 2:1 and is squeezed to fit — unnoticeable at
 * this size, and better than one flag standing a third shorter than the seven
 * beside it.
 */

/*
  The hairline is not decoration. Three of these flags are half white and two
  more are white down the middle, and the menu they sit in is sand — without an
  edge of their own they would read as a flag with a bite taken out of it.
*/
const BOX = "h-3 w-[18px] shrink-0 ring-1 ring-ink/15";

function Svg({
  children,
  viewBox = "0 0 30 20",
}: {
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    /* `none`, because the Union Jack is the one flag not drawn on this box and
       letterboxing it would leave a gap the others do not have. */
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={BOX}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* Painted back to front at full width, so no seam can open between bands. */
function Stripes({ c }: { c: readonly [string, string, string] }) {
  return (
    <Svg>
      <rect width="30" height="20" fill={c[2]} />
      <rect width="30" height="13.34" fill={c[1]} />
      <rect width="30" height="6.67" fill={c[0]} />
    </Svg>
  );
}

function Bars({ c }: { c: readonly [string, string, string] }) {
  return (
    <Svg>
      <rect width="30" height="20" fill={c[2]} />
      <rect width="20" height="20" fill={c[1]} />
      <rect width="10" height="20" fill={c[0]} />
    </Svg>
  );
}

/** Keyed by language, not by country — `en` flies the Union Jack. */
export default function Flag({ code }: { code: string }) {
  /*
    Generated, and stripped of the colons React puts in them, because this
    component is on the page twice and `url(#id)` is a URL rather than a
    selector — a duplicate would silently resolve to the other menu's shape.
  */
  const clip = "uj" + useId().replace(/:/g, "");

  switch (code) {
    case "de":
      return <Stripes c={["#000000", "#DD0000", "#FFCE00"]} />;
    case "ru":
      return <Stripes c={["#FFFFFF", "#0039A6", "#D52B1E"]} />;
    case "nl":
      return <Stripes c={["#AE1C28", "#FFFFFF", "#21468B"]} />;
    case "fr":
      return <Bars c={["#002395", "#FFFFFF", "#ED2939"]} />;
    case "it":
      return <Bars c={["#009246", "#FFFFFF", "#CE2B37"]} />;
    case "es":
      /* The arms are a quarter of a millimetre wide at this size, so they are
         left off, exactly as the smallest emoji renderings leave them off. */
      return (
        <Svg>
          <rect width="30" height="20" fill="#AA151B" />
          <rect y="5" width="30" height="10" fill="#F1BF00" />
        </Svg>
      );
    case "ja":
      return (
        <Svg>
          <rect width="30" height="20" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="6" fill="#BC002D" />
        </Svg>
      );
    case "en":
      return (
        <Svg viewBox="0 0 60 30">
          {/* Four triangles, so the red saltire is counterchanged: each arm
              sits on the trailing side of the white one, which is the detail
              that separates a Union Jack from a decorative X. */}
          <clipPath id={clip}>
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
          <path
            d="M0,0 L60,30 M60,0 L0,30"
            clipPath={`url(#${clip})`}
            stroke="#C8102E"
            strokeWidth="4"
          />
          <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
        </Svg>
      );
    default:
      return null;
  }
}

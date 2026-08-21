/**
 * The approved non-photographic treatment.
 *
 * Used wherever a photograph would be wrong rather than merely missing:
 *   • a location-specific slot whose asset is unverified
 *   • a slot retired from generic non-Sri-Lankan stock
 *   • the hero, until a poster is approved
 *
 * The point is that this reads as a deliberate design choice rather than a gap.
 * A wrong photograph damages a travel brand; an elegant abstract panel does not.
 */
import type { ReactNode } from "react";

type Tone = "deep" | "ocean" | "moss" | "sand" | "dune";

/*
  Each tone travels somewhere. The old `deep` ran deep → palm → deep, two
  greens close enough that the panel read as one flat colour with a slight
  bloom; it now crosses into the ocean and back, which is a gradient you can
  actually see. `moss` climbs out of the water into jungle. Both end on `deep`
  so a panel always meets the page's dark ground cleanly at one edge.
*/
const tones: Record<Tone, string> = {
  deep: "from-deep via-ocean-deep to-deep",
  ocean: "from-ocean-deep via-ocean to-deep",
  moss: "from-palm via-moss to-deep",
  sand: "from-dune via-sand to-dune",
  dune: "from-sand via-dune to-mist/40",
};

/**
 * Optional decorative motif.
 *
 * "contour" draws slow topographic curves — an abstract reference to the
 * island's terrain, drawn as geometry rather than borrowed from a photograph.
 * It exists so a panel standing in for missing imagery reads as a designed
 * surface rather than an empty box, without implying anything about a place.
 */
function ContourMotif({ light }: { light: boolean }) {
  /* Aqua on the dark tones rather than the old copper: these curves are read
     as water and terrain, and the warm line fought the teal underneath it
     instead of sitting in it. Carried a little stronger (0.16 → 0.20) because
     a cool line on a cool ground needs it to stay visible at all. */
  const stroke = light ? "rgba(16,29,24,0.10)" : "rgba(143,199,188,0.20)";
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path
          key={i}
          d={`M-40 ${232 - i * 26} C 60 ${196 - i * 27}, 150 ${262 - i * 25}, 232 ${
            210 - i * 26
          } S 360 ${140 - i * 24}, 440 ${168 - i * 26}`}
          fill="none"
          stroke={stroke}
          strokeWidth={i % 3 === 0 ? 1.1 : 0.6}
        />
      ))}
    </svg>
  );
}

export default function GradientPanel({
  tone = "deep",
  className = "",
  children,
  rule = false,
  pattern = "none",
}: {
  tone?: Tone;
  className?: string;
  children?: ReactNode;
  /** Adds a fine copper hairline — useful when the panel stands in for an image. */
  rule?: boolean;
  pattern?: "none" | "contour";
}) {
  const light = tone === "sand" || tone === "dune";

  return (
    <div
      aria-hidden={children ? undefined : true}
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${className}`}
    >
      {pattern === "contour" && <ContourMotif light={light} />}

      {/* Existing grain utility — adds tooth so large flat areas don't band */}
      <div className="grain absolute inset-0" />

      {/* Soft directional light, keeps the panel from reading as a solid fill */}
      <div
        className={`absolute inset-0 ${
          light
            ? "bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.65),transparent_60%)]"
            : "bg-[radial-gradient(120%_90%_at_20%_0%,rgba(178,106,59,0.20),transparent_60%)]"
        }`}
      />

      {rule && (
        <div
          className={`absolute inset-x-6 bottom-6 h-px ${
            light ? "bg-ink/15" : "bg-copper/35"
          }`}
        />
      )}

      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

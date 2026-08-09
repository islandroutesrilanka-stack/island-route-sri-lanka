/**
 * MediaAsset-aware image.
 *
 * Components pass a MediaAsset, never a URL string. That indirection is what
 * lets stock assets be replaced with original photography later without any
 * component changing.
 *
 * Two behaviours worth knowing:
 *
 *   • `requireVerifiedLocation` — set this wherever the image is claiming to
 *     show a specific named place. An unverified asset renders the gradient
 *     treatment instead of a photograph that might be somewhere else entirely.
 *
 *   • A null asset is a supported, designed state, not an error. Slots without
 *     approved photography degrade to the treatment rather than to a gap.
 */
import NextImage from "next/image";
import type { MediaAsset } from "@/lib/media/types";
import { focalOf, isLocationVerified } from "@/lib/media/types";
import GradientPanel from "./GradientPanel";

export default function Img({
  asset,
  sizes,
  priority = false,
  className = "",
  fallbackTone = "deep",
  fallbackPattern = "none",
  requireVerifiedLocation = false,
  quality,
}: {
  asset: MediaAsset | null | undefined;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackTone?: "deep" | "moss" | "sand" | "dune";
  /** Passed through to GradientPanel so a blocked slot still reads as designed. */
  fallbackPattern?: "none" | "contour";
  /** True for destination-specific slots. Gates on provenance.verifiedLocation. */
  requireVerifiedLocation?: boolean;
  quality?: number;
}) {
  const blocked = requireVerifiedLocation && !isLocationVerified(asset);

  if (!asset || blocked) {
    return (
      <GradientPanel
        tone={fallbackTone}
        pattern={fallbackPattern}
        className={`h-full w-full ${className}`}
      />
    );
  }

  return (
    <NextImage
      src={asset.src}
      alt={asset.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      placeholder={asset.blurDataURL ? "blur" : "empty"}
      blurDataURL={asset.blurDataURL}
      style={{ objectPosition: focalOf(asset) }}
      className={`object-cover ${className}`}
    />
  );
}

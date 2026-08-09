/**
 * Media contracts.
 *
 * The single rule that makes stock → original replacement possible without
 * touching a component: **components never receive a bare URL string.** They
 * receive a MediaAsset. Swapping an asset is then a data change, never a code
 * change — which is the entire point of this module.
 */

/** Where an asset came from, and whether its location claim has been checked. */
export type MediaProvenance =
  | {
      kind: "stock";
      /** e.g. "Pexels" */
      source: string;
      /** Direct link to the asset's source page, for licence audit and replacement. */
      url: string;
      /** e.g. "Pexels License" */
      license: string;
      /**
       * TRUE only when a human has opened the source page and confirmed the
       * image shows the place it claims to show.
       *
       * Never set this to true on the strength of a filename, a search term or
       * an uploader's title. Stock libraries match keywords loosely: a search
       * for "Arugam Bay" returns tens of thousands of results, most of which
       * are not Sri Lanka, let alone Arugam Bay.
       */
      verifiedLocation: boolean;
    }
  | {
      kind: "original";
      photographer?: string;
      /** ISO date or free text — when and where it was shot. */
      shotAt?: string;
      /** Original photography of a known location is verified by definition. */
      verifiedLocation?: true;
    }
  | {
      kind: "cms";
      /** Uploaded through the admin; verification is the uploader's responsibility. */
      verifiedLocation?: boolean;
    }
  | {
      kind: "placeholder";
      /** Why this exists and what should replace it. */
      note: string;
    };

/** CSS object-position. Keeps the subject in frame when a wide crop is applied. */
export type FocalPoint = `${number}% ${number}%`;

export type MediaAsset = {
  src: string;
  /** Only where a genuinely different crop helps — not a smaller copy of the same image. */
  mobileSrc?: string;
  /**
   * Required, not optional. An asset without alt text fails typecheck, which
   * is the cheapest accessibility guarantee available.
   */
  alt: string;
  focal?: FocalPoint;
  width?: number;
  height?: number;
  blurDataURL?: string;
  /**
   * The place this asset claims to show, e.g. "Sigiriya, Cultural Triangle".
   * Present only on location-specific assets. Makes "which image claims to be
   * Sigiriya?" a greppable question with a machine-readable answer.
   */
  depicts?: string;
  provenance: MediaProvenance;
};

export type VideoSource = {
  src: string;
  type: "video/webm" | "video/mp4";
};

export type VideoAsset = {
  /**
   * ALWAYS present. The video is optional; the poster is not — it is the LCP
   * element and the permanent fallback.
   */
  poster: MediaAsset | null;
  sources: VideoSource[];
  /** Empty at launch by decision — mobile uses the poster only. */
  mobileSources: VideoSource[];
};

/* --------------------------------- Guards ---------------------------------- */

/**
 * True when an asset may be used to represent a specific named place.
 *
 * Destination-specific slots must gate on this. An asset that fails renders the
 * non-photographic treatment instead of a photograph that might be somewhere else.
 */
export function isLocationVerified(asset: MediaAsset | null | undefined): boolean {
  if (!asset) return false;
  const p = asset.provenance;
  if (p.kind === "placeholder") return false;
  if (p.kind === "original") return true;
  return p.verifiedLocation === true;
}

/** True for development-only placeholders, which must never reach production. */
export function isPlaceholder(asset: MediaAsset | null | undefined): boolean {
  return asset?.provenance.kind === "placeholder";
}

/** Resolved object-position, defaulting to centre. */
export function focalOf(asset: MediaAsset): FocalPoint {
  return asset.focal ?? "50% 50%";
}

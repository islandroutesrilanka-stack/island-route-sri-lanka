/**
 * @deprecated Compatibility shim.
 *
 * This module used to hold every image URL as a flat map. It is now a thin
 * re-export over lib/media/registry.ts, which carries source, licence, alt text
 * and location-verification status per asset.
 *
 * It is kept because 19 files import from here — every public page plus all four
 * seed-content modules. Removing it mid-redesign would touch the entire codebase
 * for no benefit. Each page drops its import as its own phase migrates it to the
 * typed registry, and this file is deleted when the last importer is gone.
 *
 * New code: import { media } from "@/lib/media/registry" and pass MediaAsset
 * objects to <Img>. Do not add URLs here.
 */
export { legacyImg as img, toOgImage, ogDefault } from "./media/registry";

/** @deprecated Use MediaKey from lib/media/registry. */
export type ImageKey =
  | "heroTrain"
  | "sigiriya"
  | "templeKandy"
  | "beachPanorama"
  | "beachPalms"
  | "beachAerial"
  | "beachChairs"
  | "beachSunset"
  | "surfWave"
  | "seaTurtle"
  | "mistyHills"
  | "greenMountains"
  | "forest"
  | "sunraysValley"
  | "lakeCanoe"
  | "mountainLake"
  | "elephants"
  | "elephantHerd"
  | "leopard"
  | "safariJeep"
  | "coastalDrive"
  | "drivingWheel"
  | "sedanNight"
  | "cityLights";

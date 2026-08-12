/**
 * Social-image helpers.
 *
 * This module used to be a compatibility shim: a flat `img` map of image URLs
 * kept alive so that nineteen importers — every public page plus the four seed
 * content modules — would keep compiling while the site migrated to the typed
 * registry one phase at a time. That migration is finished. `img` and its
 * `ImageKey` union are gone, along with the eighteen hotlinked Unsplash assets
 * behind them; see the notes in lib/media/registry.ts for why.
 *
 * What is left are the two social-metadata helpers, which have nothing to do
 * with rendering and are imported by `app/layout.tsx`, `app/blog/[slug]` and
 * `app/tours/[slug]` from here.
 *
 * For anything a visitor will actually see: import { media } from
 * "@/lib/media/registry" (or `commonsPlaces` from "@/lib/media/commons") and
 * pass whole MediaAsset objects to <Img>. Do not add URLs to this file.
 */
export { toOgImage, ogDefault } from "./media/registry";

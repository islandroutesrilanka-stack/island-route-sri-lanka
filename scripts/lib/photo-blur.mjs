/**
 * Blur placeholders, without an image library.
 *
 * ── The problem ────────────────────────────────────────────────────────────
 *
 * next/image's `placeholder="blur"` wants a `blurDataURL`: a tiny image,
 * inlined as a data: URI, that it paints instantly and cross-fades out of.
 * For a static import Next generates one at build time. For a remote URL —
 * which is what every photograph in Supabase Storage is — it cannot, so the
 * value has to be produced here and stored alongside the row.
 *
 * The usual way to produce one is sharp. This machine has no sharp, no
 * ImageMagick and no ffmpeg, and adding a native image dependency to a project
 * that does not otherwise need one is a poor trade for ~700 bytes per photo.
 *
 * ── The substitute ─────────────────────────────────────────────────────────
 *
 * Playwright is already a devDependency, and Chromium is a complete image
 * pipeline: it decodes JPEG, scales with a decent filter, and re-encodes
 * through libjpeg-turbo via `canvas.toDataURL("image/jpeg", q)`. Drawing a
 * 4032px photograph into a 10px-wide canvas and encoding that at quality 0.5
 * produces a 500–900 byte data URI that is indistinguishable in purpose from
 * sharp's output.
 *
 * ── Why the original is base64'd in rather than loaded from disk ───────────
 *
 * The obvious implementation points the <img> at a `file://` URL. It decodes
 * fine and reports correct dimensions, and then `toDataURL` throws:
 *
 *     SecurityError: Tainted canvases may not be exported.
 *
 * Chromium gives every local file its own opaque origin, so one file:// image
 * is cross-origin to another file:// document and taints any canvas it is
 * drawn into — reading pixels back out is exactly what tainting forbids. The
 * fix is not a browser flag; it is to stop crossing an origin boundary at all.
 * A `data:` URI has no origin to cross, so the file is read in Node, handed
 * over as base64, and the canvas stays clean. It also means this works on a
 * blank page with no HTML harness on disk.
 *
 * Results are cached to disk, keyed by content hash, because this is the slow
 * part of the upload and nothing about a photograph's blur changes between
 * runs.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

/** Width in pixels of the generated placeholder. Height follows the ratio. */
const LQIP_WIDTH = 10;
const LQIP_QUALITY = 0.5;

/**
 * @param {{slug: string, file: string, md5: string}[]} entries
 * @param {string} srcDir      directory holding the original files
 * @param {string} cachePath   JSON file to read and write
 * @returns {Promise<Record<string, string>>} slug -> data URI
 */
export async function ensureBlurCache(entries, srcDir, cachePath) {
  /** @type {Record<string, {md5: string, blur: string}>} */
  const cache = existsSync(cachePath)
    ? JSON.parse(readFileSync(cachePath, "utf8"))
    : {};

  const todo = entries.filter((e) => cache[e.slug]?.md5 !== e.md5);
  if (todo.length === 0) {
    return Object.fromEntries(entries.map((e) => [e.slug, cache[e.slug].blur]));
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Blur placeholders need Playwright's Chromium.\n" +
        "  npm i -D playwright && npx playwright install chromium\n" +
        "Then run this again — already-generated placeholders are cached.",
    );
  }

  process.stdout.write(`Generating ${todo.length} blur placeholder(s)…\n`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    for (const e of todo) {
      const bytes = readFileSync(path.join(srcDir, e.file));
      const src = `data:image/jpeg;base64,${bytes.toString("base64")}`;

      const blur = await page.evaluate(
        async ([src, w, q]) => {
          const img = new Image();
          img.src = src;
          await img.decode();
          const h = Math.max(
            1,
            Math.round((w * img.naturalHeight) / img.naturalWidth),
          );
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          return canvas.toDataURL("image/jpeg", q);
        },
        [src, LQIP_WIDTH, LQIP_QUALITY],
      );

      if (!blur.startsWith("data:image/jpeg")) {
        throw new Error(`Placeholder for ${e.slug} came back unencodable`);
      }
      cache[e.slug] = { md5: e.md5, blur };
      process.stdout.write(`  ${e.slug} — ${blur.length} chars\n`);
    }
  } finally {
    await browser.close();
  }

  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
  return Object.fromEntries(entries.map((e) => [e.slug, cache[e.slug].blur]));
}

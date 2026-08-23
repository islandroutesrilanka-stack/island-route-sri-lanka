/**
 * Download a Commons file into public/commons/ at a sane width, and print the
 * registry fields that go with it.
 *
 * The registry demands `width`, `height`, `author` and the licence string, and
 * getting any of them wrong is either a layout bug or a licence breach. The
 * Wellness tile shipped declaring 1920x1280 for a file that was 900x600 at
 * source, so it was upscaled across a full-height hero. This prints what the
 * API actually says, from the same request that fetches the bytes.
 *
 *   node scripts/commons-fetch.mjs 2400 "Some File.jpg" some-file
 *
 * Third argument is the slug the file lands under; it defaults to a slugified
 * title. Nothing is overwritten without --force.
 */
import { writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const UA = "IslandRouteSiteBuild/1.0 (https://islandroutesrilanka.com)";
const API = "https://commons.wikimedia.org/w/api.php";
const OUT = "public/commons";

const args = process.argv.slice(2).filter((a) => a !== "--force");
const force = process.argv.includes("--force");
const [widthArg, title, slugArg] = args;

if (!widthArg || !title) {
  console.error('usage: node scripts/commons-fetch.mjs <width> "File.jpg" [slug]');
  process.exit(1);
}

const slug =
  slugArg ??
  title
    .replace(/\.[a-zA-Z]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const url =
  `${API}?action=query&format=json&titles=${encodeURIComponent("File:" + title)}` +
  `&prop=imageinfo&iiprop=url|size|extmetadata` +
  `&iiextmetadatafilter=LicenseShortName|Artist|ImageDescription` +
  `&iiurlwidth=${widthArg}`;

const res = await fetch(url, { headers: { "User-Agent": UA } });
const page = Object.values((await res.json()).query.pages)[0];
const ii = page?.imageinfo?.[0];
if (!ii) {
  console.error(`no such file: ${title}`);
  process.exit(1);
}

const out = join(OUT, `${slug}.jpg`);
const exists = await access(out).then(
  () => true,
  () => false,
);
if (exists && !force) {
  console.error(`${out} already exists; pass --force to overwrite`);
  process.exit(1);
}

/* The thumbnail is what gets committed. Originals here run to 8000px and 20MB,
   which is bytes nobody downloads: Next resizes on demand and the largest
   `sizes` any of these is asked for is the full viewport width. */
const bytes = await fetch(ii.thumburl ?? ii.url, {
  headers: { "User-Agent": UA },
}).then((r) => r.arrayBuffer());
await writeFile(out, Buffer.from(bytes));

const strip = (h) =>
  (h ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const m = ii.extmetadata ?? {};
console.log(`wrote ${out}  ${Math.round(bytes.byteLength / 1024)} KB`);
console.log(`  source     ${ii.width}x${ii.height}`);
console.log(`  width:     ${ii.thumbwidth ?? ii.width},`);
console.log(`  height:    ${ii.thumbheight ?? ii.height},`);
console.log(`  author:    ${JSON.stringify(strip(m.Artist?.value))},`);
console.log(`  license:   ${JSON.stringify(strip(m.LicenseShortName?.value))},`);
console.log(
  `  url:       ${JSON.stringify("https://commons.wikimedia.org/wiki/" + encodeURIComponent(page.title.replace(/ /g, "_")))},`,
);
console.log(`  describes  ${strip(m.ImageDescription?.value).slice(0, 200)}`);

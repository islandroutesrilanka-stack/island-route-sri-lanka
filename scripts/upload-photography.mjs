/**
 * Uploads the owner's photographs to Supabase Storage and writes their rows.
 *
 *   node scripts/upload-photography.mjs            # upload what is missing
 *   node scripts/upload-photography.mjs --dry-run  # say what it would do
 *   node scripts/upload-photography.mjs --force    # re-upload files already there
 *
 * ── What it uploads ────────────────────────────────────────────────────────
 *
 * Only the frames marked `publish: true` in scripts/photography.manifest.json.
 * Everything else is held — mostly because it shows a recognisable guest, and
 * that is a consent decision rather than a technical one. To release a held
 * frame, open scripts/build-photography-manifest.mjs, give its row a caption,
 * alt, category and folder, remove its `hold`, re-run the builder and re-run
 * this. The decision then lives in version control next to the reason for it,
 * which is where a decision like that belongs — not in a command-line flag
 * nobody can audit six months later.
 *
 * ── Where the files go ─────────────────────────────────────────────────────
 *
 *     media/photography/<folder>/<slug>.jpg
 *
 * Deterministic, unlike the admin picker's `${Date.now()}-${stem}` names. The
 * picker has to assume the admin might upload a different picture under a name
 * another record still points at, so it never overwrites. Here the slug *is*
 * the identity of the photograph: the same slug always means the same frame, so
 * a re-run should replace the file rather than leave two copies in the bucket.
 * That is the whole reason `upsert` differs between the two.
 *
 * Folders group by subject, not by page — heritage, wildlife, hill-country,
 * journeys, coast, table. A photograph of an elephant is a photograph of an
 * elephant whether it ends up on the gallery, a journey card or the homepage,
 * and filing by page would mean re-uploading it to move it.
 *
 * ── Why the service role key ───────────────────────────────────────────────
 *
 * Both halves of the job are gated on `public.is_admin()`: the storage insert
 * by media-bucket-policies.sql, the row insert by gallery_admin_write in
 * schema.sql. A script has no signed-in session to satisfy either, so it needs
 * the service role, which bypasses RLS by design.
 *
 * That key is a full-database credential. It is read from .env.local, is never
 * printed, never interpolated into a URL, and never written to the manifest or
 * any cache. Keep it out of the Vercel client environment — nothing in the
 * browser bundle needs it, and `SUPABASE_SERVICE_ROLE_KEY` deliberately lacks
 * the NEXT_PUBLIC_ prefix so Next cannot expose it even by accident.
 *
 * ── Before the first run ───────────────────────────────────────────────────
 *
 *   1. Run supabase/add-gallery-metadata.sql in the Supabase SQL editor.
 *   2. Add to .env.local:  SUPABASE_SERVICE_ROLE_KEY=…
 *      (Supabase dashboard → Project Settings → API → service_role, "secret")
 *   3. node scripts/build-photography-manifest.mjs
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { ensureBlurCache } from "./lib/photo-blur.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SRC =
  process.env.PHOTO_SRC || "C:/Users/whisk/OneDrive/Documents/island route/Images";

const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

const BUCKET = "media";
const PREFIX = "photography";

/** The order folders are interleaved in. See `assignSort`. */
const FOLDER_ROTATION = [
  "journeys",
  "wildlife",
  "coast",
  "heritage",
  "hill-country",
  "table",
];

/* ── env ────────────────────────────────────────────────────────────────── */

/**
 * .env.local, parsed just enough. dotenv is not a dependency of this project
 * and Next loads these itself at runtime, so a standalone script has to.
 */
function loadEnvLocal() {
  const f = path.join(ROOT, ".env.local");
  if (!existsSync(f)) return;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function die(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

if (!SUPABASE_URL) die("NEXT_PUBLIC_SUPABASE_URL is not set in .env.local.");
if (!SERVICE_KEY && !DRY) {
  die(
    "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n\n" +
      "Both the storage upload and the gallery insert are gated on is_admin(),\n" +
      "so this script needs the service role key to run at all.\n\n" +
      "  Supabase dashboard → Project Settings → API → service_role (secret)\n" +
      "  Add to .env.local as:  SUPABASE_SERVICE_ROLE_KEY=…\n\n" +
      "Do not add it to Vercel's environment — nothing deployed needs it.\n" +
      "Re-run with --dry-run to see the plan without it.",
  );
}

/* ── the plan ───────────────────────────────────────────────────────────── */

const manifestPath = path.join(HERE, "photography.manifest.json");
if (!existsSync(manifestPath)) {
  die("scripts/photography.manifest.json is missing.\n  node scripts/build-photography-manifest.mjs");
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const publishable = manifest.filter((m) => m.publish);

if (publishable.length === 0) die("Nothing in the manifest is marked publish.");

for (const m of publishable) {
  const f = path.join(SRC, m.file);
  if (!existsSync(f)) die(`Missing source file for ${m.slug}:\n  ${f}`);
  if (!m.alt) die(`${m.slug} has no alt text. Every published image needs one.`);
  if (!m.caption) die(`${m.slug} has no caption.`);
  if (!m.category) die(`${m.slug} has no gallery category.`);
}

/**
 * Sort order, interleaved across folders.
 *
 * The gallery's default view is "All", and a naive sort — by folder, or by the
 * order the files happen to sit in — shows thirteen elephants in a row and then
 * thirteen temples. Rotating through the folders means the first screenful
 * reads as a portrait of the whole island rather than one afternoon in a
 * national park. The filter buttons still group them when a visitor wants that.
 */
function assignSort(rows) {
  const buckets = new Map();
  for (const r of rows) {
    if (!buckets.has(r.folder)) buckets.set(r.folder, []);
    buckets.get(r.folder).push(r);
  }
  // Strongest frame first within each folder: the biggest file at a given
  // ratio is the sharpest, and landscape frames open the grid better.
  for (const list of buckets.values()) {
    list.sort((a, b) => b.width * b.height - a.width * a.height);
  }
  const rotation = [
    ...FOLDER_ROTATION.filter((f) => buckets.has(f)),
    ...[...buckets.keys()].filter((f) => !FOLDER_ROTATION.includes(f)).sort(),
  ];
  const out = [];
  for (let i = 0; out.length < rows.length; i++) {
    for (const folder of rotation) {
      const next = buckets.get(folder)[i];
      if (next) out.push(next);
    }
  }
  return out.map((r, i) => ({ ...r, sort: (i + 1) * 10 }));
}

const ordered = assignSort(publishable);

/* ── blur placeholders ──────────────────────────────────────────────────── */

const blurs = await ensureBlurCache(
  ordered,
  SRC,
  path.join(HERE, "photography.blur.json"),
);

/* ── upload ─────────────────────────────────────────────────────────────── */

const sb = SERVICE_KEY
  ? createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/** Files already in the bucket, so a re-run is cheap and idempotent. */
async function existingPaths() {
  if (!sb) return new Set();
  const found = new Set();
  for (const folder of new Set(ordered.map((r) => r.folder))) {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .list(`${PREFIX}/${folder}`, { limit: 1000 });
    if (error) {
      // A folder that has never been written to is reported as empty by some
      // versions and as an error by others. Neither is fatal.
      continue;
    }
    for (const f of data ?? []) found.add(`${PREFIX}/${folder}/${f.name}`);
  }
  return found;
}

const already = await existingPaths();

const rows = [];
let uploaded = 0;
let skipped = 0;

for (const r of ordered) {
  const key = `${PREFIX}/${r.folder}/${r.slug}.jpg`;
  const local = path.join(SRC, r.file);
  const mb = (statSync(local).size / 1048576).toFixed(1);

  if (DRY) {
    console.log(`would upload  ${key}  (${mb}MB, ${r.width}×${r.height})`);
  } else if (already.has(key) && !FORCE) {
    skipped++;
  } else {
    const body = readFileSync(local);
    const { error } = await sb.storage.from(BUCKET).upload(key, body, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      // Deterministic path, stable identity: replacing is the correct
      // behaviour here, and the opposite of what the admin picker wants.
      upsert: true,
    });
    if (error) die(`Upload failed for ${key}:\n  ${error.message}`);
    uploaded++;
    console.log(`uploaded  ${key}  (${mb}MB)`);
  }

  const src = sb
    ? sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
    : `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;

  rows.push({
    slug: r.slug,
    src,
    caption: r.caption,
    alt: r.alt,
    category: r.category,
    place: r.place,
    width: r.width,
    height: r.height,
    blur_data_url: blurs[r.slug],
    published: true,
    sort: r.sort,
  });
}

/* ── rows ───────────────────────────────────────────────────────────────── */

if (DRY) {
  console.log(`\n${rows.length} gallery rows would be written:\n`);
  for (const r of rows) {
    console.log(
      `  ${String(r.sort).padStart(4)}  ${r.category.padEnd(9)} ${r.slug}` +
        `${r.place ? `  · ${r.place}` : ""}`,
    );
  }
  console.log(
    `\nDry run — nothing uploaded, nothing written.` +
      `\n${manifest.length - rows.length} frames held back; see the review sheet.`,
  );
  process.exit(0);
}

const { error: rowErr } = await sb
  .from("gallery")
  .upsert(rows, { onConflict: "slug" });
if (rowErr) {
  die(
    `The files uploaded but the rows did not:\n  ${rowErr.message}\n\n` +
      (rowErr.message.includes("slug") || rowErr.message.includes("column")
        ? "That looks like the migration not having run yet:\n" +
          "  supabase/add-gallery-metadata.sql"
        : ""),
  );
}

console.log(
  `\n${uploaded} uploaded, ${skipped} already present, ${rows.length} rows written.`,
);
console.log(
  `${manifest.length - rows.length} frames held back — run` +
    ` \`node scripts/review-photography.mjs\` to review them.`,
);

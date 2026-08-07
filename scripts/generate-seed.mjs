/**
 * Generates supabase/seed.sql from the built-in starter content in lib/.
 * Run: npm run generate:seed
 */
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

async function load(entry) {
  const out = `node_modules/.seedtmp-${entry.replace(/[\/.]/g, "_")}.mjs`;
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: out,
    logLevel: "silent",
  });
  return import(pathToFileURL(out).href);
}

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
const j = (v) => `${q(JSON.stringify(v ?? []))}::jsonb`;

const { tours } = await load("lib/tours.ts");
const { destinations } = await load("lib/destinations.ts");
const { services, fleet, reviews, gallery } = await load("lib/content.ts");
const { posts } = await load("lib/blog.ts");
const { site } = await load("lib/site.ts");

let sql = `-- Generated starter content. Run after schema.sql.\n\n`;

sql += tours
  .map(
    (t, i) =>
      `insert into public.tours (slug,title,category,duration,price_from,image,excerpt,highlights,includes,itinerary,featured,sort) values (${q(t.slug)},${q(t.title)},${q(t.category)},${q(t.duration)},${t.priceFrom},${q(t.image)},${q(t.excerpt)},${j(t.highlights)},${j(t.includes)},${t.itinerary ? j(t.itinerary) : "null"},${!!t.featured},${i}) on conflict (slug) do nothing;`
  )
  .join("\n");

sql += "\n\n" + destinations
  .map(
    (d, i) =>
      `insert into public.destinations (slug,name,region,headline,description,best_for,best_time,highlights,image,sort) values (${q(d.slug)},${q(d.name)},${q(d.region)},${q(d.headline)},${q(d.description)},${j(d.bestFor)},${q(d.bestTime)},${j(d.highlights)},${q(d.image)},${i}) on conflict (slug) do nothing;`
  )
  .join("\n");

sql += "\n\n" + services
  .map(
    (s, i) =>
      `insert into public.services (slug,name,tagline,description,image,icon,sort) values (${q(s.slug)},${q(s.name)},${q(s.tagline)},${q(s.description)},${q(s.image)},${q(s.icon)},${i}) on conflict (slug) do nothing;`
  )
  .join("\n");

sql += "\n\n" + fleet
  .map(
    (v, i) =>
      `insert into public.vehicles (slug,name,category,passengers,luggage,features,ideal_for,image,sort) values (${q(v.slug)},${q(v.name)},${q(v.category)},${v.passengers},${q(v.luggage)},${j(v.features)},${q(v.idealFor)},${q(v.image)},${i}) on conflict (slug) do nothing;`
  )
  .join("\n");

sql += "\n\n" + reviews
  .map(
    (r, i) =>
      `insert into public.reviews (name,country,trip,rating,text,sort) values (${q(r.name)},${q(r.country)},${q(r.trip)},${r.rating},${q(r.text)},${i});`
  )
  .join("\n");

sql += "\n\n" + posts
  .map(
    (p) =>
      `insert into public.posts (slug,title,excerpt,date,read_time,image,sections) values (${q(p.slug)},${q(p.title)},${q(p.excerpt)},${q(p.date)},${q(p.readTime)},${q(p.image)},${j(p.sections)}) on conflict (slug) do nothing;`
  )
  .join("\n");

sql += "\n\n" + gallery
  .map(
    (g, i) =>
      `insert into public.gallery (src,caption,category,sort) values (${q(g.src)},${q(g.caption)},${q(g.category)},${i});`
  )
  .join("\n");

const settings = {
  site_name: site.name,
  tagline: site.tagline,
  phone_display: site.phoneDisplay,
  phone_e164: site.phoneE164,
  whatsapp_number: site.whatsappNumber,
  email: site.email,
  address: site.address,
  seo_title: `${site.name} — Private Tours, Transfers & Tailor-Made Journeys`,
  seo_description: site.description,
  seo_keywords:
    "Sri Lanka tours, Sri Lanka private driver, Colombo airport transfer, Yala safari, Sri Lanka tour packages",
};
sql += "\n\n" + Object.entries(settings)
  .map(
    ([k, v]) =>
      `insert into public.site_settings (key,value) values (${q(k)},${q(v)}) on conflict (key) do update set value = excluded.value;`
  )
  .join("\n");

sql += "\n\n-- Example drivers (edit in the admin dashboard)\n";
sql += [
  ["Gayan", "+94778010391", ["English", "Sinhala"]],
  ["Nuwan", "+94770000001", ["English", "Sinhala", "German"]],
  ["Kasun", "+94770000002", ["English", "Sinhala"]],
]
  .map(
    ([n, p, langs]) =>
      `insert into public.drivers (name,phone,languages) select ${q(n)},${q(p)},${j(langs)} where not exists (select 1 from public.drivers where name = ${q(n)});`
  )
  .join("\n");

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", sql + "\n");
console.log(`Wrote supabase/seed.sql`);

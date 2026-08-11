-- ─────────────────────────────────────────────────────────────────────────────
-- Hero slideshow — settings rows.
--
-- ADDITIVE AND IDEMPOTENT. No table is created, altered or dropped: the hero
-- slideshow reuses the existing `site_settings` key/value table, because the
-- data is a short ordered list with no relations and no independent lifecycle.
-- A dedicated table would have meant a migration, its own RLS policies and a
-- join, to store what a textarea expresses perfectly.
--
-- `on conflict (key) do nothing` means running this twice is harmless and it
-- will never overwrite choices you have already made in Admin.
--
-- Only landscape photographs with a verified location are seeded here.
-- Kandy and Colombo are verified but portrait (2:3); cropped to a 21:9 hero
-- they lose their subject. Nuwara Eliya has no verified photograph at all.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.site_settings (key, value) values
  ('hero_slideshow_enabled', 'true'),
  ('hero_slide_duration',    '7'),
  ('hero_slides',
   '/photography/sigiriya-rock.jpg
/photography/nine-arch-bridge-demodara.jpg
/photography/arugam-bay.jpg
/photography/mirissa-coconut-tree-hill.jpg
/photography/yala-leopard.jpg')
on conflict (key) do nothing;

-- Check:
--   select key, value from public.site_settings where key like 'hero_%' order by key;

-- To change the running order, the images or the pace later, edit
-- Admin → Settings → Homepage hero. No SQL and no code change is needed.

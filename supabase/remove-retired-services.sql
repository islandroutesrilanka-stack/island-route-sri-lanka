-- Phase 3 — remove the three tour-duplicating services from the live database.
--
-- Day Tours, Multi-Day Tours and Safari Tours were not services: they restated
-- the journey catalogue in different words, competing with /tours for the same
-- searches. /services is now transport and driver hire only.
--
-- The application already filters these slugs out (retiredServiceSlugs in
-- lib/data.ts), so the site is correct with or without this script. Running it
-- just stops the rows showing up in the admin dashboard's Services list.
--
-- Safe to run more than once. Run it in the Supabase SQL editor.

-- Check first — this should return exactly the three rows below, nothing else.
select slug, name from public.services
where slug in ('day-tours', 'multi-day-tours', 'safari-tours');

-- Then delete them.
delete from public.services
where slug in ('day-tours', 'multi-day-tours', 'safari-tours');

-- Expected remaining six:
--   airport-transfers, private-driver-hire, taxi-services,
--   surf-transfers, hotel-transfers, custom-itineraries
select slug, name from public.services order by slug;

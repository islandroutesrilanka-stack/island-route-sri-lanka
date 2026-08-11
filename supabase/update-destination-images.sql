-- ─────────────────────────────────────────────────────────────────────────────
-- Point the seven verified destination photographs at the live database.
--
-- WHY THIS FILE EXISTS
-- seed.sql uses `on conflict (slug) do nothing`, so re-running it will NOT
-- change rows that already exist. If the `destinations` table has been seeded,
-- the site keeps serving the old stock URLs no matter what lib/destinations.ts
-- says — the data layer reads Supabase first and falls back to the seed file
-- only when the table is empty.
--
-- Run this in the Supabase SQL editor, or update the same fields through
-- Admin → Content → Destinations. Either is fine; this is just faster.
--
-- SAFE TO RE-RUN. Each statement is idempotent and scoped to one slug. Nothing
-- is deleted and no other column is touched.
--
-- Assets live in public/photography/ and must be deployed with the app.
-- ─────────────────────────────────────────────────────────────────────────────

-- Verified from the frame: rock profile and water-garden approach path.
update public.destinations
   set image = '/photography/sigiriya-rock.jpg'
 where slug = 'sigiriya';

-- Verified from the frame: octagonal Pattirippuwa tower and moat parapet.
update public.destinations
   set image = '/photography/kandy-tooth-relic-temple.jpg'
 where slug = 'kandy';

-- Verified from the frame: nine-arch viaduct, tunnel mouth, SLR livery.
update public.destinations
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'ella';

-- Verified by the site owner's direct confirmation (Yala National Park).
update public.destinations
   set image = '/photography/yala-leopard.jpg'
 where slug = 'yala';

-- Verified from the frame: legible "Pedlar's Inn Café" signage, Pedlar Street.
update public.destinations
   set image = '/photography/galle-fort-pedlar-street.jpg'
 where slug = 'galle';

-- Verified from the frame: Coconut Tree Hill, corroborated by a second
-- independent aerial photograph of the same headland.
update public.destinations
   set image = '/photography/mirissa-coconut-tree-hill.jpg'
 where slug = 'mirissa';

-- Verified from the frame: the Lotus Tower, Colombo's one unmistakable landmark.
update public.destinations
   set image = '/photography/colombo-lotus-tower.jpg'
 where slug = 'colombo';

-- DELIBERATELY ABSENT: nuwara-eliya and arugam-bay.
-- No candidate photograph could be tied to either place. They keep their
-- current values, which fail the verifiedLocation gate and therefore render the
-- GradientPanel treatment rather than a photograph captioned with a place it
-- may not show. Leave them alone until a verified image exists.

-- Check the result:
--   select slug, image from public.destinations order by slug;

-- ─────────────────────────────────────────────────────────────────────────────
-- TOURS — one row, same problem.
--
-- 'essential-sri-lanka-7-days' pointed at a stock asset that renders limestone
-- karst with long-tail boats: Southeast Asia, not Sri Lanka. Replaced with the
-- verified Nine Arch Bridge photograph, which the tour's own Day 4 itinerary
-- (the Kandy–Ella railway) actually describes.
-- ─────────────────────────────────────────────────────────────────────────────
update public.tours
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'essential-sri-lanka-7-days';

-- Check:  select slug, image from public.tours order by slug;

-- ─────────────────────────────────────────────────────────────────────────────
-- ARUGAM BAY — added once the owner supplied his own photography.
--
-- Owner's location mapping, verbatim: "Arugam Bay: 49, 50, 51, 13, 06, 07, 09,
-- 48, 47". Frame 49 selected for the destination card. Registered as
-- kind: "original" — original photography of a known location is verified by
-- definition under MediaProvenance.
--
-- NUWARA ELIYA is still deliberately absent: nothing in the owner's batch is
-- highland or tea country, so it keeps its fallback and renders the gradient.
-- ─────────────────────────────────────────────────────────────────────────────
update public.destinations
   set image = '/photography/arugam-bay.jpg'
 where slug = 'arugam-bay';

-- ─────────────────────────────────────────────────────────────────────────────
-- Point the four journal posts at photographs that are actually Sri Lanka.
--
-- WHY THIS FILE EXISTS
-- seed.sql uses `on conflict (slug) do nothing`, so re-running it will NOT
-- change rows that already exist. If `public.posts` has been seeded, the site
-- keeps serving the old stock URLs no matter what lib/blog.ts says — the data
-- layer reads Supabase first and falls back to the seed file only when the
-- table is empty.
--
-- WHAT WAS WRONG
-- All four images came from the retired flat image map, and all four made a
-- location claim nobody had checked:
--
--   ultimate-10-day-sri-lanka-itinerary  heroTrain      limestone karst with
--                                                       long-tail boats — not
--                                                       Sri Lanka at all
--   when-to-visit-sri-lanka              beachPanorama  generic tropical beach
--   yala-vs-wilpattu-safari              leopard        a leopard, no location
--   south-coast-beach-guide              beachPalms     generic palms
--
-- Each is replaced by an asset from lib/media/registry.ts carrying
-- `verifiedLocation: true`, chosen to match what the post is actually about.
--
-- Run this in the Supabase SQL editor, or update the same field through
-- Admin → Content → Blog. Either is fine; this is just faster.
--
-- SAFE TO RE-RUN. Each statement is idempotent and scoped to one slug. Nothing
-- is deleted and no other column is touched.
--
-- Assets live in public/photography/ and must be deployed with the app.
--
-- NOTE: the app defends itself in the meantime. `getPosts` in lib/data.ts
-- replaces a stored image that resolves to a known-unverified registry asset
-- with the seed's choice, so the journal renders correctly even before this
-- runs. Running it makes that substitution unnecessary rather than merely
-- invisible.
-- ─────────────────────────────────────────────────────────────────────────────

-- The post's own copy names the Nine Arch Bridge and "the most beautiful train
-- ride in Asia". This is that bridge, at Demodara.
update public.posts
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'ultimate-10-day-sri-lanka-itinerary';

-- A season guide whose argument is "pick the right coast": the east coast in
-- its own season, at Arugam Bay.
update public.posts
   set image = '/photography/arugam-bay-beach-evening.jpg'
 where slug = 'when-to-visit-sri-lanka';

-- A leopard photographed in Yala, in a post comparing Yala with Wilpattu.
update public.posts
   set image = '/photography/yala-leopard.jpg'
 where slug = 'yala-vs-wilpattu-safari';

-- Coconut Tree Hill, Mirissa — on the stretch of south coast this post guides.
update public.posts
   set image = '/photography/mirissa-coconut-tree-hill.jpg'
 where slug = 'south-coast-beach-guide';

-- Verify: every row should now show a /photography/ path.
-- select slug, image from public.posts order by date desc;

-- ─────────────────────────────────────────────────────────────────────────────
-- Point every CMS-backed image at a self-hosted, location-verified photograph.
--
-- WHY THIS FILE EXISTS
-- seed.sql inserts with `on conflict (slug) do nothing`, so re-running it will
-- NOT change a row that already exists. Once `tours`, `destinations`,
-- `services`, `vehicles`, `posts` and `gallery` have been seeded, the site keeps
-- serving whatever those rows hold no matter what the TypeScript says — the data
-- layer reads Supabase first and falls back to lib/ only when a table is empty.
--
-- So the photo audit in the codebase is only half the work. This file is the
-- other half.
--
-- WHAT WAS WRONG
--
--   1. Availability. Almost every seeded image was hotlinked to
--      images.unsplash.com. A page asking for a dozen at once from one server IP
--      earns 429s; Next's image optimiser answers 400 and <Image> then renders
--      nothing — a blank tile, no error the visitor or the logs will show you.
--      Measured on this site: ten blank tiles on /tours in one run, five in the
--      next, six on the homepage in a third. It is intermittent, which is
--      exactly what makes it easy to miss.
--
--   2. Truth. None of those assets had a checked location. Several were not Sri
--      Lanka at all — the "highland railway" image is limestone karst with
--      long-tail boats, and it was serving as the hero of a journal post, a
--      gallery tile, the Ella day tour AND the site-wide social card.
--
--   3. Gaps. 'palmyra-and-pearl-northern-passage' was inserted with image = '',
--      so the one journey selling the north — the half of the island most
--      itineraries skip — has been rendering a gradient since it went live.
--
-- Every value below is served from /public: the crop, the compression and the
-- availability are ours, and no third party can withdraw or change them.
-- Provenance, licence and author for each are recorded in lib/media/registry.ts
-- (owner photography) and lib/media/commons.ts (CC BY / CC BY-SA, attributed on
-- the pages that use them).
--
-- ORDER OF OPERATIONS — this matters
--   1. Deploy the code first. These paths 404 until public/photography/ and
--      public/commons/ are live.
--   2. Then run this file, in the Supabase SQL editor or via psql.
--
-- SAFE TO RE-RUN. Every statement is idempotent, scoped to one row, and touches
-- only the image column (the gallery block also rewrites its caption, which is
-- the point). Nothing is deleted.
--
-- SUPERSEDES supabase/update-destination-images.sql and
-- supabase/update-post-images.sql — both are folded in here. Running them again
-- afterwards is harmless but pointless.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- TOURS
--
-- The six signature journeys are listed first. Five already carry the right
-- image from insert-premium-journeys.sql and are repeated here only so this
-- file is a complete statement of intent; the sixth is the empty-image fix.
-- ═══════════════════════════════════════════════════════════════════════════

update public.tours
   set image = '/photography/sigiriya-rock.jpg'
 where slug = 'cultural-odyssey';

update public.tours
   set image = '/photography/mirissa-coconut-tree-hill.jpg'
 where slug = 'sun-kissed-horizons-southern-escape';

update public.tours
   set image = '/photography/hill-country-train.jpg'
 where slug = 'luxe-serenity-in-the-hills';

update public.tours
   set image = '/photography/yala-leopard.jpg'
 where slug = 'leopard-light-safari-journey';

update public.tours
   set image = '/photography/whisky-point-lineup.jpg'
 where slug = 'salt-and-season-east-coast';

-- THE GAP. This row was inserted with an empty image and has been showing a
-- gradient ever since. Nallur Kandaswamy's gopuram is what the journey's own
-- copy promises, and it is the one image on the site that says "the north"
-- without needing a caption.
update public.tours
   set image = '/commons/nallur-kandasamy-front-entrance.jpg'
 where slug = 'palmyra-and-pearl-northern-passage';

-- The legacy catalogue. Ten of these twelve were remote Unsplash URLs.
--
-- Three were also duplicates *within the same grid* — the same photograph
-- appearing on two cards a few hundred pixels apart, which reads as a
-- duplicated listing rather than as two different journeys. Those three are
-- called out individually below.

-- Was the Nine Arch Bridge, which belongs to the Ella day tour further down the
-- same grid. This week ends on the south coast; Unawatuna is that finale.
update public.tours
   set image = '/commons/unawatuna.jpg'
 where slug = 'essential-sri-lanka-7-days';

update public.tours
   set image = '/commons/ruwanweli-maha-saaya.jpg'
 where slug = 'grand-island-circuit-14-days';

-- Lipton's Seat, above the Dambatenne estate — the view the itinerary's Day 5
-- actually describes.
update public.tours
   set image = '/commons/lipton-seat-sri-lanka.jpg'
 where slug = 'hill-country-tea-trails-5-days';

-- Bundala, not a leopard: this journey's own highlights list three parks, and
-- promising a leopard on the card of a trip that does not centre on Yala is the
-- kind of small overclaim that costs you a review.
update public.tours
   set image = '/commons/bundala-national-park.jpg'
 where slug = 'wild-coast-safari-beaches-10-days';

update public.tours
   set image = '/photography/arugam-bay.jpg'
 where slug = 'surf-soul-east-coast-8-days';

-- Was Sigiriya — which now leads The Cultural Odyssey higher up the same grid.
-- The Dambulla cave Buddhas are the half of this day trip nobody has already
-- seen on a postcard.
update public.tours
   set image = '/commons/buddha-statues-in-dambulla-sri-lanka-01.jpg'
 where slug = 'sigiriya-dambulla-day-tour';

update public.tours
   set image = '/photography/kandy-tooth-relic-temple.jpg'
 where slug = 'kandy-cultural-day-tour';

update public.tours
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'ella-nine-arch-day-tour';

update public.tours
   set image = '/photography/galle-fort-pedlar-street.jpg'
 where slug = 'galle-south-coast-day-tour';

-- Was the leopard portrait, which now leads Leopard Light in the same grid.
-- This card gets the jeeps: it is the day itself, and it promises something we
-- can actually deliver every time.
update public.tours
   set image = '/commons/safari-yala-np.jpg'
 where slug = 'yala-leopard-safari';

-- A wild elephant at Hurulu Eco Park, twenty minutes from Minneriya and the
-- overflow site the drivers use when the Minneriya herd moves.
update public.tours
   set image = '/commons/elephas-maximus-maximus-hurulu-eco-park-sri-lanka-20260201-1018-7843.jpg'
 where slug = 'minneriya-elephant-gathering';

update public.tours
   set image = '/commons/udawalawe-national-park-udawalawa-reservoir.jpg'
 where slug = 'udawalawe-elephant-safari';


-- ═══════════════════════════════════════════════════════════════════════════
-- DESTINATIONS
--
-- Eight of the nine were fixed by update-destination-images.sql. Nuwara Eliya
-- was deliberately left behind then, because no candidate photograph could be
-- tied to the place and a gradient beats a wrong caption. That is now resolved:
-- the Commons file is Nuwara Eliya, verified from the frame.
-- ═══════════════════════════════════════════════════════════════════════════

update public.destinations
   set image = '/photography/sigiriya-rock.jpg'
 where slug = 'sigiriya';

update public.destinations
   set image = '/photography/kandy-tooth-relic-temple.jpg'
 where slug = 'kandy';

update public.destinations
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'ella';

-- THE ONE THAT WAS STILL MISSING.
update public.destinations
   set image = '/commons/nuwaraeliya-from-top.jpg'
 where slug = 'nuwara-eliya';

update public.destinations
   set image = '/photography/yala-leopard.jpg'
 where slug = 'yala';

update public.destinations
   set image = '/photography/galle-fort-pedlar-street.jpg'
 where slug = 'galle';

update public.destinations
   set image = '/photography/mirissa-coconut-tree-hill.jpg'
 where slug = 'mirissa';

update public.destinations
   set image = '/photography/arugam-bay.jpg'
 where slug = 'arugam-bay';

update public.destinations
   set image = '/photography/colombo-lotus-tower.jpg'
 where slug = 'colombo';


-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICES
--
-- All six were remote stock of anonymous cars, roads and steering wheels. Each
-- now takes a photograph of a place the service actually goes.
-- ═══════════════════════════════════════════════════════════════════════════

-- Bandaranaike International is at Katunayake, on the Negombo lagoon — which is
-- both true and the first thing an arriving guest sees.
update public.services
   set image = '/commons/negambo-lagoon-sri-lanka-where-boats-come-to-rest.jpg'
 where slug = 'airport-transfers';

-- World's End: reachable in a day with a driver, and effectively not otherwise.
update public.services
   set image = '/commons/worlds-end-in-horton-plains-in-sri-lanka.jpg'
 where slug = 'private-driver-hire';

update public.services
   set image = '/photography/colombo-lotus-tower.jpg'
 where slug = 'taxi-services';

update public.services
   set image = '/photography/surf-right-hander.jpg'
 where slug = 'surf-transfers';

update public.services
   set image = '/commons/sri-lanka-bentota-beach-2.jpg'
 where slug = 'hotel-transfers';

-- Delft's wild ponies: the point of a custom itinerary is that it goes where a
-- packaged one doesn't.
update public.services
   set image = '/commons/ponies-of-the-delft-island.jpg'
 where slug = 'custom-itineraries';


-- ═══════════════════════════════════════════════════════════════════════════
-- VEHICLES (the /about fleet cards)
--
-- READ THIS ONE BEFORE YOU RUN IT.
--
-- Only 'safari-jeep' gets an actual vehicle photograph, and it is a Commons
-- image of open-top jeeps in Yala — unbranded, Sri Lankan plates, guests
-- aboard. There is no honest Commons or stock source for the other four: the
-- searches returned car-park snapshots (a Prado in Roseville, a Coaster in
-- Bangkok, a Serbian police Toyota), and one Yala jeep photo carried a
-- COMPETING OPERATOR's phone number and web address on the door.
--
-- So the remaining four take contextual island photography — the roads and
-- places each vehicle is for — rather than a stranger's car presented as yours.
-- That is a deliberate stopgap, not a finished answer. Four photographs of the
-- actual fleet, taken on a phone in good light, would beat every one of these,
-- and once you have them these four statements should be replaced.
-- ═══════════════════════════════════════════════════════════════════════════

update public.vehicles
   set image = '/photography/colombo-lotus-tower.jpg'
 where slug = 'executive-sedan';

update public.vehicles
   set image = '/commons/nuwaraeliya-from-top.jpg'
 where slug = 'premium-suv';

update public.vehicles
   set image = '/photography/whisky-point-lineup.jpg'
 where slug = 'high-roof-van';

update public.vehicles
   set image = '/commons/pasikudah-beach.jpg'
 where slug = 'mini-coach';

-- The only real vehicle photograph in this block.
update public.vehicles
   set image = '/commons/safari-yala-np.jpg'
 where slug = 'safari-jeep';


-- ═══════════════════════════════════════════════════════════════════════════
-- POSTS (the journal)
--
-- Identical to supabase/update-post-images.sql, repeated so this file is
-- self-sufficient. If you already ran that one, these four are no-ops.
-- ═══════════════════════════════════════════════════════════════════════════

update public.posts
   set image = '/photography/nine-arch-bridge-demodara.jpg'
 where slug = 'ultimate-10-day-sri-lanka-itinerary';

update public.posts
   set image = '/photography/arugam-bay-beach-evening.jpg'
 where slug = 'when-to-visit-sri-lanka';

update public.posts
   set image = '/photography/yala-leopard.jpg'
 where slug = 'yala-vs-wilpattu-safari';

update public.posts
   set image = '/photography/mirissa-coconut-tree-hill.jpg'
 where slug = 'south-coast-beach-guide';


-- ═══════════════════════════════════════════════════════════════════════════
-- GALLERY
--
-- Two things are different about this table.
--
--   1. It has no unique key — just a uuid primary key — so the seed's gallery
--      inserts carry no `on conflict` guard at all. Re-running seed.sql against
--      a seeded database DUPLICATES all twelve rows. Do not do that; run this
--      instead.
--
--   2. Matching is therefore on the old src, the only stable handle these rows
--      have. That is also what makes this safe: a statement can only touch a
--      row still holding one of the twelve original seeded URLs. Anything you
--      have added or edited through Admin → Content → Gallery is left alone.
--
-- Captions change too. The old ones described generic stock ("Dawn mist over
-- tea country", "Last light, west coast"); the new ones name the actual place,
-- which is the whole reason for replacing the photographs.
--
-- If a statement below reports 0 rows, that tile has already been edited in the
-- admin — check it there rather than forcing it.
-- ═══════════════════════════════════════════════════════════════════════════

update public.gallery
   set src = '/photography/nine-arch-bridge-demodara.jpg',
       caption = 'The Nine Arch Bridge, Demodara',
       category = 'Journeys'
 where src = 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2200&q=80';

update public.gallery
   set src = '/commons/goyambokka-beach-tangalle-sri-lanka.jpg',
       caption = 'Goyambokka Beach, Tangalle',
       category = 'Beaches'
 where src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';

update public.gallery
   set src = '/photography/yala-leopard.jpg',
       caption = 'Leopard, Yala National Park',
       category = 'Wildlife'
 where src = 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/commons/lipton-seat-sri-lanka.jpg',
       caption = 'Tea country from Lipton''s Seat, Haputale',
       category = 'Hills'
 where src = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/photography/sigiriya-rock.jpg',
       caption = 'Sigiriya — the Lion Rock',
       category = 'Culture'
 where src = 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/photography/surf-right-hander.jpg',
       caption = 'A clean right-hander, east coast',
       category = 'Surf'
 where src = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/commons/elephas-maximus-maximus-hurulu-eco-park-sri-lanka-20260201-1018-7843.jpg',
       caption = 'Wild elephant, Hurulu Eco Park',
       category = 'Wildlife'
 where src = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/photography/mirissa-coconut-tree-hill.jpg',
       caption = 'Coconut Tree Hill, Mirissa',
       category = 'Beaches'
 where src = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/photography/kandy-tooth-relic-temple.jpg',
       caption = 'The Temple of the Tooth, Kandy',
       category = 'Culture'
 where src = 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/commons/nuwaraeliya-from-top.jpg',
       caption = 'Nuwara Eliya from the ridge',
       category = 'Hills'
 where src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/commons/hikkaduwa-under-water.jpg',
       caption = 'The coral sanctuary at Hikkaduwa',
       category = 'Wildlife'
 where src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80';

update public.gallery
   set src = '/commons/negambo-lagoon-sri-lanka-where-boats-come-to-rest.jpg',
       caption = 'Fishing boats at rest, Negombo',
       category = 'Beaches'
 where src = 'https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=1600&q=80';


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY
--
-- The first query should return zero rows. If it returns any, that row was
-- edited in the admin at some point and this file's `where` clause missed it —
-- fix those few by hand in Admin → Content.
-- ═══════════════════════════════════════════════════════════════════════════

-- Anything still remote, or still empty:
select 'tours'        as tbl, slug as id, image from public.tours        where image is null or image = '' or image like 'http%'
union all
select 'destinations',        slug,       image from public.destinations where image is null or image = '' or image like 'http%'
union all
select 'services',            slug,       image from public.services     where image is null or image = '' or image like 'http%'
union all
select 'vehicles',            slug,       image from public.vehicles     where image is null or image = '' or image like 'http%'
union all
select 'posts',               slug,       image from public.posts        where image is null or image = '' or image like 'http%'
union all
select 'gallery',             caption,    src   from public.gallery      where src   is null or src   = '' or src   like 'http%';

-- And a sanity check that the gallery still has exactly twelve rows (more means
-- seed.sql was run twice at some point — see the note above):
-- select count(*) from public.gallery;

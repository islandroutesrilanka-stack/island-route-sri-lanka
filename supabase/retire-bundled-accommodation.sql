-- Retire the bundled-accommodation promise from the live catalogue.
--
-- The six signature journeys each opened their `includes` list with a hotel
-- line — "Boutique and heritage accommodation, breakfast daily" and its
-- siblings. That is the one thing in the list we do not actually supply: we
-- do not hold the rooms, take the money for them, or own the cancellation
-- terms. Pricing now sits on the transport day rate (US$80 car / US$120 van,
-- per vehicle, all-inclusive) and hotels are an opt-in service the booking
-- form asks about, so the catalogue has to stop saying otherwise.
--
-- The code side of this shipped with the same change; until this script is
-- run, tour pages read `includes` from the database and will keep showing the
-- old line. Safe to re-run: each statement is an idempotent overwrite.
--
-- `price_from` is deliberately left alone. Nothing reads it any more (see the
-- note in lib/data.ts) and the historic figures are worth keeping.

begin;

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide throughout", "Chartered licensed site guide at Anuradhapura and Polonnaruwa", "Cultural Triangle site tickets and temple donations", "All fuel, tolls, parking and the driver''s own costs", "A shortlist of heritage stays near each night''s stop, on request", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'cultural-odyssey';

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide throughout", "All fuel, tolls, parking and the driver''s own costs", "Private half-day cookery session with a local family", "Small-boat whale excursion with a licensed skipper (in season)", "Ayurvedic consultation and treatment at a certified centre", "Rekawa turtle watch with the conservation project''s ranger", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'sun-kissed-horizons-southern-escape';

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide throughout", "All fuel, tolls, parking and the driver''s own costs", "Reserved first-class observation seats, Haputale–Ella", "Private tea factory tour and a guided tasting with the estate''s taster", "Horton Plains park entry and a licensed nature guide", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'luxe-serenity-in-the-hills';

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide between parks", "Private 4x4 jeep and tracker for every game drive", "All national park entry fees and permits", "All fuel, tolls, parking and the driver''s own costs", "Dawn departures timed to the park gates, water and a cool box in the jeep", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'leopard-light-safari-journey';

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide throughout", "All fuel, tolls, parking and the driver''s own costs", "Snorkelling boat and equipment at Pigeon Island", "Guided lagoon paddle at Pottuvil", "Surf guiding and board hire at Arugam Bay", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'salt-and-season-east-coast';

update public.tours set includes = '["Private A/C vehicle & chauffeur-guide throughout", "All fuel, tolls, parking and the driver''s own costs", "Tamil-speaking guide for the peninsula", "Delft and Nagadeepa ferry crossings, arranged and timed", "Private jeep and tracker for the Wilpattu game drive", "Airport pickup & drop-off, bottled water daily", "24/7 WhatsApp support"]'::jsonb where slug = 'palmyra-and-pearl-northern-passage';

commit;

-- Check: no row should mention guest accommodation any more.
-- select slug, includes from public.tours
-- where includes::text ilike '%breakfast daily%'
--    or includes::text ilike '%full board%';

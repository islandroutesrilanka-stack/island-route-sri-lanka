-- Say what the sedan actually seats.
--
-- "Comfort · up to 3 guests" is true and useless: it reads as three people
-- full stop, so a couple travelling with two children books a van they do not
-- need, or writes to ask. Three seats is three adults or two adults with up to
-- three children, and that is the sentence families are looking for.
--
-- The long form itself lives in code (`seating()` in lib/content.ts), keyed by
-- slug, so it renders correctly on /about and the homepage strip whether or not
-- this script has run. What is stored here is the short category line and the
-- ideal-for sentence, which are CMS-editable and therefore have to be updated
-- in the table. Safe to re-run.

update public.vehicles
set category = 'Comfort · 3 adults, or a family with children',
    ideal_for = 'Couples, business travellers, and families travelling with young children.'
where slug = 'executive-sedan';

-- Check:
-- select slug, category, passengers, ideal_for from public.vehicles
-- where slug = 'executive-sedan';

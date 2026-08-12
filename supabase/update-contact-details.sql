-- ─────────────────────────────────────────────────────────────────────────────
-- Point the live site at the new contact number.
--
-- WHY THIS FILE EXISTS
-- lib/site.ts is only the fallback. Once `public.site_settings` has rows, the
-- header, footer, contact page, booking confirmations and the WhatsApp button
-- all read the database — so editing lib/site.ts alone changes nothing on a
-- deployed site.
--
-- seed.sql already carries the new number and its site_settings statements DO
-- upsert (`on conflict (key) do update`), so re-running the whole seed would
-- also work. This file exists so you don't have to: it touches four rows and
-- leaves tours, posts, destinations and gallery completely alone. It also has
-- to exist for the driver row — see the note above that statement.
--
-- WHAT CHANGES
--   site_settings.phone_display    +94 77 801 0391  →  +94 77 106 6677
--   site_settings.phone_e164       +94778010391     →  +94771066677
--   site_settings.whatsapp_number  94778010391      →  94771066677
--   drivers.phone                  +94778010391     →  +94771066677
--
-- The first three formats are the same number written three ways: spaced for
-- reading, E.164 for `tel:` links, and bare digits because that is what wa.me
-- expects after the slash. A `+` or a space in whatsapp_number produces a dead
-- link.
--
-- Run this in the Supabase SQL editor, or edit the same fields under
-- Admin → Settings → Contact details and Admin → Drivers. Either is fine; this
-- is just faster.
--
-- SAFE TO RE-RUN. Idempotent, four statements, no deletes.
--
-- NOT INCLUDED — deliberately:
--   • Instagram, Facebook and the WhatsApp user ID are not database-backed.
--     They live in lib/site.ts (`socialProfiles`) and ship with a deploy.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.site_settings (key, value)
values ('phone_display', '+94 77 106 6677')
    on conflict (key) do update set value = excluded.value;

insert into public.site_settings (key, value)
values ('phone_e164', '+94771066677')
    on conflict (key) do update set value = excluded.value;

insert into public.site_settings (key, value)
values ('whatsapp_number', '94771066677')
    on conflict (key) do update set value = excluded.value;

-- ── The driver roster ────────────────────────────────────────────────────────
-- seed.sql now carries the correct number, but its driver statements are
-- guarded by `where not exists (... name = 'Gayan')` — they create the row and
-- then never touch it again, so on an already-seeded database re-running the
-- seed leaves the stale number in place. This UPDATE is the only thing that
-- corrects it.
--
-- Matched on the old number rather than on the name, because the number is what
-- is actually wrong: this fixes the row whatever it has since been renamed to,
-- touches nothing else in the roster, and is a no-op once it has run.
update public.drivers
   set phone = '+94771066677'
 where phone = '+94778010391';

-- ── Verify ───────────────────────────────────────────────────────────────────
-- The three settings rows should show the new number...
-- select key, value from public.site_settings
--  where key in ('phone_display', 'phone_e164', 'whatsapp_number');
--
-- ...and this should return no rows at all.
-- select id, name, phone from public.drivers where phone = '+94778010391';

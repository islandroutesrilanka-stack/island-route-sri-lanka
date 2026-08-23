-- ============================================================================
-- Storage policies for the `media` bucket
-- ============================================================================
--
-- Run this ONCE in the Supabase SQL editor, then reload the admin.
--
-- Why this file exists
-- --------------------
-- The `media` bucket already exists and already serves public reads — the hero
-- film, its mobile cut and its poster are fetched from it anonymously on every
-- visit, so `select` is clearly permitted. What was never established is
-- `insert`: every file in there so far was put there by hand, through the
-- Supabase dashboard, which runs as the service role and bypasses row-level
-- security entirely.
--
-- The image picker in the admin does not. It uploads as the signed-in admin
-- through the anon key, so `storage.objects` RLS applies, and without an insert
-- policy every upload fails with:
--
--     new row violates row-level security policy for table "objects"
--
-- That message is shown verbatim under the field, so this is diagnosable rather
-- than mysterious — but it is still a wall, and this file is the way through
-- it. If uploads already work, running this changes nothing: the policies are
-- dropped and recreated with the same names.
--
-- What it grants
-- --------------
-- Public read of the bucket (already true in practice; stated here so the rule
-- lives in version control rather than only in a dashboard toggle), and insert,
-- update and delete for admins only — the same `public.is_admin()` gate that
-- guards every content table in schema.sql, so a signed-in non-admin cannot
-- write files any more than they can write journeys.
--
-- Scoped to `bucket_id = 'media'`. Nothing here touches any other bucket.
-- ============================================================================

-- The bucket itself: created if missing, and marked public either way, since
-- every URL the site renders is a public one.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Anyone may read. This is what makes getPublicUrl() links work in an <img>.
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- Only admins may add, replace or remove files.
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

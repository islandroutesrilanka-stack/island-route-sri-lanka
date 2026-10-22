-- ============================================================================
-- Gallery: the columns a photograph needs to be shown well
-- ============================================================================
--
-- Run this ONCE in the Supabase SQL editor, before running
-- `node scripts/upload-photography.mjs`.
--
-- Why
-- ---
-- The `gallery` table was built for a seeded list of a dozen stock frames:
-- a URL, a caption, a category. That is enough to put a picture on a page and
-- not enough to put it there *well*. Four things were missing, and each one is
-- a visible defect rather than a nicety:
--
--   alt              Without it the caption gets reused as alt text, which is
--                    wrong twice over: a screen reader hears the same sentence
--                    the sighted visitor already read, and the caption is
--                    written to be read *alongside* the image, so it describes
--                    the moment rather than the picture. They are different
--                    jobs and need different words.
--
--   width, height    The grid had no idea what shape a photograph was, so it
--                    assigned one by position — every third frame cropped to
--                    3:4, the next to a square, the next to 4:3. A portrait
--                    photograph landing in a 4:3 cell loses the top and bottom
--                    of itself. Storing the real pixel dimensions is what lets
--                    the grid lay each frame out as the shape it actually is.
--
--   blur_data_url    A tiny inlined JPEG, around 1KB, that next/image paints
--                    immediately and cross-fades out of. Without it a gallery
--                    of large photographs loads as a page of grey rectangles.
--
--   place            A place name on this site means a human confirmed the
--                    photograph shows where it claims to. Most of this
--                    collection arrived as UUID filenames carrying no such
--                    confirmation, so this column is null far more often than
--                    not, and that is the point: a frame without a confirmed
--                    place gets described by its subject instead of being
--                    quietly captioned with a guess.
--
-- And one key:
--
--   slug             Storage paths are derived from it, so it is how a re-run
--                    of the uploader updates a row instead of inserting a
--                    second copy of the same photograph. Unique, and the
--                    uploader's `on conflict` target.
--
-- Safe to re-run. Every statement is idempotent; no existing row is rewritten
-- except to backfill `alt` from `caption` where alt is still empty, which is a
-- strict improvement over inheriting it at render time.
-- ============================================================================

alter table public.gallery add column if not exists slug text;
alter table public.gallery add column if not exists alt text;
alter table public.gallery add column if not exists width int;
alter table public.gallery add column if not exists height int;
alter table public.gallery add column if not exists blur_data_url text;
alter table public.gallery add column if not exists place text;

-- Existing seeded rows have no slug. Derive one from the filename so the
-- unique index below can be created without a conflict, and so a later upload
-- of the same photograph updates the row it belongs to.
update public.gallery
set slug = lower(regexp_replace(
      regexp_replace(
        regexp_replace(split_part(src, '?', 1), '^.*/', ''),  -- filename
        '\.[a-zA-Z0-9]+$', ''                                 -- drop extension
      ),
      '[^a-zA-Z0-9]+', '-', 'g'
    ))
where slug is null or slug = '';

-- Any that still collide (two rows pointing at the same file) get a suffix,
-- rather than the index creation failing and leaving the migration half done.
with dupes as (
  select id, slug,
         row_number() over (partition by slug order by sort, id) as rn
  from public.gallery
)
update public.gallery g
set slug = g.slug || '-' || d.rn
from dupes d
where g.id = d.id and d.rn > 1;

create unique index if not exists gallery_slug_key on public.gallery (slug);

-- Alt text is required for every image the site ships. Where a row has only a
-- caption, use it rather than render an image with no alt at all; the uploader
-- writes a purpose-written alt for everything it touches.
update public.gallery
set alt = caption
where (alt is null or alt = '') and caption is not null and caption <> '';

-- The gallery page reads published rows in sort order and nothing else.
create index if not exists gallery_published_sort_idx
  on public.gallery (published, sort);

comment on column public.gallery.slug is
  'Stable key. Storage path is photography/<folder>/<slug>.jpg; the uploader upserts on this.';
comment on column public.gallery.alt is
  'Describes the image for a screen reader. Never a copy of the caption.';
comment on column public.gallery.width is
  'Real pixel width of the stored file. The grid lays frames out from this.';
comment on column public.gallery.height is
  'Real pixel height of the stored file.';
comment on column public.gallery.blur_data_url is
  'Inlined data: URI, ~1KB, used as the next/image blur placeholder.';
comment on column public.gallery.place is
  'Confirmed place name, or null. Null means the location was never verified — describe the subject instead of naming a place.';

-- RLS is already in force on this table from schema.sql: gallery_public_read
-- (published = true or is_admin()) and gallery_admin_write (is_admin()).
-- Adding columns does not change either policy, and nothing here needs to.

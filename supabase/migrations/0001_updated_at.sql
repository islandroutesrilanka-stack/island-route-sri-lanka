-- ============================================================
-- 0001 — updated_at tracking on all content tables
--
-- Phase 0. Purely additive and idempotent: safe to run repeatedly,
-- and safe to run against a database that already holds live content.
-- Nothing is dropped and no existing column is altered.
--
-- Why: sitemap.xml previously reported `lastModified: new Date()` for every
-- URL on every crawl, which tells Google the entire site changed today, every
-- day. That devalues the signal precisely when you want it working. Real
-- timestamps also unlock "recently updated" ordering in the admin and any
-- future cache-invalidation work.
--
-- Run in the Supabase SQL Editor (Dashboard → SQL → New query).
-- ============================================================

-- ------------------------- Shared trigger function -------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------- Add the column + trigger everywhere -------------------

do $$
declare
  t text;
  content_tables text[] := array[
    'tours',
    'destinations',
    'services',
    'vehicles',
    'drivers',
    'reviews',
    'posts',
    'gallery'
  ];
begin
  foreach t in array content_tables loop
    -- Only touch tables that actually exist, so this migration stays safe
    -- if it is ever run before schema.sql on a fresh project.
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    execute format(
      'alter table public.%I add column if not exists updated_at timestamptz not null default now()',
      t
    );

    -- Backfill from created_at where that column exists, so existing rows get
    -- a plausible timestamp rather than all claiming to have changed at
    -- migration time.
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'created_at'
    ) then
      execute format(
        'update public.%I set updated_at = created_at where updated_at is not null and created_at is not null',
        t
      );
    end if;

    execute format('drop trigger if exists set_updated_at_on_%I on public.%I', t, t);
    execute format(
      'create trigger set_updated_at_on_%I before update on public.%I
         for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- site_settings is keyed differently and has no timestamps at all yet.
alter table public.site_settings
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_updated_at_on_site_settings on public.site_settings;
create trigger set_updated_at_on_site_settings
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------- Supporting indexes ---------------------------

create index if not exists tours_updated_at_idx        on public.tours (updated_at desc);
create index if not exists destinations_updated_at_idx on public.destinations (updated_at desc);
create index if not exists posts_updated_at_idx        on public.posts (updated_at desc);

-- Sitemap reads (published rows, slug + updated_at) hit these.
create index if not exists tours_published_idx        on public.tours (published);
create index if not exists destinations_published_idx on public.destinations (published);
create index if not exists posts_published_idx        on public.posts (published);

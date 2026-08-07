-- ============================================================
-- Island Route Sri Lanka — Database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------- Profiles & roles -------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer', -- 'admin' | 'customer'
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ------------------------------ Content -----------------------------

create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Day Tour', -- Day Tour | Multi-Day | Safari
  duration text,
  price_from numeric,
  image text,
  excerpt text,
  highlights jsonb not null default '[]',
  includes jsonb not null default '[]',
  itinerary jsonb, -- [{day,title,detail}]
  featured boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  region text,
  headline text,
  description text,
  best_for jsonb not null default '[]',
  best_time text,
  highlights jsonb not null default '[]',
  image text,
  published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  image text,
  icon text default 'car',
  published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text,
  passengers int default 3,
  luggage text,
  features jsonb not null default '[]',
  ideal_for text,
  image text,
  published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  languages jsonb not null default '[]',
  notes text,
  active boolean not null default true
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  trip text,
  rating int not null default 5 check (rating between 1 and 5),
  text text not null,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  date date not null default current_date,
  read_time text,
  image text,
  sections jsonb not null default '[]', -- [{heading?, body}]
  published boolean not null default true
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  caption text,
  category text default 'Beaches',
  published boolean not null default true,
  sort int not null default 0
);

create table if not exists public.site_settings (
  key text primary key,
  value text
);

-- --------------------------- Operations ----------------------------

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  service text,
  tour_title text,
  travel_date date,
  end_date date,
  travellers text,
  message text,
  status text not null default 'new', -- new | quoted | confirmed | completed | cancelled
  vehicle_id uuid references public.vehicles on delete set null,
  driver_id uuid references public.drivers on delete set null,
  quote_amount numeric,
  currency text not null default 'USD',
  admin_notes text
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text,
  status text not null default 'new', -- new | replied | closed
  admin_notes text
);

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('vehicle','driver')),
  resource_id uuid not null,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_travel_date_idx on public.bookings (travel_date);
create index if not exists blocks_resource_idx on public.availability_blocks (resource_type, resource_id);

-- ------------------------------- RLS --------------------------------

alter table public.profiles enable row level security;
alter table public.tours enable row level security;
alter table public.destinations enable row level security;
alter table public.services enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.reviews enable row level security;
alter table public.posts enable row level security;
alter table public.gallery enable row level security;
alter table public.site_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.inquiries enable row level security;
alter table public.availability_blocks enable row level security;

-- Profiles: user can read own; admin reads all
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Published content readable by everyone; admins manage everything
do $$
declare t text;
begin
  foreach t in array array['tours','destinations','services','vehicles','reviews','posts','gallery'] loop
    execute format('drop policy if exists "%s_public_read" on public.%I', t, t);
    execute format(
      'create policy "%s_public_read" on public.%I for select using (published = true or public.is_admin())', t, t);
    execute format('drop policy if exists "%s_admin_write" on public.%I', t, t);
    execute format(
      'create policy "%s_admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Settings: public read, admin write
drop policy if exists "settings_read" on public.site_settings;
create policy "settings_read" on public.site_settings for select using (true);
drop policy if exists "settings_write" on public.site_settings;
create policy "settings_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Drivers: admin only
drop policy if exists "drivers_admin" on public.drivers;
create policy "drivers_admin" on public.drivers
  for all using (public.is_admin()) with check (public.is_admin());

-- Bookings & inquiries: anyone may create; only admins may read/manage
drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings for insert with check (true);
drop policy if exists "bookings_admin" on public.bookings;
create policy "bookings_admin" on public.bookings
  for select using (public.is_admin());
drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings
  for update using (public.is_admin());
drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete" on public.bookings
  for delete using (public.is_admin());

drop policy if exists "inquiries_insert" on public.inquiries;
create policy "inquiries_insert" on public.inquiries for insert with check (true);
drop policy if exists "inquiries_admin" on public.inquiries;
create policy "inquiries_admin" on public.inquiries
  for select using (public.is_admin());
drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update" on public.inquiries
  for update using (public.is_admin());
drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete" on public.inquiries
  for delete using (public.is_admin());

-- Availability blocks: admin only
drop policy if exists "blocks_admin" on public.availability_blocks;
create policy "blocks_admin" on public.availability_blocks
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- After creating your admin user (Authentication → Users → Add user),
-- promote it by running:
--   update public.profiles set role = 'admin' where email = 'islandroutesrilanka@gmail.com';
-- ============================================================

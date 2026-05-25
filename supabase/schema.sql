-- LIAMS: run in Supabase SQL Editor after creating your project.
-- Also create Storage bucket "event-images" (public) in the dashboard.

-- Tables
create table if not exists announcements (
  id bigint generated always as identity primary key,
  text text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists upcoming_events (
  id bigint generated always as identity primary key,
  title text not null,
  event_date date,
  venue text,
  form_link text,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists previous_events (
  id bigint generated always as identity primary key,
  image_url text,
  category text,
  caption text,
  created_at timestamptz default now()
);

create table if not exists certifications (
  id bigint generated always as identity primary key,
  title text not null,
  drive_link text,
  created_at timestamptz default now()
);

-- Flexible site-wide settings (section titles, future module labels)
create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into site_settings (key, value)
values ('certifications_section_title', 'Certifications')
on conflict (key) do nothing;

-- Row Level Security
alter table announcements enable row level security;
alter table upcoming_events enable row level security;
alter table previous_events enable row level security;
alter table certifications enable row level security;
alter table site_settings enable row level security;

-- announcements
drop policy if exists "Public read enabled announcements" on announcements;
create policy "Public read enabled announcements"
  on announcements for select
  to anon
  using (enabled = true);

drop policy if exists "Admin full access announcements" on announcements;
create policy "Admin full access announcements"
  on announcements for all
  to authenticated
  using (true)
  with check (true);

-- upcoming_events
drop policy if exists "Public read enabled upcoming_events" on upcoming_events;
create policy "Public read enabled upcoming_events"
  on upcoming_events for select
  to anon
  using (enabled = true);

drop policy if exists "Admin full access upcoming_events" on upcoming_events;
create policy "Admin full access upcoming_events"
  on upcoming_events for all
  to authenticated
  using (true)
  with check (true);

-- previous_events
drop policy if exists "Public read previous_events" on previous_events;
create policy "Public read previous_events"
  on previous_events for select
  to anon
  using (true);

drop policy if exists "Admin full access previous_events" on previous_events;
create policy "Admin full access previous_events"
  on previous_events for all
  to authenticated
  using (true)
  with check (true);

-- certifications
drop policy if exists "Public read certifications" on certifications;
create policy "Public read certifications"
  on certifications for select
  to anon
  using (true);

drop policy if exists "Admin full access certifications" on certifications;
create policy "Admin full access certifications"
  on certifications for all
  to authenticated
  using (true)
  with check (true);

-- site_settings
drop policy if exists "Public read site_settings" on site_settings;
create policy "Public read site_settings"
  on site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin write site_settings" on site_settings;
create policy "Admin write site_settings"
  on site_settings for all
  to authenticated
  using (true)
  with check (true);

-- Storage: run after creating public bucket "event-images"
-- Storage → Policies → New policy, or use SQL below if your project supports it:

-- create policy "Public read event images"
--   on storage.objects for select
--   to anon
--   using (bucket_id = 'event-images');

-- create policy "Admin upload event images"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'event-images');

-- create policy "Admin update event images"
--   on storage.objects for update
--   to authenticated
--   using (bucket_id = 'event-images');

-- create policy "Admin delete event images"
--   on storage.objects for delete
--   to authenticated
--   using (bucket_id = 'event-images');

-- =========================
-- EXTENSION
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- TABLES
-- =========================

create table if not exists public.admin_users (
  id bigint generated always as identity primary key,

  auth_user_id uuid unique references auth.users(id) on delete cascade,

  email text not null unique,
  full_name text,

  role text default 'admin'
    check (role in ('super_admin', 'admin')),

  is_active boolean default true,
  last_login timestamptz,
  failed_login_attempts integer default 0,
  lock_until timestamptz,

  avatar_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,

  user_id uuid default auth.uid() references auth.users(id) on delete set null,

  action text not null,
  ip_address text,
  user_agent text,

  created_at timestamptz default now()
);

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_admin_users_email
on public.admin_users(email);

create index if not exists idx_admin_users_auth_user_id
on public.admin_users(auth_user_id);

create index if not exists idx_audit_logs_user_id
on public.audit_logs(user_id);

create index if not exists idx_audit_logs_created_at
on public.audit_logs(created_at);

-- =========================
-- ENABLE RLS
-- =========================

alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- =========================
-- CLEAN OLD POLICIES (IMPORTANT)
-- =========================

drop policy if exists "Admins can view their own profile" on public.admin_users;
drop policy if exists "Admins can update their own profile" on public.admin_users;
drop policy if exists "Super admins can view all profiles" on public.admin_users;
drop policy if exists "Only super admins can modify everything" on public.admin_users;

drop policy if exists "Admins can view audit logs" on public.audit_logs;
drop policy if exists "Allow insert audit logs" on public.audit_logs;

-- =========================
-- SAFE POLICIES (NO RECURSION)
-- =========================

-- ✅ Own data access
drop policy if exists "Users can view own profile" on public.admin_users;
create policy "Users can view own profile"
on public.admin_users
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "Users can update own profile" on public.admin_users;
create policy "Users can update own profile"
on public.admin_users
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- 🔥 TEMP FULL ACCESS (IMPORTANT FOR NOW)
drop policy if exists "TEMP full access" on public.admin_users;
create policy "TEMP full access"
on public.admin_users
for all
to authenticated
using (true)
with check (true);

-- =========================
-- AUDIT LOG POLICIES
-- =========================

drop policy if exists "Allow insert audit logs" on public.audit_logs;
create policy "Allow insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "Allow read audit logs" on public.audit_logs;
create policy "Allow read audit logs"
on public.audit_logs
for select
to authenticated
using (true);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_admin_users_updated_at on public.admin_users;

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute procedure public.set_updated_at();

-- =========================
-- AUTH → ADMIN SYNC
-- =========================

create or replace function public.handle_new_admin()
returns trigger as $$
declare
  is_first_user boolean;
begin
  select count(*) = 0 into is_first_user from public.admin_users;

  if (coalesce(new.raw_user_meta_data->>'is_admin', 'false') = 'true')
     or is_first_user then

    insert into public.admin_users (
      auth_user_id,
      email,
      full_name,
      role,
      is_active
    )
    values (
      new.id,
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data->>'full_name', 'Admin User'),
      case when is_first_user then 'super_admin' else 'admin' end,
      true
    )
    on conflict (auth_user_id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_admin();

-- =========================
-- ENSURE USER EXISTS IN admin_users
-- =========================

insert into public.admin_users (
  auth_user_id,
  email,
  full_name,
  role,
  is_active
)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'full_name', 'Secretary'),
  case 
    when not exists (select 1 from public.admin_users) then 'super_admin'
    else 'admin'
  end,
  true
from auth.users u
where u.email = 'secretary.liams@gmail.com'

on conflict (auth_user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = case
    when public.admin_users.role = 'super_admin' then 'super_admin'
    else excluded.role
  end,
  is_active = true,
  updated_at = now();
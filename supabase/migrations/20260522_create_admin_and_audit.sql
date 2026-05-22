-- SQL Migration: Admin Users & Audit Logs Setup
-- Path: supabase/migrations/20260522_create_admin_and_audit.sql

-- 1. Create tables
create table if not exists public.admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text default 'viewer' check (role in ('super_admin', 'admin', 'editor', 'viewer')),
  is_active boolean default true,
  last_login timestamptz,
  failed_login_attempts integer default 0,
  lock_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  avatar_url text
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Create indices for query optimization
create index if not exists idx_admin_users_email on public.admin_users(email);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

-- 2. Row Level Security (RLS) Configuration
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

-- Policies for admin_users
create policy "Admins can view their own profile"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can update their own profile"
  on public.admin_users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Super admins and admins can view all profiles"
  on public.admin_users for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

create policy "Only super admins can modify roles and statuses"
  on public.admin_users for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Policies for audit_logs
create policy "Only super admins and admins can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role in ('super_admin', 'admin')
    )
  );

-- 3. Sync Trigger from auth.users to public.admin_users
create or replace function public.handle_new_admin()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the very first user in admin_users
  select (count(*) = 0) into is_first_user from public.admin_users;

  -- Sync only if explicitly marked as admin in metadata OR if it's the first bootstrapping user
  if (new.raw_user_meta_data->>'is_admin' = 'true') or is_first_user then
    insert into public.admin_users (id, email, full_name, role, is_active)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', 'Bootstrap Admin'),
      case when is_first_user then 'super_admin' else 'admin' end,
      true
    )
    on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists first to make it idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_admin();

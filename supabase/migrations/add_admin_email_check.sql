-- Verifies an email exists in Supabase Auth before sending a password reset.
-- Run in Supabase SQL Editor (required for forgot-password admin email check).

create or replace function public.is_registered_admin_email(check_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(check_email))
  );
$$;

revoke all on function public.is_registered_admin_email(text) from public;
grant execute on function public.is_registered_admin_email(text) to anon, authenticated;

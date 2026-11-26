-- Public demo requests with an admin-only review workflow.
-- Run once in Supabase SQL Editor as the postgres role.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'demo_request_status') then
    create type public.demo_request_status as enum (
      'new',
      'contacted',
      'scheduled',
      'closed'
    );
  end if;
end
$$;

create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  student_name text not null,
  email text not null,
  phone text,
  student_age integer check (student_age between 6 and 21),
  country text not null,
  time_zone text not null default 'UTC',
  goals text not null,
  preferred_schedule text not null,
  status public.demo_request_status not null default 'new',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists demo_requests_status_idx
  on public.demo_requests (status);
create index if not exists demo_requests_created_at_idx
  on public.demo_requests (created_at desc);
create index if not exists demo_requests_email_idx
  on public.demo_requests (lower(email));

alter table public.demo_requests enable row level security;

drop policy if exists "demo_requests_select_admin" on public.demo_requests;
create policy "demo_requests_select_admin"
on public.demo_requests for select
using (private.is_admin());

drop policy if exists "demo_requests_update_admin" on public.demo_requests;
create policy "demo_requests_update_admin"
on public.demo_requests for update
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "demo_requests_delete_admin" on public.demo_requests;
create policy "demo_requests_delete_admin"
on public.demo_requests for delete
using (private.is_admin());

grant select, update, delete on public.demo_requests to authenticated;
grant all on public.demo_requests to service_role;

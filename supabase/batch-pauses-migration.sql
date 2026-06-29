-- Adds temporary schedule pauses without deleting or shortening the course.
-- Run once in Supabase SQL Editor using the postgres role.

create table if not exists public.batch_pauses (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  starts_on date not null,
  resumes_on date not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  constraint batch_pauses_valid_range check (resumes_on > starts_on)
);

create index if not exists batch_pauses_batch_dates_idx
  on public.batch_pauses(batch_id, starts_on, resumes_on);

alter table public.batch_pauses enable row level security;

drop policy if exists "batch_pauses_select_student_batch_or_admin" on public.batch_pauses;
create policy "batch_pauses_select_student_batch_or_admin"
on public.batch_pauses for select
using (batch_id = private.current_student_batch_id() or private.is_admin());

drop policy if exists "batch_pauses_write_admin" on public.batch_pauses;
create policy "batch_pauses_write_admin"
on public.batch_pauses for all
using (private.is_admin())
with check (private.is_admin());

grant select, insert, update, delete on public.batch_pauses to authenticated;
grant select, insert, update, delete on public.batch_pauses to service_role;

notify pgrst, 'reload schema';

